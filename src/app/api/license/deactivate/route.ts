import { forward } from "@/lib/forward";

/**
 * Where the app removes this device from its license (ddugit.com/api/license/deactivate):
 * POST { license, device } → { ok: true } | { error }. Today that is the license-deactivate
 * Edge Function.
 */
export const POST = (request: Request) => forward(request, "license-deactivate", 8192);
