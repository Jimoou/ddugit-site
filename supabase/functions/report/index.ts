// POST { kind, message, email?, diagnostics?, source, appVersion?, os?, website? }
//   → 200 { ok: true, id } | 400/413 { error } | 403 (not through the site)
//   | 429 { error: "Too many reports. Try again later." } | 503 (not set up)
//
// Problem reports and inquiries from the app (Help → Report a problem) and the site's
// /contact form, both through ddugit.com/api/report. Stored in `reports` for the owner's
// dashboard (ddugit.com/admin). A filled-in honeypot (`website`) gets 200 and is dropped.
//
// Only the site may call this: its route sends REPORT_FORWARD_SECRET in `x-ddugit-forward`
// (`forwardedBySite`); anything else gets 403, and only a forwarded request's
// `x-ddugit-client-ip` is believed. Without either secret set, it answers 503 (fails closed).
//
// Rate limit: 5 an hour per sender, where the sender is the SHA-256 of REPORT_SALT and that
// IP (`senderIp`); the IP itself is never stored or logged. A cap across all senders backs it up.
// Nothing from the report (message, email, diagnostics) is logged.
//
// No JWT (the app sends none). Env: REPORT_SALT (any long random string), REPORT_FORWARD_SECRET
// (the same value as the site's); Supabase provides SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.

import { serviceDb } from "../_shared/db.ts";
import { handle, json, optionalEnv } from "../_shared/http.ts";
import {
  MAX_BODY,
  TOO_MANY,
  allowed,
  checkReport,
  forwardedBySite,
  isBot,
  senderHash,
  senderIp,
} from "../_shared/report.ts";

Deno.serve(
  handle(async (req) => {
    const salt = optionalEnv("REPORT_SALT");
    const secret = optionalEnv("REPORT_FORWARD_SECRET");
    if (!salt || !secret) {
      console.error(`report: not configured: ${!salt ? "REPORT_SALT" : "REPORT_FORWARD_SECRET"} is not set`);
      return json({ error: "Reports aren't set up yet. Try again later." }, 503);
    }
    if (!(await forwardedBySite(req.headers, secret)))
      return json({ error: "Send reports through ddugit.com/api/report." }, 403);

    const raw = await req.arrayBuffer();
    if (raw.byteLength > MAX_BODY) return json({ error: "The report is too large." }, 413);
    let body: unknown;
    try {
      body = JSON.parse(new TextDecoder().decode(raw));
    } catch {
      return json({ error: "The request isn't valid JSON." }, 400);
    }
    if (isBot(body)) return json({ ok: true });
    const checked = checkReport(body);
    if (!checked.ok) return json({ error: checked.error }, 400);

    const sender = await senderHash(salt, senderIp(req.headers));
    const db = serviceDb();
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const [mine, all] = await Promise.all([
      db
        .from("reports")
        .select("id", { count: "exact", head: true })
        .eq("sender_hash", sender)
        .gt("created_at", hourAgo),
      db.from("reports").select("id", { count: "exact", head: true }).gt("created_at", hourAgo),
    ]);
    if (mine.error || all.error) {
      console.error("report: count failed", mine.error?.code ?? all.error?.code);
      return json({ error: "Couldn't save the report. Try again later." }, 500);
    }
    if (!allowed(mine.count ?? 0, all.count ?? 0)) return json({ error: TOO_MANY }, 429);

    const { data, error } = await db
      .from("reports")
      .insert({ ...checked.report, sender_hash: sender })
      .select("id")
      .single();
    if (error || !data) {
      console.error("report: insert failed", error?.code);
      return json({ error: "Couldn't save the report. Try again later." }, 500);
    }
    console.log("report: stored", checked.report.kind, checked.report.source);
    return json({ ok: true, id: data.id });
  }),
);
