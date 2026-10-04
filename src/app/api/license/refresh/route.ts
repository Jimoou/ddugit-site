import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabase } from "@/lib/supabase/config";

/**
 * The address the app asks for a renewed license (ddugit.com/api/license/refresh).
 * It stays the same whatever runs behind it; today that is the license-refresh
 * Supabase Edge Function.
 */
export async function POST(request: Request) {
  if (!hasSupabase()) return Response.json({ error: "not configured" }, { status: 503 });
  const body = await request.text();
  if (body.length > 8192) return Response.json({ error: "too large" }, { status: 413 });
  const res = await fetch(`${SUPABASE_URL}/functions/v1/license-refresh`, {
    method: "POST",
    headers: { "content-type": "application/json", apikey: SUPABASE_ANON_KEY },
    body,
  });
  return new Response(res.body, { status: res.status, headers: { "content-type": "application/json" } });
}
