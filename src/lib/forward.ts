import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabase } from "@/lib/supabase/config";

/**
 * Pass the app's JSON request on to an Edge Function and its answer back.
 * The app's addresses (ddugit.com/api/…) stay the same whatever runs behind them.
 * `headers` go along too (e.g. the sender's IP for the report function's rate limit).
 */
export async function forward(request: Request, fn: string, maxBytes: number, headers: Record<string, string> = {}) {
  if (!hasSupabase()) return Response.json({ error: "not configured" }, { status: 503 });
  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > maxBytes)
    return Response.json({ error: "The request is too large." }, { status: 413 });
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
    method: "POST",
    headers: { ...headers, "content-type": "application/json", apikey: SUPABASE_ANON_KEY },
    body,
  });
  return new Response(res.body, { status: res.status, headers: { "content-type": "application/json" } });
}
