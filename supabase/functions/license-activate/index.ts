// POST { code, device? } → { license: "<DDUGIT1 text>" } | { error }
//
// The app's second half of signing in (ddugit `activate.rs`): ddugit.com/activate
// gave the browser a one-time code for a license of the signed-in user (only its
// hash is stored, in `activations`, with the hash of the app's device id); the app
// trades it here, once, within minutes, sending that device id. The license must still
// be usable (`unusable`: active, and not a store test order unless ALLOW_TEST_LICENSES)
// before anything else happens. A license other than a site license is then registered
// to the device (at most `max_devices`) and signed for it; a site license is its stored text.
// Env: DDUGIT_LICENSE_PRIVATE_KEY, optional ALLOW_TEST_LICENSES; Supabase provides
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.

import { serviceDb, signingKey } from "../_shared/db.ts";
import { CONTACT_EMAIL } from "../_shared/contact.ts";
import { handle, json, optionalEnv } from "../_shared/http.ts";
import {
  DEVICE_ID,
  UNUSABLE_MESSAGE,
  allowTestLicenses,
  checkActivationDevice,
  deviceBound,
  deviceSlot,
  fullMessage,
  lifetimeLicense,
  sha256Hex,
  signLicense,
  unusable,
} from "../_shared/license.ts";

Deno.serve(
  handle(async (req) => {
    const { code, device } = await req.json().catch(() => ({}));
    if (typeof code !== "string" || !/^[A-Za-z0-9_-]{20,100}$/.test(code)) return json({ error: "code required" }, 400);
    if (device !== undefined && (typeof device !== "string" || !DEVICE_ID.test(device)))
      return json({ error: "The device id is malformed." }, 400);

    const db = serviceDb();
    const key = await signingKey(); // before the code is spent: a missing key must not burn it
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
    // Refunded, revoked or a test order: refuse before a device takes a place on it.
    const problem = unusable(row, allowTestLicenses(optionalEnv("ALLOW_TEST_LICENSES")));
    if (problem) return json({ error: UNUSABLE_MESSAGE[problem] }, problem === "test" ? 403 : 402);

    const bound = deviceBound(row);
    const hash = bound && device ? await sha256Hex(device) : null;
    const refused = checkActivationDevice(!bound, spent.device_hash, hash);
    if (refused) return json({ error: refused.error }, refused.status);

    if (!hash) {
      if (!row.text) return json({ error: `This license isn't ready yet. Write to ${CONTACT_EMAIL}.` }, 500);
      return json({ license: row.text });
    }

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

    return json({ license: await signLicense(key, lifetimeLicense(row, now.slice(0, 10), hash)) });
  }),
);
