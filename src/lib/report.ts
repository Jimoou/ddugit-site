// What the site's /api/report adds when it passes a report on to the report function:
// the shared secret that proves the request came through here, and the visitor's IP
// (the function keeps only a salted hash of it, for its rate limit).

import { CLIENT_IP_HEADER, FORWARD_HEADER, isIp } from "../../supabase/functions/_shared/report.ts";

/**
 * The visitor's IP as Netlify reports it (`x-nf-client-connection-ip`, which Netlify sets
 * itself). Not `x-forwarded-for` or `x-real-ip`: a visitor can write those. Null without one.
 */
export function clientIp(headers: { get(name: string): string | null }): string | null {
  const ip = headers.get("x-nf-client-connection-ip")?.trim();
  return ip && isIp(ip) ? ip : null;
}

/** Headers for the report function: REPORT_FORWARD_SECRET (`secret`) and the visitor's IP, if known. */
export function forwardHeaders(headers: { get(name: string): string | null }, secret: string): Record<string, string> {
  const ip = clientIp(headers);
  return { [FORWARD_HEADER]: secret, ...(ip ? { [CLIENT_IP_HEADER]: ip } : {}) };
}
