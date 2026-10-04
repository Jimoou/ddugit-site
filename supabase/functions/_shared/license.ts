// ddugit license texts, the same format the app checks (src-tauri/src/license.rs in ddugit):
//   DDUGIT1.<payload>.<signature>   both base64url; payload = JSON, signature = Ed25519 over it.
// WebCrypto only, so it runs in Supabase Edge Functions (Deno) and in Node tests alike.

export interface LicenseInfo {
  id: string;
  name: string;
  email: string;
  /** `commercial` (per seat) or `site` (a whole organisation, e.g. air-gapped). */
  kind: string;
  seats: number;
  /** YYYY-MM-DD */
  issued: string;
  /** Versions released up to this date are covered (YYYY-MM-DD). */
  updatesUntil: string;
  /** Subscriptions: paid through + grace (YYYY-MM-DD). The app only reminds after it. */
  expires?: string;
  /** `monthly` / `yearly` subscription; absent for a site license. */
  plan?: string;
}

const PREFIX = "DDUGIT1.";

const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
const unb64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

/** The issuer's private key from its PKCS#8 PEM (scripts/license.mjs keygen in ddugit). */
export function privateKey(pem: string): Promise<CryptoKey> {
  const der = unb64url(
    pem
      .replace(/-----[^-]+-----/g, "")
      .replace(/\s+/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_"),
  );
  return crypto.subtle.importKey("pkcs8", der, { name: "Ed25519" }, false, ["sign"]);
}

/** The issuer's public key: 32 bytes, base64url (DDUGIT_LICENSE_PUBKEY). */
export function publicKey(raw: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", unb64url(raw.trim()), { name: "Ed25519" }, false, ["verify"]);
}

export async function signLicense(key: CryptoKey, info: LicenseInfo): Promise<string> {
  const payload = new TextEncoder().encode(JSON.stringify(info));
  const sig = new Uint8Array(await crypto.subtle.sign("Ed25519", key, payload));
  return `${PREFIX}${b64url(payload)}.${b64url(sig)}`;
}

/** What a license text grants, or null when it is not one we signed. */
export async function readLicense(key: CryptoKey, text: string): Promise<LicenseInfo | null> {
  const body = text.replace(/\s+/g, "");
  if (!body.startsWith(PREFIX)) return null;
  const [payload, sig] = body.slice(PREFIX.length).split(".");
  if (!payload || !sig) return null;
  try {
    const data = unb64url(payload);
    if (!(await crypto.subtle.verify("Ed25519", key, unb64url(sig), data))) return null;
    return JSON.parse(new TextDecoder().decode(data)) as LicenseInfo;
  } catch {
    return null;
  }
}

/** Days after the paid period a subscription license keeps going (renewals land late). */
export const GRACE_DAYS = 7;

export const addDays = (date: string, days: number) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

/** The license a subscription paid through `paidThrough` (YYYY-MM-DD) earns. */
export function renewed(info: LicenseInfo, paidThrough: string, today: string): LicenseInfo {
  const expires = addDays(paidThrough, GRACE_DAYS);
  return { ...info, issued: today, expires, updatesUntil: expires };
}
