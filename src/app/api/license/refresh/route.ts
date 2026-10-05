import { forward } from "@/lib/forward";

/**
 * Where the app checks the license it holds (ddugit.com/api/license/refresh), at start and
 * daily: the license back while it stands, else { status: "expired" | "removed" | "unknown" }.
 * Today that is the
 * license-refresh Supabase Edge Function.
 */
export const POST = (request: Request) => forward(request, "license-refresh", 8192);
