// Lemon Squeezy (the store) → `licenses` rows. Pure helpers for the ls-webhook function:
// the signature check and what each order event does to the table. WebCrypto only, so it
// runs in Supabase Edge Functions (Deno) and in Node tests alike.
//
// A webhook is a POST of JSON with `X-Signature`: the lowercase hex HMAC-SHA256 of the
// raw body under the webhook's signing secret, and `X-Event-Name`, e.g. `order_created`:
//   { meta: { event_name, test_mode, custom_data? },
//     data: { type: "orders", id, attributes: { user_name, user_email, status, refunded,
//             first_order_item: { product_id, variant_id, quantity, … }, … } } }

/** Devices one Pro purchase covers (`site.ts`'s DEVICES); `quantity` copies cover that many times more. */
export const DEVICES_PER_COPY = 3;

const hexBytes = (hex: string) => Uint8Array.from(hex.match(/../g) ?? [], (h) => parseInt(h, 16));

/**
 * Whether `signature` (the `X-Signature` header) is the HMAC-SHA256 of `body` (the raw
 * request bytes) under `secret`. `crypto.subtle.verify` compares in constant time.
 */
export async function verifySignature(secret: string, body: BufferSource, signature: string | null): Promise<boolean> {
  if (!secret || !signature || !/^[0-9a-f]{64}$/i.test(signature.trim())) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  return crypto.subtle.verify("HMAC", key, hexBytes(signature.trim()), body);
}

/** A new license id: `lic_` + 9 random bytes, base64url (as ddugit `scripts/license.mjs`). */
export function newLicenseId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  return `lic_${btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")}`;
}

/** The parts of a webhook the function reads; everything else is ignored. */
export interface StoreEvent {
  meta?: { event_name?: string; test_mode?: boolean; custom_data?: Record<string, unknown> | null };
  data?: {
    type?: string;
    id?: string | number;
    attributes?: {
      user_name?: string | null;
      user_email?: string | null;
      status?: string;
      refunded?: boolean;
      first_order_item?: { product_id?: string | number; quantity?: number | null } | null;
    };
  };
}

/** A `licenses` row as the webhook writes it (the id is added on insert). */
export interface PurchaseRow {
  email: string;
  name: string;
  kind: "personal";
  plan: "lifetime";
  status: "active" | "refunded";
  seats: 1;
  max_devices: number;
  text: "";
  store_order_id: string;
  store_test: boolean;
}

/**
 * What an event does to `licenses`:
 * - `create`: insert the row unless the order already has one (retries, or a refund that came first);
 * - `refund`: mark the order's row refunded, inserting it as refunded when it isn't there yet;
 * - `ignore`: answer 200 and change nothing (other events, unpaid orders, other products), with why.
 */
export type Decision =
  | { action: "create"; row: PurchaseRow }
  | { action: "refund"; row: PurchaseRow }
  | { action: "ignore"; reason: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The decision for one webhook. `productId`: when set (LEMONSQUEEZY_PRODUCT_ID), orders
 * for other products are ignored. The license goes to `custom_data.email` when the site
 * passed one at checkout (the buyer's ddugit.com login), else to the email they paid with.
 */
export function decide(event: StoreEvent, productId?: string): Decision {
  const name = event.meta?.event_name ?? "";
  if (name !== "order_created" && name !== "order_refunded") return { action: "ignore", reason: `event ${name}` };
  const order = event.data;
  const a = order?.attributes;
  if (order?.type !== "orders" || order.id === undefined || !a) return { action: "ignore", reason: "not an order" };

  const item = a.first_order_item;
  if (productId && String(item?.product_id ?? "") !== productId.trim())
    return { action: "ignore", reason: "another product" };

  const custom = event.meta?.custom_data?.email;
  const email = (typeof custom === "string" && EMAIL.test(custom.trim()) ? custom : (a.user_email ?? "")).trim();
  if (!EMAIL.test(email)) return { action: "ignore", reason: "no buyer email" };

  // Only a full refund takes the license back; a partial one (e.g. tax) leaves it.
  const refunded = a.status === "refunded";
  if (name === "order_created" && a.status !== "paid" && !refunded)
    return { action: "ignore", reason: `order ${a.status ?? "without status"}` };
  if (name === "order_refunded" && !refunded) return { action: "ignore", reason: `order ${a.status}` };

  const copies = Math.max(1, Math.floor(Number(item?.quantity) || 1));
  const row: PurchaseRow = {
    email,
    name: a.user_name?.trim() || email,
    kind: "personal",
    plan: "lifetime",
    status: refunded ? "refunded" : "active",
    seats: 1,
    max_devices: copies * DEVICES_PER_COPY,
    text: "",
    store_order_id: String(order.id),
    store_test: event.meta?.test_mode === true,
  };
  return { action: refunded ? "refund" : "create", row };
}
