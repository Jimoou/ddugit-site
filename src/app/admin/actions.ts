"use server";

import { redirect } from "next/navigation";
import { isStatus, isUuid } from "@/lib/admin";
import { safeNext } from "@/lib/activate";
import { supabaseServer } from "@/lib/supabase/server";

// Triage on /admin, as the signed-in user: the database lets only admins update reports,
// and only their status and note (RLS and column grants), so these need no checks of their own.

const back = (path: string) => redirect(path.startsWith("/admin") ? safeNext(path) : "/admin");

/** Mark a report new, read or done, then return to the dashboard view at `path`. */
export async function setStatus(id: string, status: string, path: string) {
  if (isUuid(id) && isStatus(status)) await (await supabaseServer()).from("reports").update({ status }).eq("id", id);
  back(path);
}

/** Save (or clear, when blank) the private note on a report. */
export async function saveNote(id: string, path: string, form: FormData) {
  const note = String(form.get("note") ?? "")
    .trim()
    .slice(0, 5000);
  if (isUuid(id))
    await (
      await supabaseServer()
    )
      .from("reports")
      .update({ note: note || null })
      .eq("id", id);
  back(path);
}
