// POST { license: "<DDUGIT1 text>", device } → { ok: true } | { error }
//
// The app's "Remove this device" (Settings → License): frees the license's place for
// this device. No login: the license we signed for this device, plus the device id
// that hashes to its `device`, is the proof. Env: DDUGIT_LICENSE_PUBKEY; Supabase
// provides SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.

import { serviceDb, verifyingKey } from "../_shared/db.ts";
import { handle, json } from "../_shared/http.ts";
import { DEVICE_ID, checkDeactivation, readLicense, sha256Hex } from "../_shared/license.ts";

Deno.serve(
  handle(async (req) => {
    const { license, device } = await req.json().catch(() => ({}));
    if (typeof license !== "string" || license.length > 4096) return json({ error: "license required" }, 400);
    if (typeof device !== "string" || !DEVICE_ID.test(device))
      return json({ error: "The device id is malformed." }, 400);

    const held = await readLicense(await verifyingKey(), license);
    const refused = checkDeactivation(held, await sha256Hex(device));
    if (refused) return json({ error: refused.error }, refused.status);

    // Already gone (removed on the website) counts as done.
    const { error } = await serviceDb()
      .from("devices")
      .delete()
      .eq("license_id", held!.id)
      .eq("device_hash", held!.device!);
    if (error) return json({ error: "Couldn't remove the device. Try again later." }, 500);
    return json({ ok: true });
  }),
);
