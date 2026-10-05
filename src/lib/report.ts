/** Something that looks like an IPv4 or IPv6 address (no ports, no names). */
const IP = /^[0-9A-Fa-f:.]{2,45}$/;

/**
 * The visitor's IP as Netlify reports it (`x-nf-client-connection-ip`), else the first
 * `x-forwarded-for` entry, else `x-real-ip`. Null when none looks like an IP.
 */
export function clientIp(headers: { get(name: string): string | null }): string | null {
  for (const c of [
    headers.get("x-nf-client-connection-ip"),
    headers.get("x-forwarded-for")?.split(",")[0],
    headers.get("x-real-ip"),
  ]) {
    const ip = c?.trim();
    if (ip && IP.test(ip)) return ip;
  }
  return null;
}

/**
 * Headers that carry the visitor's IP to the report function, which keeps only a salted
 * hash of it for its rate limit. Without them every report would come from this server.
 */
export function senderHeaders(headers: { get(name: string): string | null }): Record<string, string> {
  const ip = clientIp(headers);
  return ip ? { "x-ddugit-client-ip": ip, "x-forwarded-for": ip } : {};
}
