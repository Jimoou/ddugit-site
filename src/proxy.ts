import { type NextRequest, NextResponse } from "next/server";
import { supabaseWith } from "@/lib/supabase/client";
import { hasSupabase } from "@/lib/supabase/config";

/**
 * Keep the login session fresh on the pages that use it (the rest of the site stays static).
 * Server Components can't save a refreshed session, so every signed-in page must be in the
 * matcher: otherwise a refresh there spends the refresh token without saving the new one,
 * and the next request (e.g. /activate's Activate button) finds the session revoked.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!hasSupabase()) return response;
  const supabase = supabaseWith({
    getAll: () => request.cookies.getAll(),
    setAll(list) {
      for (const { name, value } of list) request.cookies.set(name, value);
      response = NextResponse.next({ request });
      for (const { name, value, options } of list) response.cookies.set(name, value, options);
    },
  });
  await supabase.auth.getUser();
  return response;
}

// `/x/:path*` matches `/x` itself too.
export const config = { matcher: ["/account/:path*", "/activate/:path*", "/admin/:path*", "/checkout"] };
