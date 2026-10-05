// POST { license: "<DDUGIT1 text>" } → { license } | { status: "expired" | "unknown" | "removed" }
//
// The app's periodic check (at start and once a day) of the license it holds. No login:
// holding a license we signed is the proof. The answer, by `refreshStatus` and the device:
// - "removed": the license was tied to a device and its row is gone, or this device was
//   removed on the account page (the app drops its license; without this a removed device
//   would keep working and the device limit would mean nothing);
// - "expired": refunded, revoked, or a store test order while ALLOW_TEST_LICENSES is off;
// - "unknown": a license not tied to a device that has no row (e.g. issued offline);
// - otherwise the license again (a site license's current stored text), which the app reads
//   as "current". Nothing is renewed: every license sold is lifetime.
//
// Called through ddugit.com/api/license/refresh. Env: DDUGIT_LICENSE_PUBKEY, optional
// ALLOW_TEST_LICENSES; SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase.

import { serviceDb, verifyingKey } from "../_shared/db.ts";
import { handle, json, optionalEnv } from "../_shared/http.ts";
import { allowTestLicenses, readLicense, refreshStatus } from "../_shared/license.ts";

Deno.serve(
  handle(async (req) => {
    const { license } = await req.json().catch(() => ({ license: null }));
    if (typeof license !== "string" || license.length > 4096) return json({ error: "license required" }, 400);

    const held = await readLicense(await verifyingKey(), license);
    if (!held) return json({ error: "not a ddugit license" }, 400);

    const db = serviceDb();
    const { data: row, error } = await db.from("licenses").select("*").eq("id", held.id).maybeSingle();
    // A failed read is not a missing row: never tell the app to drop its license over it.
    if (error) return json({ error: "Couldn't check the license. Try again later." }, 500);
    const status = refreshStatus(held, row, allowTestLicenses(optionalEnv("ALLOW_TEST_LICENSES")));
    if (status) return json({ status });

    if (held.device) {
      const { data: seen, error } = await db
        .from("devices")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("license_id", row.id)
        .eq("device_hash", held.device)
        .select("device_hash")
        .maybeSingle();
      if (error) return json({ error: "Couldn't check the license. Try again later." }, 500);
      if (!seen) return json({ status: "removed" });
    }
    return json({ license: row.kind === "site" && row.text ? row.text : license.trim() });
  }),
);
