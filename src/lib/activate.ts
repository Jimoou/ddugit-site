// Sign-in activation for the app (ddugit `activate.rs`): pure checks shared by the
// /activate page and its server actions. The app listens on 127.0.0.1:<port> and
// sends a random `state`; the code goes back there, never anywhere else. It also
// sends its device id and name: a license other than a site license is tied to at
// most `max_devices` devices.

import { createHash } from "node:crypto";

/** What the app asked for: its loopback port and state, and the device to activate. */
export interface ActivationTarget {
  port: number;
  state: string;
  /** The app's device id (32 bytes, base64url); null from apps older than device-bound licenses. */
  device: string | null;
  /** The device's name, cleaned up ("This computer" when none was sent). */
  name: string;
}

/** The app's device id: 32 random bytes, base64url without padding. */
const DEVICE_ID = /^[A-Za-z0-9_-]{43}$/;

/** Device names are shown, never trusted: no control characters, at most 64 characters. */
export function deviceName(raw: unknown): string {
  const name =
    typeof raw === "string"
      ? raw
          .replace(/\p{Cc}/gu, " ")
          .replace(/\s+/g, " ")
          .trim()
      : "";
  return Array.from(name).slice(0, 64).join("").trim() || "This computer";
}

/** The app's request, if port, state and (when sent) device look like what the app sends. */
export function activationTarget(
  port: unknown,
  state: unknown,
  device?: unknown,
  name?: unknown,
): ActivationTarget | null {
  const p = Number(port);
  if (typeof port !== "string" || !/^\d{1,5}$/.test(port) || p < 1024 || p > 65535) return null;
  if (typeof state !== "string" || !/^[A-Za-z0-9_-]{16,128}$/.test(state)) return null;
  const id = typeof device === "string" && DEVICE_ID.test(device) ? device : null;
  if (device !== undefined && device !== null && !id) return null;
  return { port: p, state, device: id, name: deviceName(name) };
}

/** This activation page again, with everything the app sent (e.g. to come back after signing in). */
export function activatePath(t: ActivationTarget): string {
  const q = new URLSearchParams({ port: String(t.port), state: t.state });
  if (t.device) {
    q.set("device", t.device);
    q.set("name", t.name);
  }
  return `/activate?${q}`;
}

/** Where the browser takes the one-time code: the app's listener on this computer. */
export const callbackUrl = (t: { port: number; state: string }, code: string) =>
  `http://127.0.0.1:${t.port}/callback?code=${code}&state=${t.state}`;

/** SHA-256 (hex) of a code or device id, as the database keeps them (same as the Edge Functions). */
export const sha256Hex = (s: string) => createHash("sha256").update(s).digest("hex");

export interface LicenseRow {
  id: string;
  kind: string;
  plan?: string | null;
  status: string;
  paid_through: string | null;
  max_devices?: number;
  created_at?: string;
}

export interface DeviceRow {
  license_id: string;
  device_hash: string;
  name: string;
  created_at: string;
  last_seen_at: string;
}

/**
 * Whether a license can be activated: a lifetime license while the purchase stands,
 * a site license, or a (legacy) subscription paid through today or later.
 */
export function usable(row: LicenseRow, today: string): boolean {
  if (row.plan === "lifetime") return row.status === "active";
  return row.paid_through === null || row.paid_through >= today;
}

/** Room for this device on a license: already on it, a free place, or full. */
export type DeviceSlot = "registered" | "free" | "full";

export function deviceSlot(license: LicenseRow, devices: DeviceRow[], hash: string | null): DeviceSlot {
  if (license.kind === "site") return "free";
  const mine = devices.filter((d) => d.license_id === license.id);
  if (hash && mine.some((d) => d.device_hash === hash)) return "registered";
  return mine.length < (license.max_devices ?? 3) ? "free" : "full";
}

/**
 * The license to activate on this device, newest first among the usable ones:
 * one it is already on, else one with room (or a site license), else a full one.
 */
export function chooseLicense<T extends LicenseRow>(
  rows: T[],
  today: string,
  devices: DeviceRow[],
  hash: string | null,
): { license: T; slot: DeviceSlot } | null {
  const order: DeviceSlot[] = ["registered", "free", "full"];
  const ranked = rows
    .filter((r) => usable(r, today))
    .map((license) => ({ license, slot: deviceSlot(license, devices, hash) }));
  for (const slot of order) {
    const found = ranked.find((r) => r.slot === slot);
    if (found) return found;
  }
  return null;
}

/** How a license reads on the site: "Pro · lifetime", "Site license", … */
export function licenseLabel(row: Pick<LicenseRow, "kind" | "plan">): string {
  if (row.kind === "site") return "Site license";
  if (row.plan === "lifetime") return "Pro · lifetime";
  if (row.plan === "yearly") return "Pro · yearly";
  if (row.plan === "monthly") return "Pro · monthly";
  return "Pro";
}

/** Cookie holding where to go after signing in (`safeNext`). */
export const NEXT_COOKIE = "ddugit_next";

/** A same-site path to return to after signing in (never another origin). */
export const safeNext = (next: string | undefined | null) =>
  next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : "/account";
