"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import {
  type ActivationTarget,
  activatePath,
  activationTarget,
  callbackUrl,
  chooseLicense,
  sha256Hex,
  testLicensesAllowed,
} from "@/lib/activate";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Hand the app on this computer a one-time code for the signed-in user's license:
 * only its hash is stored, with the device it is for, and the browser carries the
 * code to the app's loopback listener, which trades it for the license
 * (license-activate registers the device and signs the license for it).
 */
export async function activate(sent: ActivationTarget) {
  // Bound arguments come back from the browser: check them again.
  const target = activationTarget(String(sent.port), sent.state, sent.device ?? undefined, sent.name);
  if (!target) redirect("/activate/done?result=failed");
  const back = activatePath(target);
  const db = await supabaseServer();
  const { data } = await db.auth.getUser();
  if (!data.user) redirect(back);

  const hash = target.device ? await sha256Hex(target.device) : null;
  const [{ data: rows }, { data: devices }] = await Promise.all([
    db
      .from("licenses")
      .select("id, kind, plan, status, store_test, max_devices, created_at")
      .order("created_at", { ascending: false }),
    db.from("devices").select("license_id, device_hash, name, created_at, last_seen_at"),
  ]);
  const chosen = chooseLicense(rows ?? [], testLicensesAllowed(), devices ?? [], hash);
  // No license, full, or an app too old for a device-bound license: the page says which.
  if (!chosen || chosen.slot === "full" || (chosen.license.kind !== "site" && !hash)) redirect(back);

  const code = randomBytes(32).toString("base64url");
  const bound = chosen.license.kind !== "site";
  const { error } = await db.from("activations").insert({
    code_hash: await sha256Hex(code),
    license_id: chosen.license.id,
    device_hash: bound ? hash : null,
    device_name: bound ? target.name : null,
  });
  if (error) redirect("/activate/done?result=failed");
  redirect(callbackUrl(target, code));
}
