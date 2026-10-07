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

/**
 * Call an Edge Function from the server (a server action) with a JSON body. `token`: the
 * signed-in user's access token, for functions that check the session. Answers the
 * function's JSON (or `{ error }` when it can't be reached).
 */
export async function callFunction(
  fn: string,
  body: unknown,
  token?: string,
): Promise<{ status: number; data: Record<string, unknown> }> {
  if (!hasSupabase()) return { status: 503, data: { error: "not configured" } };
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20_000),
    });
    return { status: res.status, data: ((await res.json().catch(() => null)) ?? {}) as Record<string, unknown> };
  } catch {
    return { status: 502, data: { error: "Couldn't reach the license server. Try again in a moment." } };
  }
}
