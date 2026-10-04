"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { SITE } from "@/site";

export type Provider = "github" | "google";

export async function signIn(provider: Provider) {
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
