// POST { license } with the buyer's session (Authorization: Bearer <access token>)
//   → { license: "<DDUGIT1 text>" } | { error }
//
// "Offline activation code" on ddugit.com/account (as IntelliJ does it): the buyer's lifetime
// license signed for no device, to paste into ddugit on a computer without internet
// (Settings → License → Paste license). It opens Pro on any computer it is pasted into; one
// that goes online later still drops it once the license is refunded or revoked (license-refresh).
// Deployed with JWT verification on, and the license must be the signed-in user's.
// Env: DDUGIT_LICENSE_PRIVATE_KEY, optional ALLOW_TEST_LICENSES; Supabase provides
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.

import { serviceDb, signingKey } from "../_shared/db.ts";
import { handle, json, optionalEnv } from "../_shared/http.ts";
import {
  UNUSABLE_MESSAGE,
  allowTestLicenses,
  deviceBound,
  lifetimeLicense,
  signLicense,
  unusable,
} from "../_shared/license.ts";

Deno.serve(
  handle(async (req) => {
    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
    const body = await req.json().catch(() => ({}));
    const id = typeof body.license === "string" && /^lic_[A-Za-z0-9_-]{1,64}$/.test(body.license) ? body.license : "";
    if (!token || !id) return json({ error: "bad request" }, 400);

    const db = serviceDb();
    const { data: who } = await db.auth.getUser(token);
    const email = who.user?.email?.toLowerCase();
    if (!email) return json({ error: "Sign in again." }, 401);

    const { data: row } = await db.from("licenses").select("*").eq("id", id).maybeSingle();
    if (!row || String(row.email).toLowerCase() !== email || !deviceBound(row))
      return json({ error: "No such license." }, 404);
    const problem = unusable(row, allowTestLicenses(optionalEnv("ALLOW_TEST_LICENSES")));
    if (problem) return json({ error: UNUSABLE_MESSAGE[problem] }, 403);

    const key = await signingKey();
    console.log(`offline code ${id}`);
    return json({ license: await signLicense(key, lifetimeLicense(row, new Date().toISOString().slice(0, 10))) });
  }),
);
