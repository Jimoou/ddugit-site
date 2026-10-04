"use server";

import { createHash, randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { activationTarget, callbackUrl, usableLicense } from "@/lib/activate";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Hand the app on this computer a one-time code for the signed-in user's license:
 * only its hash is stored, and the browser carries the code to the app's loopback
 * listener, which trades it for the license (license-activate).
 */
export async function activate(port: string, state: string) {
  const target = activationTarget(port, state);
  if (!target) redirect("/activate/done?result=failed");
  const db = await supabaseServer();
  const { data } = await db.auth.getUser();
  if (!data.user) redirect(`/activate?port=${target.port}&state=${target.state}`);

  const { data: rows } = await db
    .from("licenses")
    .select("id, kind, status, paid_through, created_at")
    .order("created_at", { ascending: false });
  const license = usableLicense(rows ?? [], new Date().toISOString().slice(0, 10));
  if (!license) redirect(`/activate?port=${target.port}&state=${target.state}`);

  const code = randomBytes(32).toString("base64url");
  const { error } = await db
    .from("activations")
    .insert({ code_hash: createHash("sha256").update(code).digest("hex"), license_id: license.id });
  if (error) redirect("/activate/done?result=failed");
  redirect(callbackUrl(target, code));
}
