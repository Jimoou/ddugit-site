// POST { code } → { license: "<DDUGIT1 text>" } | { error }
//
// The app's second half of signing in (ddugit `activate.rs`): ddugit.com/activate
// gave the browser a one-time code for a license of the signed-in user (only its
// hash is stored, in `activations`); the app trades it here, once, within minutes.
// Env as license-refresh: DDUGIT_LICENSE_PRIVATE_KEY, DDUGIT_LICENSE_PUBKEY; Supabase
// provides SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from "npm:@supabase/supabase-js@2";
import { currentText, privateKey, publicKey } from "../_shared/license.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const sha256 = async (s: string) =>
  [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const { code } = await req.json().catch(() => ({ code: null }));
  if (typeof code !== "string" || !/^[A-Za-z0-9_-]{20,100}$/.test(code)) return json({ error: "code required" }, 400);

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const now = new Date().toISOString();
  // Spend the code: only an unused, unexpired one matches, and only once.
  const { data: spent } = await db
    .from("activations")
    .update({ used_at: now })
    .eq("code_hash", await sha256(code))
    .is("used_at", null)
    .gt("expires_at", now)
    .select("license_id")
    .maybeSingle();
  if (!spent) return json({ error: "This sign-in has expired or was already used. Try again from the app." }, 400);

  const { data: row } = await db.from("licenses").select("*").eq("id", spent.license_id).maybeSingle();
  if (!row) return json({ error: "The license is gone." }, 404);
  const keys = {
    sign: await privateKey(Deno.env.get("DDUGIT_LICENSE_PRIVATE_KEY")!),
    verify: await publicKey(Deno.env.get("DDUGIT_LICENSE_PUBKEY")!),
  };
  const text = await currentText(row, now.slice(0, 10), keys);
  if (!text) return json({ error: "The subscription has ended. Renew it on ddugit.com." }, 402);
  if (text !== row.text) await db.from("licenses").update({ text, updated_at: now }).eq("id", row.id);
  return json({ license: text });
});
