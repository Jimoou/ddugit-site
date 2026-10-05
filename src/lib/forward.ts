import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabase } from "@/lib/supabase/config";

/**
 * Pass the app's JSON request on to a license Edge Function and its answer back.
 * The app's addresses (ddugit.com/api/license/…) stay the same whatever runs behind them.
 */
export async function forward(request: Request, fn: string, maxBytes: number) {
  if (!hasSupabase()) return Response.json({ error: "not configured" }, { status: 503 });
  const body = await request.text();
  if (body.length > maxBytes) return Response.json({ error: "too large" }, { status: 413 });
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
    method: "POST",
    headers: { "content-type": "application/json", apikey: SUPABASE_ANON_KEY },
    body,
  });
  return new Response(res.body, { status: res.status, headers: { "content-type": "application/json" } });
}
