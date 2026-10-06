import { settingNames } from "@/lib/supabase/config";
import { DOWNLOADS_URL, PADDLE, STORE_OPEN } from "@/site";

export const dynamic = "force-dynamic";

/**
 * Which settings this deployment sees, by variable name only (never values):
 * the first thing to check when login, downloads or the Buy button don't show up.
 */
export function GET() {
  const names = settingNames();
  return Response.json({
    supabaseUrl: names.url,
    supabaseKey: names.key,
    downloadsUrl: DOWNLOADS_URL ? "NEXT_PUBLIC_DOWNLOADS_URL" : null,
    // Paddle's public values are public anyway; whether they fit together is the useful part.
    store: { open: STORE_OPEN, environment: PADDLE.environment },
    reportForward: process.env.REPORT_FORWARD_SECRET?.trim() ? "REPORT_FORWARD_SECRET" : null,
    commit: process.env.COMMIT_REF?.slice(0, 7) ?? null,
  });
}
