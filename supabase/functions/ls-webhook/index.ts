// POST from Lemon Squeezy (Settings → Webhooks) → a `licenses` row per Pro order.
//
// order_created (paid)   → a lifetime license for the buyer: kind personal, plan lifetime,
//                          status active, max_devices 3 per copy, keyed by store_order_id.
// order_refunded (full)  → that order's license turns `refunded`; the app drops Pro at its
//                          next check (license-refresh answers "expired").
// Anything else, a partial refund, or another product (LEMONSQUEEZY_PRODUCT_ID) → 200, no change.
//
// The store retries until it gets a 2xx, and may deliver out of order, so every write is
// idempotent: an order's row is inserted once (ON CONFLICT DO NOTHING) and a refund only
// ever sets `refunded`, so a late order_created can't bring a refunded license back.
// Licenses are signed per device at activation (license-activate); this only keeps rows.
//
// No JWT (the store can't send one): the proof is X-Signature, the HMAC-SHA256 of the raw
// body under LEMONSQUEEZY_WEBHOOK_SECRET. Supabase provides SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from "npm:@supabase/supabase-js@2";
import { type StoreEvent, decide, newLicenseId, verifySignature } from "../_shared/store.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const body = await req.arrayBuffer();
  if (body.byteLength > 256 * 1024) return json({ error: "too large" }, 413);
  const secret = Deno.env.get("LEMONSQUEEZY_WEBHOOK_SECRET") ?? "";
  if (!secret) return json({ error: "not configured" }, 500);
  if (!(await verifySignature(secret, body, req.headers.get("x-signature"))))
    return json({ error: "bad signature" }, 401);

  let event: StoreEvent;
  try {
    event = JSON.parse(new TextDecoder().decode(body));
  } catch {
    return json({ error: "not JSON" }, 400);
  }

  const decision = decide(event, Deno.env.get("LEMONSQUEEZY_PRODUCT_ID") || undefined);
  // Only the event, the order id and the outcome: never the buyer's email or name.
  const order = String(event.data?.id ?? "-");
  const where = `${event.meta?.event_name ?? "?"} order ${order}${event.meta?.test_mode ? " (test)" : ""}`;
  if (decision.action === "ignore") {
    console.log(`${where}: ignored (${decision.reason})`);
    return json({ ok: true, ignored: decision.reason });
  }

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
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
});
