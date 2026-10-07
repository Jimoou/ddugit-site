// POST { license } with the buyer's session (Authorization: Bearer <access token>)
//   → { ok: true, status } | { error, code }
//
// "Request a refund" on ddugit.com/account: within REFUND_DAYS of payment, the buyer asks
// Paddle for a full refund of their license's transaction. The license is stamped
// `refund_requested_at` first (only if it wasn't already, so a double click makes one
// request) and un-stamped if Paddle refuses. Paddle approves refunds (sandbox: within
// minutes; live: may need review) and then sends adjustment.updated, which paddle-webhook
// turns into `refunded`; the app drops Pro at its next check.
//
// Deployed with JWT verification on: only a signed-in user's request gets here, and the
// license must be theirs (its email is the login's). Env: PADDLE_API_KEY (adjustments
// write), PADDLE_ENV; Supabase provides SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.

import { confirmedEmail, serviceDb } from "../_shared/db.ts";
import { env, handle, json, optionalEnv } from "../_shared/http.ts";
import { REFUND_REFUSED, type RefundRow, paddleApi, refundable } from "../_shared/store.ts";

Deno.serve(
  handle(async (req) => {
    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
    let body: { license?: unknown };
    try {
      body = await req.json();
    } catch {
      return json({ error: "not JSON" }, 400);
    }
    const id = typeof body.license === "string" && /^lic_[A-Za-z0-9_-]{1,64}$/.test(body.license) ? body.license : "";
    if (!token || !id) return json({ error: "bad request" }, 400);

    const email = await confirmedEmail(token);
    if (!email) return json({ error: "Sign in again." }, 401);
    const db = serviceDb();

    const { data: row } = await db
      .from("licenses")
      .select("id, email, kind, status, store_order_id, created_at, refund_requested_at")
      .eq("id", id)
      .maybeSingle();
    if (!row || String(row.email).toLowerCase() !== email) return json({ error: "No such license." }, 404);
    const why = refundable(row as RefundRow);
    if (why) return json({ error: REFUND_REFUSED[why], code: why }, 409);

    // Claim the request (once, even with two clicks), then ask Paddle.
    const { data: claimed } = await db
      .from("licenses")
      .update({ refund_requested_at: new Date().toISOString() })
      .eq("id", id)
      .is("refund_requested_at", null)
      .select("id");
    if (!claimed?.length) return json({ error: REFUND_REFUSED.requested, code: "requested" }, 409);

    const res = await fetch(`${paddleApi(optionalEnv("PADDLE_ENV"))}/adjustments`, {
      method: "POST",
      headers: { authorization: `Bearer ${env("PADDLE_API_KEY")}`, "content-type": "application/json" },
      body: JSON.stringify({
        action: "refund",
        type: "full",
        transaction_id: row.store_order_id,
        reason: "Requested by the buyer on ddugit.com within the 14-day refund period",
      }),
      signal: AbortSignal.timeout(15_000),
    }).catch(() => null);
    const answer = res ? await res.json().catch(() => null) : null;
    if (!res?.ok) {
      // Paddle's error code only (no buyer data) for the function log.
      console.error(`refund ${id}: Paddle ${res?.status ?? "unreachable"} ${answer?.error?.code ?? ""}`);
      // Only a definite refusal (4xx) frees the license to ask again. After a timeout or a 5xx the
      // refund may have been made anyway: keep the claim so a second click can't refund twice; the
      // adjustment webhook marks the license refunded if it went through.
      if (res && res.status < 500) {
        await db.from("licenses").update({ refund_requested_at: null }).eq("id", id);
        return json({ error: REFUND_REFUSED.failed, code: "failed" }, 502);
      }
      return json({ error: REFUND_REFUSED.unconfirmed, code: "unconfirmed" }, 502);
    }
    console.log(`refund ${id}: requested (${answer?.data?.status ?? "?"})`);
    return json({ ok: true, status: answer?.data?.status ?? null });
  }),
);
