// The service-role database client and the license keys, from the function's settings.
// Deno only: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase; the
// keys are Edge Functions → Secrets (ddugit `scripts/license.mjs keygen`).

import { createClient } from "npm:@supabase/supabase-js@2";
import { env } from "./http.ts";
import { privateKey, publicKey } from "./license.ts";

/** The database as the service role (bypasses RLS: only for checks the function makes itself). */
export const serviceDb = () => createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"));

/** The key that signs licenses (DDUGIT_LICENSE_PRIVATE_KEY, PKCS#8 PEM). */
export const signingKey = () => privateKey(env("DDUGIT_LICENSE_PRIVATE_KEY"));

/** The key that checks licenses the app holds (DDUGIT_LICENSE_PUBKEY, base64url). */
export const verifyingKey = () => publicKey(env("DDUGIT_LICENSE_PUBKEY"));
