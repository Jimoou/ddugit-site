// The service-role database client and the license keys, from the function's settings.
// Deno only: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase; the
// keys are Edge Functions → Secrets (ddugit `scripts/license.mjs keygen`).

import { createClient } from "npm:@supabase/supabase-js@2";
import { env } from "./http.ts";
import { privateKey, publicKey } from "./license.ts";

/** The database as the service role (bypasses RLS: only for checks the function makes itself). */
export const serviceDb = () => createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"));

/**
 * The signed-in user's email, lowercased, if the access token is valid and the address is
 * confirmed; null otherwise. Licenses belong to an email address, so an unconfirmed one (a
 * password sign-up with confirmation off) must not count as owning it (as the RLS policies'
 * `private.verified_email()`).
 */
export async function confirmedEmail(token: string): Promise<string | null> {
  const { data } = await serviceDb().auth.getUser(token);
  const user = data.user;
  return user?.email && user.email_confirmed_at ? user.email.toLowerCase() : null;
}

/** The key that signs licenses (DDUGIT_LICENSE_PRIVATE_KEY, PKCS#8 PEM). */
export const signingKey = () => privateKey(env("DDUGIT_LICENSE_PRIVATE_KEY"));

/** The key that checks licenses the app holds (DDUGIT_LICENSE_PUBKEY, base64url). */
export const verifyingKey = () => publicKey(env("DDUGIT_LICENSE_PUBKEY"));
