import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { NEXT_COOKIE, safeNext } from "@/lib/activate";
import { supabaseServer } from "@/lib/supabase/server";

/** Where GitHub / Google send the user back: trade the one-time code for a session. */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const store = await cookies();
  const next = safeNext(store.get(NEXT_COOKIE)?.value);
  store.delete(NEXT_COOKIE);
  const back = new URL(next, url.origin);
  if (code) {
    const { error } = await (await supabaseServer()).auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(back);
  }
  const failed = new URL("/account", url.origin);
  failed.searchParams.set("error", "login");
  return NextResponse.redirect(failed);
}
