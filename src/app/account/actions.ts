"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { NEXT_COOKIE, safeNext } from "@/lib/activate";
import { supabaseServer } from "@/lib/supabase/server";
import { SITE } from "@/site";

export type Provider = "github" | "google";

/** Sign in with `provider`, then come back to `next` (a path on this site; the account page by default). */
export async function signIn(provider: Provider, next?: string) {
  // Kept in a cookie rather than the callback URL, which the provider settings must match exactly.
  (await cookies()).set(NEXT_COOKIE, safeNext(next), { httpOnly: true, sameSite: "lax", secure: true, maxAge: 600 });
  const origin = (await headers()).get("origin") ?? SITE.url;
  const { data, error } = await (
    await supabaseServer()
  ).auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${origin}/auth/callback` },
  });
  redirect(error || !data.url ? "/account?error=login" : data.url);
}

export async function signOut() {
  await (await supabaseServer()).auth.signOut();
  redirect("/account");
}

/**
 * Take a device off one of the signed-in user's licenses, then go back to `back`
 * (a path on this site). The database only lets owners remove their own devices (RLS).
 */
export async function removeDevice(licenseId: string, deviceHash: string, back: string) {
  await (await supabaseServer()).from("devices").delete().eq("license_id", licenseId).eq("device_hash", deviceHash);
  redirect(safeNext(back));
}
