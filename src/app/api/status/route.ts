import { settingNames } from "@/lib/supabase/config";
import { DOWNLOADS_URL } from "@/site";

export const dynamic = "force-dynamic";

/**
 * Which settings this deployment sees, by variable name only (never values):
 * the first thing to check when login or downloads don't show up.
 */
export function GET() {
  const names = settingNames();
  return Response.json({
    supabaseUrl: names.url,
    supabaseKey: names.key,
    downloadsUrl: DOWNLOADS_URL ? "NEXT_PUBLIC_DOWNLOADS_URL" : null,
    commit: process.env.COMMIT_REF?.slice(0, 7) ?? null,
  });
}
