// POST { kind, message, email?, diagnostics?, source, appVersion?, os?, website? }
//   → 200 { ok: true, id } | 400/413 { error } | 429 { error: "Too many reports. Try again later." }
//
// Problem reports and inquiries from the app (Help → Report a problem) and the site's
// /contact form, both through ddugit.com/api/report. Stored in `reports` for the owner's
// dashboard (ddugit.com/admin). A filled-in honeypot (`website`) gets 200 and is dropped.
//
// Rate limit: 5 an hour per sender, where the sender is the SHA-256 of REPORT_SALT and the
// IP the site forwarded (`senderIp`); the IP itself is never stored or logged. A cap across
// all senders backs it up, since this function is public and forwarded headers can be forged.
// Nothing from the report (message, email, diagnostics) is logged.
//
// No JWT (the app sends none). Env: REPORT_SALT (any long random string); Supabase provides
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from "npm:@supabase/supabase-js@2";
import { MAX_BODY, TOO_MANY, allowed, checkReport, isBot, senderHash, senderIp } from "../_shared/report.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST only." }, 405);
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

  const salt = Deno.env.get("REPORT_SALT") ?? "";
  if (!salt) {
    console.error("report: REPORT_SALT is not set");
    return json({ error: "Reports aren't set up yet. Try again later." }, 503);
  }
  const sender = await senderHash(salt, senderIp(req.headers));

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const [mine, all] = await Promise.all([
    db.from("reports").select("id", { count: "exact", head: true }).eq("sender_hash", sender).gt("created_at", hourAgo),
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
});
