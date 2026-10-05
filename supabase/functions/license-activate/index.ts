// POST { code, device? } → { license: "<DDUGIT1 text>" } | { error }
//
// The app's second half of signing in (ddugit `activate.rs`): ddugit.com/activate
// gave the browser a one-time code for a license of the signed-in user (only its
// hash is stored, in `activations`, with the hash of the app's device id); the app
// trades it here, once, within minutes, sending that device id. A license other than
// a site license is registered to the device (at most `max_devices`) and signed for it.
// Env as license-refresh: DDUGIT_LICENSE_PRIVATE_KEY, DDUGIT_LICENSE_PUBKEY; Supabase
// provides SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from "npm:@supabase/supabase-js@2";
import {
  DEVICE_ID,
  checkActivationDevice,
  currentText,
  deviceBound,
  deviceSlot,
  fullMessage,
  privateKey,
  publicKey,
  sha256Hex,
} from "../_shared/license.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const { code, device } = await req.json().catch(() => ({}));
  if (typeof code !== "string" || !/^[A-Za-z0-9_-]{20,100}$/.test(code)) return json({ error: "code required" }, 400);
  if (device !== undefined && (typeof device !== "string" || !DEVICE_ID.test(device)))
    return json({ error: "The device id is malformed." }, 400);

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const now = new Date().toISOString();
  // Spend the code: only an unused, unexpired one matches, and only once.
  const { data: spent } = await db
    .from("activations")
    .update({ used_at: now })
    .eq("code_hash", await sha256Hex(code))
    .is("used_at", null)
    .gt("expires_at", now)
    .select("license_id, device_hash, device_name")
    .maybeSingle();
  if (!spent) return json({ error: "This sign-in has expired or was already used. Try again from the app." }, 400);

  const { data: row } = await db.from("licenses").select("*").eq("id", spent.license_id).maybeSingle();
  if (!row) return json({ error: "The license is gone." }, 404);

  const bound = deviceBound(row);
  const hash = bound && device ? await sha256Hex(device) : null;
  const refused = checkActivationDevice(!bound, spent.device_hash, hash);
  if (refused) return json({ error: refused.error }, refused.status);

  if (hash) {
    // Register the device, or refresh it when it is already there. The database
    // refuses a device past max_devices too (devices_within_limit), for concurrent sign-ins.
    const max = row.max_devices ?? 3;
    const { data: devices } = await db.from("devices").select("device_hash").eq("license_id", row.id);
    if (
      deviceSlot(
        (devices ?? []).map((d) => d.device_hash),
        hash,
        max,
      ) === "full"
    )
      return json({ error: fullMessage(max) }, 409);
    const { error } = await db
      .from("devices")
      .upsert(
        { license_id: row.id, device_hash: hash, name: spent.device_name ?? "This computer", last_seen_at: now },
        { onConflict: "license_id,device_hash" },
      );
    if (error)
      return error.code === "23514"
        ? json({ error: fullMessage(max) }, 409)
        : json({ error: "Couldn't register this computer. Try again later." }, 500);
  }

  const keys = {
    sign: await privateKey(Deno.env.get("DDUGIT_LICENSE_PRIVATE_KEY")!),
    verify: await publicKey(Deno.env.get("DDUGIT_LICENSE_PUBKEY")!),
  };
  const text = await currentText(row, now.slice(0, 10), keys, undefined, hash ?? undefined);
  if (!text)
    return row.plan === "lifetime"
      ? json({ error: "This license is no longer active. Write to support@ddugit.com." }, 402)
      : json({ error: "The subscription has ended. Renew it on ddugit.com." }, 402);
  // The stored text stays device-free; only site licenses and unbound subscriptions keep theirs current.
  if (!hash && text !== row.text) await db.from("licenses").update({ text, updated_at: now }).eq("id", row.id);
  return json({ license: text });
});
