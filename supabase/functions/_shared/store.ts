// Paddle Billing (the store) → `licenses` rows. Pure helpers for the paddle-webhook function:
// the signature check and what each event does to the table. WebCrypto only, so it runs in
// Supabase Edge Functions (Deno) and in Node tests alike.
//
// A notification is a POST of JSON with `Paddle-Signature: ts=<unix seconds>;h1=<hex>`, where
// h1 is the HMAC-SHA256 of `<ts>:<raw body>` under the destination's secret key (two h1 while a
// secret is being rotated). The parts read here:
//   { event_id, event_type: "transaction.completed",
//     data: { id: "txn_…", status, customer_id, custom_data, items: [{ quantity, price: { product_id } }] } }
//   { event_type: "adjustment.created" | "adjustment.updated",
//     data: { id: "adj_…", action: "refund" | "chargeback" | …, type: "full" | "partial", status, transaction_id } }

import { isEmail } from "./email.ts";

/** Devices one Pro purchase covers (`site.ts`'s DEVICES); `quantity` copies cover that many times more. */
export const DEVICES_PER_COPY = 3;

/** How old a signed notification may be. Paddle signs every attempt afresh, so this only bounds replays. */
export const SIGNATURE_MAX_AGE_S = 5 * 60;

const hexBytes = (hex: string) => Uint8Array.from(hex.match(/../g) ?? [], (h) => parseInt(h, 16));

/**
 * Whether `header` (the `Paddle-Signature` header) signs `body` (the raw request bytes) under
 * `secret`, at most `SIGNATURE_MAX_AGE_S` from `now` (unix seconds). `crypto.subtle.verify`
 * compares in constant time.
 */
export async function verifySignature(
  secret: string,
  body: Uint8Array,
  header: string | null,
  now = Math.floor(Date.now() / 1000),
): Promise<boolean> {
  if (!secret || !header) return false;
  const parts = header.split(";").map((p) => p.trim().split("="));
  const ts = parts.find(([k]) => k === "ts")?.[1] ?? "";
  const sigs = parts.filter(([k, v]) => k === "h1" && /^[0-9a-f]{64}$/i.test(v ?? "")).map(([, v]) => v);
  if (!/^\d{1,12}$/.test(ts) || !sigs.length || Math.abs(now - Number(ts)) > SIGNATURE_MAX_AGE_S) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const prefix = new TextEncoder().encode(`${ts}:`);
  const signed = new Uint8Array(prefix.length + body.length);
  signed.set(prefix);
  signed.set(body, prefix.length);
  for (const sig of sigs) if (await crypto.subtle.verify("HMAC", key, hexBytes(sig), signed)) return true;
  return false;
}

/** A new license id: `lic_` + 9 random bytes, base64url (as ddugit `scripts/license.mjs`). */
export function newLicenseId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  return `lic_${btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")}`;
}

/** The parts of a notification the function reads; everything else is ignored. */
export interface StoreEvent {
  event_id?: string;
  event_type?: string;
  data?: {
    id?: string;
    status?: string;
    customer_id?: string | null;
    custom_data?: Record<string, unknown> | null;
    items?: { quantity?: number | null; price?: { product_id?: string | null } | null }[] | null;
    // adjustments
    action?: string;
    type?: string;
    transaction_id?: string;
  };
}

/** A `licenses` row as the webhook writes it (the id is added on insert). */
export interface PurchaseRow {
  email: string;
  name: string;
  kind: "personal";
  plan: "lifetime";
  status: "active";
  seats: 1;
  max_devices: number;
  /** Lifetime licenses are signed per device at activation: no stored text. */
  text: null;
  store_order_id: string;
  store_test: boolean;
}

/**
 * What a notification does:
 * - `create`: a paid Pro transaction. Insert its row unless it already has one (retries), then
 *   apply a refund recorded for it before it arrived (`store_refunds`: deliveries can come out of order).
 *   `email` is null when the site didn't pass the buyer's login; the function then asks Paddle
 *   for the customer's email (`customer`).
 * - `refund`: an approved full refund or chargeback of transaction `order`. Record it, and mark the order's row refunded.
 * - `ignore`: answer 200 and change nothing (other events, other products, partial refunds), with why.
 */
export type Decision =
  | { action: "create"; order: string; customer: string | null; email: string | null; copies: number }
  | { action: "refund"; order: string }
  | { action: "ignore"; reason: string };

export type Purchase = Extract<Decision, { action: "create" }>;

/**
 * PADDLE_PRODUCT_ID: the Paddle products (`pro_…`) that are ddugit Pro, comma-separated.
 * Required: with none, the webhook refuses to make licenses (any product in the store would).
 */
export const productIds = (raw: string | null | undefined) =>
  (raw ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

/** Adjustments that take a license back once approved. */
const TAKE_BACK = new Set(["refund", "chargeback"]);

/** The decision for one notification. Transactions with no item in `products` are ignored, and with an empty list every one is. */
export function decide(event: StoreEvent, products: readonly string[]): Decision {
  const type = event.event_type ?? "";
  const d = event.data;
  if (!d) return { action: "ignore", reason: "no data" };

  if (type === "adjustment.created" || type === "adjustment.updated") {
    if (!TAKE_BACK.has(d.action ?? "")) return { action: "ignore", reason: `adjustment ${d.action}` };
    if (d.status !== "approved") return { action: "ignore", reason: `adjustment ${d.status}` };
    // Only a full refund takes the license back; a partial one (e.g. tax) leaves it.
    if (d.type === "partial") return { action: "ignore", reason: "partial adjustment" };
    if (!d.transaction_id) return { action: "ignore", reason: "no transaction" };
    return { action: "refund", order: d.transaction_id };
  }

  if (type !== "transaction.completed") return { action: "ignore", reason: `event ${type}` };
  if (!d.id) return { action: "ignore", reason: "no transaction id" };
  const ours = (d.items ?? []).filter((i) => products.includes(i.price?.product_id ?? ""));
  if (!ours.length) return { action: "ignore", reason: "another product" };

  const copies = ours.reduce((n, i) => n + Math.max(1, Math.floor(Number(i.quantity) || 1)), 0);
  const custom = d.custom_data?.email;
  const email = typeof custom === "string" && isEmail(custom.trim()) ? custom.trim() : null;
  if (!email && !d.customer_id) return { action: "ignore", reason: "no buyer email" };
  return { action: "create", order: d.id, customer: d.customer_id ?? null, email, copies };
}

/** The `licenses` row for a paid transaction, once its buyer's email is known. */
export function purchaseRow(purchase: Purchase, email: string, name: string | null, test: boolean): PurchaseRow {
  return {
    email,
    name: name?.trim() || email,
    kind: "personal",
    plan: "lifetime",
    status: "active",
    seats: 1,
    max_devices: purchase.copies * DEVICES_PER_COPY,
    text: null,
    store_order_id: purchase.order,
    store_test: test,
  };
}

/** Paddle's API for `PADDLE_ENV` ("sandbox", or anything else for live). */
export const paddleApi = (environment: string) =>
  environment === "sandbox" ? "https://sandbox-api.paddle.com" : "https://api.paddle.com";

/**
 * Where Paddle publishes the addresses it sends notifications from (`data.ipv4_cidrs`). It is
 * the source of truth and can change, so the webhook reads it instead of a list in the code.
 */
export const paddleIpsUrl = (environment: string) => `${paddleApi(environment)}/ips`;

/** The CIDRs in a `/ips` answer; [] when it isn't one. */
export function ipCidrs(answer: unknown): string[] {
  const list = (answer as { data?: { ipv4_cidrs?: unknown } } | null)?.data?.ipv4_cidrs;
  return Array.isArray(list)
    ? list.filter((c): c is string => typeof c === "string" && /^[\d.]+\/\d{1,2}$/.test(c))
    : [];
}

const ipv4 = (s: string): number | null => {
  const parts = s.split(".");
  if (parts.length !== 4 || parts.some((p) => !/^\d{1,3}$/.test(p) || Number(p) > 255)) return null;
  return parts.reduce((n, p) => n * 256 + Number(p), 0);
};

/** Whether IPv4 address `ip` is in one of `cidrs` (e.g. "3.208.120.145/32"). Anything else, IPv6 included, is not. */
export function ipAllowed(ip: string | null, cidrs: readonly string[]): boolean {
  const addr = ip ? ipv4(ip.trim()) : null;
  if (addr === null) return false;
  return cidrs.some((cidr) => {
    const [base, bits] = cidr.split("/");
    const net = ipv4(base);
    const n = Number(bits);
    if (net === null || !(n >= 0 && n <= 32)) return false;
    const size = 2 ** (32 - n);
    return Math.floor(addr / size) === Math.floor(net / size);
  });
}

/** Days after payment in which a buyer can ask for a full refund themselves (the terms' refund period). */
export const REFUND_DAYS = 14;

/** What `refundable` reads from a `licenses` row. */
export interface RefundRow {
  kind: string;
  status: string;
  store_order_id: string | null;
  created_at: string;
  refund_requested_at: string | null;
}

/** Why a license can't be refunded from the account page; null when it can. */
export type NotRefundable = "not-bought" | "inactive" | "requested" | "too-late";

/**
 * Whether the buyer can ask for a refund of this license themselves: a license bought in the
 * Paddle store (`txn_…`), still active, not asked for yet, within `REFUND_DAYS` of its purchase
 * (the row is made when the payment completes). Anything else goes through the contact page.
 */
export function refundable(row: RefundRow, now = Date.now()): NotRefundable | null {
  if (row.kind === "site" || !row.store_order_id?.startsWith("txn_")) return "not-bought";
  if (row.status !== "active") return "inactive";
  if (row.refund_requested_at) return "requested";
  const bought = Date.parse(row.created_at);
  if (!(now - bought <= REFUND_DAYS * 86_400_000)) return "too-late";
  return null;
}

/** Why a refund request didn't go through, by code (shared by license-refund and the account page). */
export const REFUND_REFUSED: Record<NotRefundable | "failed" | "unconfirmed", string> = {
  "not-bought": "This license wasn't bought in the store. Write to us instead.",
  inactive: "This license is no longer active.",
  requested: "A refund for this license has already been requested.",
  "too-late": "The 14-day refund period for this license is over. Write to us if something went wrong.",
  failed: "The refund couldn't be requested right now. Try again later, or write to us.",
  unconfirmed:
    "We couldn't confirm the refund request with the payment provider. If it isn't refunded within a day, write to us.",
};

/** The last day a refund can be asked for, as YYYY-MM-DD (UTC). */
export const refundUntil = (createdAt: string) =>
  new Date(Date.parse(createdAt) + REFUND_DAYS * 86_400_000).toISOString().slice(0, 10);
