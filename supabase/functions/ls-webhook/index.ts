// POST from Lemon Squeezy (Settings → Webhooks) → a `licenses` row per Pro order.
//
// order_created (paid)   → a lifetime license for the buyer: kind personal, plan lifetime,
//                          status active, max_devices 3 per copy, keyed by store_order_id.
// order_refunded (full)  → that order's license turns `refunded`; the app drops Pro at its
//                          next check (license-refresh answers "expired").
// Anything else, a partial refund, or another product → 200, no change.
//
// Fails closed: without LEMONSQUEEZY_PRODUCT_ID (the Pro product ids, comma-separated) it
// answers 500 and makes nothing, so a donation or any other product can't mint Pro. The store
// retries 5xx deliveries, so orders that arrive before it is set are not lost.
// Test-mode orders are kept with `store_test` (license-activate refuses them unless ALLOW_TEST_LICENSES).
//
// The store retries until it gets a 2xx, and may deliver out of order, so every write is
// idempotent: an order's row is inserted once (ON CONFLICT DO NOTHING) and a refund only
// ever sets `refunded`, so a late order_created can't bring a refunded license back.
// Licenses are signed per device at activation (license-activate); this only keeps rows.
//
// No JWT (the store can't send one): the proof is X-Signature, the HMAC-SHA256 of the raw
// body under LEMONSQUEEZY_WEBHOOK_SECRET. Supabase provides SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.

import { serviceDb } from "../_shared/db.ts";
import { env, handle, json } from "../_shared/http.ts";
import { type StoreEvent, decide, newLicenseId, productIds, verifySignature } from "../_shared/store.ts";

Deno.serve(
  handle(async (req) => {
    const body = await req.arrayBuffer();
    if (body.byteLength > 256 * 1024) return json({ error: "too large" }, 413);
    if (!(await verifySignature(env("LEMONSQUEEZY_WEBHOOK_SECRET"), body, req.headers.get("x-signature"))))
      return json({ error: "bad signature" }, 401);
    const products = productIds(Deno.env.get("LEMONSQUEEZY_PRODUCT_ID"));
    if (!products.length) {
      console.error(
        "not configured: LEMONSQUEEZY_PRODUCT_ID is not set; refusing to make licenses (the store will retry)",
      );
      return json({ error: "not configured" }, 500);
    }

    let event: StoreEvent;
    try {
      event = JSON.parse(new TextDecoder().decode(body));
    } catch {
      return json({ error: "not JSON" }, 400);
    }

    const decision = decide(event, products);
    // Only the event, the order id and the outcome: never the buyer's email or name.
    const order = String(event.data?.id ?? "-");
    const where = `${event.meta?.event_name ?? "?"} order ${order}${event.meta?.test_mode ? " (test)" : ""}`;
    if (decision.action === "ignore") {
      console.log(`${where}: ignored (${decision.reason})`);
      return json({ ok: true, ignored: decision.reason });
    }

    const db = serviceDb();
    const { row } = decision;
    // The order's row, once: a retry, or an order_created after its refund, finds it there and leaves it.
    const { error: insertError } = await db
      .from("licenses")
      .upsert({ id: newLicenseId(), ...row }, { onConflict: "store_order_id", ignoreDuplicates: true });
    if (insertError) {
      console.error(`${where}: insert failed (${insertError.code})`);
      return json({ error: "database" }, 500); // the store retries
    }
    if (decision.action === "refund") {
      const { error } = await db
        .from("licenses")
        .update({ status: "refunded", updated_at: new Date().toISOString() })
        .eq("store_order_id", row.store_order_id);
      if (error) {
        console.error(`${where}: refund failed (${error.code})`);
        return json({ error: "database" }, 500);
      }
    }
    console.log(`${where}: ${decision.action}`);
    return json({ ok: true });
  }),
);
