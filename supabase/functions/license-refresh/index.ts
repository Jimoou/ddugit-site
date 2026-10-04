// POST { license: "<DDUGIT1 text>" } → { license: "<renewed text>" } | { status: "expired" | "unknown" }
//
// The app calls this (through ddugit.com/api/license/refresh) with the license it holds,
// no login: holding a license we signed is the proof. While the subscription is paid,
// the answer is the same license with a later expiry. Env: DDUGIT_LICENSE_PRIVATE_KEY
// (PKCS#8 PEM), DDUGIT_LICENSE_PUBKEY; SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are
// provided by Supabase.

import { createClient } from "npm:@supabase/supabase-js@2";
import { privateKey, publicKey, readLicense, renewed, signLicense } from "../_shared/license.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const { license } = await req.json().catch(() => ({ license: null }));
  if (typeof license !== "string" || license.length > 4096) return json({ error: "license required" }, 400);

  const held = await readLicense(await publicKey(Deno.env.get("DDUGIT_LICENSE_PUBKEY")!), license);
  if (!held) return json({ error: "not a ddugit license" }, 400);

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: row } = await db.from("licenses").select("*").eq("id", held.id).maybeSingle();
  if (!row) return json({ status: "unknown" });
  // A site license has no subscription: it stays what it is.
  if (!row.paid_through) return json({ license: row.text });

  const today = new Date().toISOString().slice(0, 10);
  if (row.paid_through < today) return json({ status: "expired" });

  const current = (await readLicense(await publicKey(Deno.env.get("DDUGIT_LICENSE_PUBKEY")!), row.text)) ?? held;
  const text = await signLicense(
    await privateKey(Deno.env.get("DDUGIT_LICENSE_PRIVATE_KEY")!),
    renewed({ ...current, seats: row.seats, name: row.name, email: row.email }, row.paid_through, today),
  );
  await db.from("licenses").update({ text, updated_at: new Date().toISOString() }).eq("id", row.id);
  return json({ license: text });
});
