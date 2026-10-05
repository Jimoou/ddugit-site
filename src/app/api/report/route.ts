import { forward } from "@/lib/forward";
import { forwardHeaders } from "@/lib/report";

/**
 * Problem reports and inquiries (ddugit.com/api/report), from the app and the /contact form:
 * POST { kind, message, email?, diagnostics?, source, appVersion?, os?, website? }
 * → { ok: true, id } | { error }. Today that is the report Edge Function, which only takes
 * requests carrying REPORT_FORWARD_SECRET (server env, the same value as the function's) and
 * gets the sender's IP for its rate limit (it keeps only a salted hash).
 */
export function POST(request: Request) {
  const secret = process.env.REPORT_FORWARD_SECRET?.trim();
  if (!secret) {
    console.error("report: not configured: REPORT_FORWARD_SECRET is not set");
    return Response.json({ error: "Reports aren't set up yet. Try again later." }, { status: 503 });
  }
  return forward(request, "report", 64 * 1024, forwardHeaders(request.headers, secret));
}
