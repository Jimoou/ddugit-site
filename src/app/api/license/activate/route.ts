import { forward } from "@/lib/forward";

/**
 * Where the app trades the one-time code from ddugit.com/activate for its license
 * (ddugit.com/api/license/activate): POST { code, device } → { license } | { error }.
 * Today that is the license-activate Edge Function.
 */
export const POST = (request: Request) => forward(request, "license-activate", 1024);
