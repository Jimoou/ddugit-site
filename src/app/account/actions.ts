"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { DEVICE_ID, deviceBound, unusable } from "@shared/license.ts";
import { NEXT_COOKIE, deviceName, deviceSlot, safeNext, sha256Hex, testLicensesAllowed } from "@/lib/activate";
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
  redirect(safeNext(back));
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

/** What the offline activation form shows after a try: the license to paste, or why not. */
export type OfflineResult = { license?: string; error?: string } | null;

/**
 * "Activate an offline computer": the code the app shows (its device id) and a name are
 * registered on one of the signed-in user's licenses, the same way /activate does for an
 * online computer (a one-time code, traded at once with license-activate), and the license
 * signed for that computer comes back to be pasted into its app.
 */
export async function activateOffline(licenseId: string, _prev: OfflineResult, form: FormData): Promise<OfflineResult> {
  const code = String(form.get("code") ?? "").trim();
  if (!DEVICE_ID.test(code))
    return { error: "That isn't a device code. Copy it from the app: Settings → License → Paste license." };
  const name = deviceName(String(form.get("name") ?? "") || "Offline computer");

  const db = await supabaseServer();
  const { data } = await db.auth.getUser();
  if (!data.user) return { error: "Sign in again." };
  const [{ data: license }, { data: devices }] = await Promise.all([
    db.from("licenses").select("id, kind, plan, status, store_test, max_devices").eq("id", licenseId).maybeSingle(),
    db.from("devices").select("license_id, device_hash, name, created_at, last_seen_at").eq("license_id", licenseId),
  ]);
  if (!license || !deviceBound(license)) return { error: "No such license." };
  if (unusable(license, testLicensesAllowed())) return { error: "This license can't be activated." };
  const hash = await sha256Hex(code);
  if (deviceSlot(license, devices ?? [], hash) === "full")
    return { error: `This license is already on ${license.max_devices ?? 3} devices. Remove one first.` };

  const once = randomBytes(32).toString("base64url");
  const { error } = await db.from("activations").insert({
    code_hash: await sha256Hex(once),
    license_id: license.id,
    device_hash: hash,
    device_name: name,
  });
  if (error) return { error: "Couldn't start the activation. Try again." };
  const { data: answer } = await callFunction("license-activate", { code: once, device: code });
  return typeof answer.license === "string"
    ? { license: answer.license }
    : { error: String(answer.error ?? "Couldn't activate. Try again.") };
}
