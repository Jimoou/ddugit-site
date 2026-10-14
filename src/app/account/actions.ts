"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { NEXT_COOKIE, safeNext, withNotice } from "@/lib/activate";
import { callFunction } from "@/lib/forward";
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
  redirect(withNotice(safeNext(back), "removed"));
}

/**
 * "Request a refund" (within the refund period): license-refund asks Paddle for a full refund
 * with the signed-in user's session, then the account page says how it went.
 */
export async function requestRefund(licenseId: string) {
  const db = await supabaseServer();
  const { data } = await db.auth.getUser();
  const token = (await db.auth.getSession()).data.session?.access_token;
  if (!data.user || !token) redirect("/account");
  const { status, data: answer } = await callFunction("license-refund", { license: licenseId }, token);
  const q =
    status === 200 ? "refund=requested" : `refund=failed&reason=${encodeURIComponent(String(answer.code ?? "failed"))}`;
  redirect(`/account?${q}#${licenseId}`);
}

/** What the offline activation panel shows after a try: the code, or why not (`confirm`: agree to no refund first). */
export type OfflineResult = { license?: string; error?: string; code?: string } | null;

/**
 * "Get offline activation code": license-offline signs the signed-in user's lifetime license
 * for no device, to paste into ddugit on a computer without internet. While the license could
 * still be refunded the first code needs `noRefund` (the buyer agreed that it ends the refund).
 */
export async function getOfflineCode(licenseId: string, noRefund = false): Promise<OfflineResult> {
  const db = await supabaseServer();
  const { data } = await db.auth.getUser();
  const token = (await db.auth.getSession()).data.session?.access_token;
  if (!data.user || !token) return { error: "Sign in again." };
  const { data: answer } = await callFunction("license-offline", { license: licenseId, noRefund }, token);
  return typeof answer.license === "string"
    ? { license: answer.license }
    : {
        error: String(answer.error ?? "Couldn't make the code. Try again."),
        code: typeof answer.code === "string" ? answer.code : undefined,
      };
}
