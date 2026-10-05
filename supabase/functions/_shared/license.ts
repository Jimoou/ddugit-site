// ddugit license texts, the same format the app checks (src-tauri/src/license.rs in ddugit):
//   DDUGIT1.<payload>.<signature>   both base64url; payload = JSON, signature = Ed25519 over it.
// WebCrypto only, so it runs in Supabase Edge Functions (Deno) and in Node tests alike.

export interface LicenseInfo {
  id: string;
  name: string;
  email: string;
  /** `personal` (lifetime, bought online), `commercial` (per seat) or `site` (a whole organisation, e.g. air-gapped). */
  kind: string;
  seats: number;
  /** YYYY-MM-DD */
  issued: string;
  /** Versions released up to this date are covered (YYYY-MM-DD). */
  updatesUntil: string;
  /** Subscriptions: paid through + grace (YYYY-MM-DD). The app only reminds after it. */
  expires?: string;
  /** `lifetime`, or a `monthly` / `yearly` subscription; absent for a site license. */
  plan?: string;
  /** SHA-256 (hex) of the one device id this license works on; absent = not tied to a device (site licenses). */
  device?: string;
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

/** "Updates until" of a lifetime license: every future version. */
export const LIFETIME_UPDATES = "9999-12-31";

/** The app's device id: 32 random bytes, base64url without padding. */
export const DEVICE_ID = /^[A-Za-z0-9_-]{43}$/;

/** SHA-256 of a string (UTF-8), lowercase hex: how codes and device ids are kept. */
export async function sha256Hex(s: string): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
  return [...digest].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** A `licenses` row, as the functions read it. */
export interface LicenseRow {
  id: string;
  name: string;
  email: string;
  kind?: string;
  /** `lifetime`, `monthly`, `yearly`, or null for a site license. */
  plan?: string | null;
  status?: string;
  seats: number;
  max_devices?: number;
  paid_through: string | null;
  /** The stored text; site licenses and subscriptions only (a lifetime license is signed per device). */
  text: string | null;
}

/** Site licenses work anywhere; every other license is tied to the devices it is activated on. */
export const deviceBound = (row: Pick<LicenseRow, "kind">) => row.kind !== "site";

/** A lifetime license for one device: every update, no expiry. */
export function lifetimeLicense(row: LicenseRow, today: string, device: string): LicenseInfo {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    kind: "personal",
    seats: 1,
    issued: today,
    updatesUntil: LIFETIME_UPDATES,
    plan: "lifetime",
    device,
  };
}

/**
 * The license text a row grants today: a site license as it is; a lifetime license
 * signed for `device` (while the purchase stands); a subscription paid through today
 * or later, renewed through its period; null otherwise.
 * `fallback` stands in when the stored text can't be read (it shouldn't happen).
 */
export async function currentText(
  row: LicenseRow,
  today: string,
  keys: { sign: CryptoKey; verify: CryptoKey },
  fallback?: LicenseInfo,
  device?: string,
): Promise<string | null> {
  if (row.plan === "lifetime") {
    const bound = device ?? fallback?.device;
    if ((row.status ?? "active") !== "active" || !bound) return null;
    return signLicense(keys.sign, lifetimeLicense(row, today, bound));
  }
  if (!row.paid_through) return row.text;
  if (row.paid_through < today) return null;
  const current = (row.text ? await readLicense(keys.verify, row.text) : null) ?? fallback;
  if (!current) return null;
  const info = { ...current, seats: row.seats, name: row.name, email: row.email };
  if (device) info.device = device;
  return signLicense(keys.sign, renewed(info, row.paid_through, today));
}

/** Room for a device on a license with `registered` device hashes. */
export type DeviceSlot = "registered" | "free" | "full";

export function deviceSlot(registered: string[], hash: string, max: number): DeviceSlot {
  if (registered.includes(hash)) return "registered";
  return registered.length < max ? "free" : "full";
}

/** The answer when a license has no room for another device (the app shows it as is). */
export const fullMessage = (max: number) =>
  `This license is already on ${max} devices. Remove one at ddugit.com/account.`;

/** An error answer: HTTP status and a short sentence for the app. */
export interface Refusal {
  status: number;
  error: string;
}

/**
 * Whether the app trading a code is the computer the code was issued for.
 * `expected`: the activation's device hash; `presented`: the hash of the device id the app sent.
 */
export function checkActivationDevice(
  siteLicense: boolean,
  expected: string | null,
  presented: string | null,
): Refusal | null {
  if (siteLicense) return null;
  if (!expected) return { status: 400, error: "Update ddugit to activate this license." };
  if (presented !== expected)
    return { status: 403, error: "This sign-in was started on another computer. Try again from the app." };
  return null;
}

/** Whether `held` (a verified license) may release the device whose id hashes to `presented`. */
export function checkDeactivation(held: LicenseInfo | null, presented: string | null): Refusal | null {
  if (!held) return { status: 400, error: "This is not a ddugit license." };
  if (!held.device) return { status: 400, error: "This license isn't tied to a device." };
  if (presented !== held.device) return { status: 403, error: "This license belongs to another computer." };
  return null;
}
