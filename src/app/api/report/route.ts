import { forward } from "@/lib/forward";
import { senderHeaders } from "@/lib/report";

/**
 * Problem reports and inquiries (ddugit.com/api/report), from the app and the /contact form:
 * POST { kind, message, email?, diagnostics?, source, appVersion?, os?, website? }
 * → { ok: true, id } | { error }. Today that is the report Edge Function, which gets the
 * sender's IP for its rate limit (it keeps only a salted hash).
 */
export const POST = (request: Request) => forward(request, "report", 64 * 1024, senderHeaders(request.headers));
