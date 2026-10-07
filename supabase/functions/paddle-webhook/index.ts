// POST from Paddle Billing (Developer tools → Notifications) → a `licenses` row per Pro purchase.
// Subscribe the destination to transaction.completed, adjustment.created and adjustment.updated.
//
// transaction.completed            → a lifetime license for the buyer: kind personal, plan lifetime,
//                                    status active, max_devices 3 per copy, keyed by store_order_id (txn_…).
// adjustment (refund / chargeback,  → that transaction's license turns `refunded`; the app drops Pro
//   approved, full)                  at its next check (license-refresh answers "expired").
// Anything else, a partial refund, or another product → 200, no change.
//
// Fails closed: without PADDLE_PRODUCT_ID (the Pro product ids `pro_…`, comma-separated) it
// answers 500 and makes nothing, so any other product can't mint Pro. Paddle retries failed
// deliveries, so purchases that arrive before it is set are not lost.
// PADDLE_ENV=sandbox marks licenses `store_test` (license-activate refuses them unless ALLOW_TEST_LICENSES).
//
// Paddle retries until it gets a 2xx and may deliver out of order, so every write is idempotent:
// a transaction's row is inserted once (ON CONFLICT DO NOTHING), a refund is recorded in
// `store_refunds` and only ever sets `refunded`, and a purchase that arrives after its refund
// is inserted and then refunded at once. Licenses are signed per device at activation
// (license-activate); this only keeps rows.
//
// Senders: only Paddle's published addresses (GET {api}/ips, read at run time, never hard-coded);
// Anyone else is refused (PADDLE_IP_CHECK=log only logs them, for debugging a gateway change).
// No JWT (Paddle can't send one): the proof is Paddle-Signature, the HMAC-SHA256 of `ts:body`
// under PADDLE_WEBHOOK_SECRET (the destination's secret key). PADDLE_API_KEY (read access to
// customers) is needed only for a purchase made without a ddugit.com login, to look up the
// buyer's email. Supabase provides SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.

import { serviceDb } from "../_shared/db.ts";
import { env, handle, json, optionalEnv } from "../_shared/http.ts";
import { isEmail } from "../_shared/email.ts";
import {
  type Purchase,
  type StoreEvent,
  decide,
  ipAllowed,
  ipCidrs,
  newLicenseId,
  paddleApi,
  productIds,
  paddleIpsUrl,
  purchaseRow,
  verifySignature,
} from "../_shared/store.ts";

/** Paddle's sending addresses, read from its /ips endpoint at most once an hour per instance. */
let senders: { cidrs: string[]; at: number } | null = null;
async function paddleSenders(): Promise<string[] | null> {
  if (senders && Date.now() - senders.at < 3_600_000) return senders.cidrs;
  const res = await fetch(paddleIpsUrl(optionalEnv("PADDLE_ENV")), { signal: AbortSignal.timeout(2_000) }).catch(
    () => null,
  );
  const cidrs = res?.ok ? ipCidrs(await res.json().catch(() => null)) : [];
  if (cidrs.length) senders = { cidrs, at: Date.now() };
  return senders?.cidrs ?? null; // an older list beats none
}

/**
 * The address a delivery came from, as Supabase's gateway reports it: the first `x-forwarded-for`
 * entry, which carries Paddle's address on real deliveries (seen on a sandbox delivery, 2026-10-07).
 * Refused unless it is one of Paddle's; PADDLE_IP_CHECK=log only logs strangers instead.
 */
const senderIp = (headers: Headers) => headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

/** The buyer's email and name from Paddle, for a purchase made without a ddugit.com login. */
async function customer(id: string): Promise<{ email: string; name: string | null } | null> {
  const res = await fetch(`${paddleApi(optionalEnv("PADDLE_ENV"))}/customers/${encodeURIComponent(id)}`, {
    headers: { authorization: `Bearer ${env("PADDLE_API_KEY")}` },
    // Paddle counts a delivery only if it is answered within 5 seconds (it retries otherwise).
    signal: AbortSignal.timeout(3_000),
  });
  if (!res.ok) return null;
  const data = (await res.json())?.data;
  return typeof data?.email === "string" && isEmail(data.email.trim())
    ? { email: data.email.trim(), name: typeof data.name === "string" ? data.name : null }
    : null;
}

Deno.serve(
  handle(async (req) => {
    const enforce = optionalEnv("PADDLE_IP_CHECK") !== "log";
    const cidrs = await paddleSenders();
    if (!cidrs && enforce) return json({ error: "sender list unavailable" }, 503); // Paddle retries
    const ip = senderIp(req.headers);
    const fromPaddle = ipAllowed(ip, cidrs ?? []);
    if (!fromPaddle) {
      // Addresses only (Paddle's or a stranger's), for checking the header before enforcing.
      console.warn(
        `sender not Paddle's: ${ip ?? "-"} (xff ${req.headers.get("x-forwarded-for") ?? "-"}, real ${req.headers.get("x-real-ip") ?? "-"}, cf ${req.headers.get("cf-connecting-ip") ?? "-"})${enforce ? "" : " [log only]"}`,
      );
      if (enforce) return json({ error: "forbidden" }, 403);
    }

    const body = new Uint8Array(await req.arrayBuffer());
    if (body.byteLength > 256 * 1024) return json({ error: "too large" }, 413);
    if (!(await verifySignature(env("PADDLE_WEBHOOK_SECRET"), body, req.headers.get("paddle-signature"))))
      return json({ error: "bad signature" }, 401);
    const products = productIds(Deno.env.get("PADDLE_PRODUCT_ID"));
    if (!products.length) {
      console.error("not configured: PADDLE_PRODUCT_ID is not set; refusing to make licenses (Paddle will retry)");
      return json({ error: "not configured" }, 500);
    }

    let event: StoreEvent;
    try {
      event = JSON.parse(new TextDecoder().decode(body));
    } catch {
      return json({ error: "not JSON" }, 400);
    }

    const decision = decide(event, products);
    const test = optionalEnv("PADDLE_ENV") === "sandbox";
    // Only the event and the ids: never the buyer's email or name.
    const where = `${event.event_type ?? "?"} ${event.data?.id ?? "-"}${test ? " (sandbox)" : ""}`;
    if (decision.action === "ignore") {
      console.log(`${where}: ignored (${decision.reason})`);
      return json({ ok: true, ignored: decision.reason });
    }

    const db = serviceDb();
    const refund = async (order: string) => {
      const { error } = await db
        .from("licenses")
        .update({ status: "refunded", updated_at: new Date().toISOString() })
        .eq("store_order_id", order);
      return error;
    };

    if (decision.action === "refund") {
      const { error: recordError } = await db
        .from("store_refunds")
        .upsert({ store_order_id: decision.order }, { onConflict: "store_order_id", ignoreDuplicates: true });
      const error = recordError ?? (await refund(decision.order));
      if (error) {
        console.error(`${where}: refund failed (${error.code})`);
        return json({ error: "database" }, 500); // Paddle retries
      }
      console.log(`${where}: refund ${decision.order}`);
      return json({ ok: true });
    }

    const purchase: Purchase = decision;
    let buyer = purchase.email ? { email: purchase.email, name: null as string | null } : null;
    if (!buyer && purchase.customer) buyer = await customer(purchase.customer);
    if (!buyer) {
      console.error(`${where}: no buyer email (customer lookup failed); Paddle will retry`);
      return json({ error: "no buyer email" }, 500);
    }

    // The transaction's row, once: a retry finds it there and leaves it.
    const { error: insertError } = await db
      .from("licenses")
      .upsert(
        { id: newLicenseId(), ...purchaseRow(purchase, buyer.email, buyer.name, test) },
        { onConflict: "store_order_id", ignoreDuplicates: true },
      );
    if (insertError) {
      console.error(`${where}: insert failed (${insertError.code})`);
      return json({ error: "database" }, 500);
    }
    // A refund that came first.
    const { data: refunded, error: lookupError } = await db
      .from("store_refunds")
      .select("store_order_id")
      .eq("store_order_id", purchase.order)
      .maybeSingle();
    const error = lookupError ?? (refunded ? await refund(purchase.order) : null);
    if (error) {
      console.error(`${where}: refund check failed (${error.code})`);
      return json({ error: "database" }, 500);
    }
    console.log(`${where}: create${refunded ? " (already refunded)" : ""}`);
    return json({ ok: true });
  }),
);
