// POST { license, noRefund? } with the buyer's session (Authorization: Bearer <access token>)
//   → { license: "<DDUGIT1 text>" } | { error, code? }
//
// "Offline activation code" on ddugit.com/account (as IntelliJ does it): the buyer's lifetime
// license signed for no device, to paste into ddugit on a computer without internet
// (Settings → License → Paste license). It opens Pro on any computer it is pasted into; one
// that goes online later still drops it once the license is refunded or revoked (license-refresh),
// but one that never does keeps it: so the first code ends the self-service refund. While the
// license could still be refunded the buyer must agree (`noRefund: true`, code "confirm" until then),
// and the first code is stamped `offline_issued_at` (license-refund then refuses it).
// Deployed with JWT verification on, and the license must be the signed-in user's.
// Env: DDUGIT_LICENSE_PRIVATE_KEY, optional ALLOW_TEST_LICENSES; Supabase provides
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.

import { confirmedEmail, serviceDb, signingKey } from "../_shared/db.ts";
import { handle, json, optionalEnv } from "../_shared/http.ts";
import { type RefundRow, refundable } from "../_shared/store.ts";
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

    const email = await confirmedEmail(token);
    if (!email) return json({ error: "Sign in again." }, 401);
    const db = serviceDb();

    const { data: row } = await db.from("licenses").select("*").eq("id", id).maybeSingle();
    if (!row || String(row.email).toLowerCase() !== email || !deviceBound(row))
      return json({ error: "No such license." }, 404);
    const problem = unusable(row, allowTestLicenses(optionalEnv("ALLOW_TEST_LICENSES")));
    if (problem) return json({ error: UNUSABLE_MESSAGE[problem] }, 403);
    // A code made now would outlive the refund on a computer that never goes online.
    const refundAsked = { error: "A refund for this license has been requested, so no new codes are made." };
    if (row.refund_requested_at) return json(refundAsked, 409);
    if (!row.offline_issued_at) {
      if (!refundable(row as RefundRow) && body.noRefund !== true)
        return json({ error: "Making an offline code ends the refund for this license.", code: "confirm" }, 409);
      // Stamp the first code, unless a refund was asked for in the meantime (license-refund claims
      // the other way round, so one of the two wins).
      const { data: stamped } = await db
        .from("licenses")
        .update({ offline_issued_at: new Date().toISOString() })
        .eq("id", id)
        .is("refund_requested_at", null)
        .is("offline_issued_at", null)
        .select("id");
      if (!stamped?.length) {
        const { data: now } = await db.from("licenses").select("refund_requested_at").eq("id", id).maybeSingle();
        if (!now || now.refund_requested_at) return json(refundAsked, 409);
      }
    }

    const key = await signingKey();
    console.log(`offline code ${id}`);
    return json({ license: await signLicense(key, lifetimeLicense(row, new Date().toISOString().slice(0, 10))) });
  }),
);
