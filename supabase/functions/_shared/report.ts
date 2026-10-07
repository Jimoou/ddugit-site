// Problem reports and inquiries (POST ddugit.com/api/report → the `report` function).
// The request contract the app and the site's /contact form share:
//   { kind: "bug" | "question", message, email?, diagnostics?, source: "app" | "web",
//     appVersion?, os?, website? (honeypot) }
// Pure checks only, so they run in the Edge Function (Deno), Next and Node tests alike.
//
// Only the site may call the function: the Next route sends REPORT_FORWARD_SECRET in
// `x-ddugit-forward`, and only then is its `x-ddugit-client-ip` (the visitor's IP, for
// the rate limit) believed. Called directly, the function answers 403.

import { isReplyEmail } from "./email.ts";
import { sha256Hex } from "./license.ts";

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
/** Reports everyone together may send per hour: a backstop against a flood through the site. */
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
  if (email === undefined || (email !== null && !isReplyEmail(email)))
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

/** The header carrying REPORT_FORWARD_SECRET from the site to the function. */
export const FORWARD_HEADER = "x-ddugit-forward";
/** The header carrying the visitor's IP from the site to the function. */
export const CLIENT_IP_HEADER = "x-ddugit-client-ip";

const IP = /^[0-9A-Fa-f:.]{2,45}$/;

/** Something that looks like an IPv4 or IPv6 address (no ports, no names). */
export const isIp = (s: string) => IP.test(s);

const digest = async (s: string) => new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));

/**
 * Whether the request came through the site: its `x-ddugit-forward` is `secret`. Compared
 * in constant time (as SHA-256 digests, so the length doesn't leak either). No secret, no pass.
 */
export async function forwardedBySite(headers: { get(name: string): string | null }, secret: string) {
  const sent = headers.get(FORWARD_HEADER);
  if (!secret || !sent) return false;
  const [a, b] = await Promise.all([digest(sent), digest(secret)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/**
 * The sender's IP as the site forwarded it (`x-ddugit-client-ip`); null when it doesn't look
 * like an IP. Only meaningful once `forwardedBySite` passed: nothing else is trusted.
 */
export function senderIp(headers: { get(name: string): string | null }): string | null {
  const ip = headers.get(CLIENT_IP_HEADER)?.trim();
  return ip && isIp(ip) ? ip.toLowerCase() : null;
}

/**
 * Who a sender is for rate limiting: an IPv4 address as is, an IPv6 address by its /64 (one
 * home or server usually gets a whole /64, so per-address limits would be easy to rotate past).
 */
export function senderKey(ip: string): string {
  if (!ip.includes(":")) return ip;
  const [head, tail = ""] = ip.split("::");
  const left = head ? head.split(":") : [];
  const right = ip.includes("::") && tail ? tail.split(":") : [];
  // An embedded IPv4 tail (::ffff:1.2.3.4) is in the last 64 bits, so it never changes the prefix.
  const groups = ip.includes("::")
    ? [...left, ...Array(Math.max(0, 8 - left.length - right.length)).fill("0"), ...right]
    : left;
  return `${groups
    .slice(0, 4)
    .map((g) => (parseInt(g, 16) || 0).toString(16))
    .join(":")}::/64`;
}

/** SHA-256 (hex) of `salt:sender`: what is kept instead of the IP, for rate limiting only. */
export const senderHash = (salt: string, ip: string | null): Promise<string> =>
  sha256Hex(`${salt}:${ip ? senderKey(ip) : "unknown"}`);

/**
 * Whether one more report may be stored, given how many this sender and everyone
 * sent in the last hour.
 */
export const allowed = (fromSender: number, fromAll: number) => fromSender < PER_SENDER_HOUR && fromAll < ALL_HOUR;
