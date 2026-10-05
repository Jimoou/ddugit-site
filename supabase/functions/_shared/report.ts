// Problem reports and inquiries (POST ddugit.com/api/report → the `report` function).
// The request contract the app and the site's /contact form share:
//   { kind: "bug" | "question", message, email?, diagnostics?, source: "app" | "web",
//     appVersion?, os?, website? (honeypot) }
// Pure checks only, so they run in the Edge Function (Deno) and in Node tests alike.

export const KINDS = ["bug", "question"] as const;
export const SOURCES = ["app", "web"] as const;
export type Kind = (typeof KINDS)[number];
export type Source = (typeof SOURCES)[number];

/** Largest request body the function reads, in bytes. */
export const MAX_BODY = 64 * 1024;

/** Per-field limits, in characters (Unicode code points, as Postgres' char_length counts them). */
export const LIMITS = { message: 5000, email: 254, diagnostics: 20000, appVersion: 32, os: 64 } as const;

/** Reports one sender (salted IP hash) may send per hour. */
export const PER_SENDER_HOUR = 5;
/** Reports everyone together may send per hour: a backstop if forwarded IPs are spoofed. */
export const ALL_HOUR = 200;

export const TOO_MANY = "Too many reports. Try again later.";

/** A validated report, ready for the `reports` table. */
export interface Report {
  kind: Kind;
  message: string;
  email: string | null;
  diagnostics: string | null;
  source: Source;
  app_version: string | null;
  os: string | null;
}

export type Checked = { ok: true; report: Report } | { ok: false; error: string };

const chars = (s: string) => [...s].length;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A filled-in honeypot (`website`): a bot. Answer as if stored, store nothing. */
export const isBot = (body: unknown) => {
  const w = (body as { website?: unknown } | null)?.website;
  return w !== undefined && w !== null && w !== "";
};

/**
 * An optional text field: absent, null or blank → null; otherwise trimmed and at most
 * `max` characters. `undefined` from this means "invalid".
 */
function optional(v: unknown, max: number): string | null | undefined {
  if (v === undefined || v === null) return null;
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  if (!s) return null;
  return chars(s) <= max ? s : undefined;
}

/** Check a parsed request body against the contract. Unknown fields are ignored. */
export function checkReport(body: unknown): Checked {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { ok: false, error: "Send a JSON object." };
  const b = body as Record<string, unknown>;
  if (!KINDS.includes(b.kind as Kind)) return { ok: false, error: "Kind must be bug or question." };
  if (!SOURCES.includes(b.source as Source)) return { ok: false, error: "Source must be app or web." };
  const message = typeof b.message === "string" ? b.message.trim() : "";
  if (!message) return { ok: false, error: "Write a message." };
  if (chars(message) > LIMITS.message)
    return { ok: false, error: `The message is too long (at most ${LIMITS.message} characters).` };
  const email = optional(b.email, LIMITS.email);
  if (email === undefined || (email !== null && !EMAIL.test(email)))
    return { ok: false, error: "The email address doesn't look right." };
  const diagnostics = optional(b.diagnostics, LIMITS.diagnostics);
  if (diagnostics === undefined)
    return { ok: false, error: `The diagnostics are too long (at most ${LIMITS.diagnostics} characters).` };
  const appVersion = optional(b.appVersion, LIMITS.appVersion);
  if (appVersion === undefined) return { ok: false, error: "The app version is malformed." };
  const os = optional(b.os, LIMITS.os);
  if (os === undefined) return { ok: false, error: "The OS name is malformed." };
  return {
    ok: true,
    report: {
      kind: b.kind as Kind,
      message,
      email,
      diagnostics,
      source: b.source as Source,
      app_version: appVersion,
      os,
    },
  };
}

/** Something that looks like an IPv4 or IPv6 address (no ports, no names). */
const IP = /^[0-9A-Fa-f:.]{2,45}$/;

/**
 * The sender's IP as the site forwarded it: `x-ddugit-client-ip` (set by the Next route),
 * else the first `x-forwarded-for` entry, else `cf-connecting-ip`. Null when none looks like an IP.
 */
export function senderIp(headers: { get(name: string): string | null }): string | null {
  const candidates = [
    headers.get("x-ddugit-client-ip"),
    headers.get("x-forwarded-for")?.split(",")[0],
    headers.get("cf-connecting-ip"),
  ];
  for (const c of candidates) {
    const ip = c?.trim();
    if (ip && IP.test(ip)) return ip.toLowerCase();
  }
  return null;
}

/** SHA-256 (hex) of `salt:ip`: what is kept instead of the IP, for rate limiting only. */
export async function senderHash(salt: string, ip: string | null): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${ip ?? "unknown"}`);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", data));
  return [...digest].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Whether one more report may be stored, given how many this sender and everyone
 * sent in the last hour.
 */
export const allowed = (fromSender: number, fromAll: number) => fromSender < PER_SENDER_HOUR && fromAll < ALL_HOUR;
