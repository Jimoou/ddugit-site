import { forward } from "@/lib/forward";

/**
 * The address the app asks for a renewed license (ddugit.com/api/license/refresh).
 * Subscriptions only; a lifetime license comes back unchanged. Today that is the
 * license-refresh Supabase Edge Function.
 */
export const POST = (request: Request) => forward(request, "license-refresh", 8192);
