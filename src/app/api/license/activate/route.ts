import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabase } from "@/lib/supabase/config";

/**
 * Where the app trades the one-time code from ddugit.com/activate for its license
 * (ddugit.com/api/license/activate). Today that is the license-activate Edge Function.
 */
export async function POST(request: Request) {
  if (!hasSupabase()) return Response.json({ error: "not configured" }, { status: 503 });
  const body = await request.text();
  if (body.length > 1024) return Response.json({ error: "too large" }, { status: 413 });
  const res = await fetch(`${SUPABASE_URL}/functions/v1/license-activate`, {
    method: "POST",
    headers: { "content-type": "application/json", apikey: SUPABASE_ANON_KEY },
    body,
  });
  return new Response(res.body, { status: res.status, headers: { "content-type": "application/json" } });
}
