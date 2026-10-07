// Sign-in activation for the app (ddugit `activate.rs`): pure checks shared by the
// /activate page and its server actions. The app listens on 127.0.0.1:<port> and
// sends a random `state`; the code goes back there, never anywhere else. It also
// sends its device id and name: a license other than a site license is tied to at
// most `max_devices` devices.

import {
  DEVICE_ID,
  type DeviceSlot,
  type LicenseRow as StoredLicense,
  allowTestLicenses,
  deviceBound,
  deviceSlot as slotFor,
  unusable,
} from "../../supabase/functions/_shared/license.ts";

export { type DeviceSlot, sha256Hex } from "../../supabase/functions/_shared/license.ts";

/**
 * Whether this deployment offers store test-mode licenses on /activate: ALLOW_TEST_LICENSES
 * (server env), the same switch license-activate reads from its own secrets.
 */
export const testLicensesAllowed = () => allowTestLicenses(process.env.ALLOW_TEST_LICENSES);

/** What the app asked for: its loopback port and state, and the device to activate. */
export interface ActivationTarget {
  port: number;
  state: string;
  /** The app's device id (32 bytes, base64url); null from apps older than device-bound licenses. */
  device: string | null;
  /** The device's name, cleaned up ("This computer" when none was sent). */
  name: string;
}

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

/** A license as the site reads it (with the user's session; RLS keeps it to their own). */
export type LicenseRow = Pick<StoredLicense, "id" | "plan" | "status" | "store_test" | "max_devices"> & {
  kind: string;
  created_at?: string;
};

export interface DeviceRow {
  license_id: string;
  device_hash: string;
  name: string;
  created_at: string;
  last_seen_at: string;
}

/** Room for this device on a license: already on it, a free place, or full. Site licenses always have room. */
export function deviceSlot(license: LicenseRow, devices: DeviceRow[], hash: string | null): DeviceSlot {
  if (!deviceBound(license)) return "free";
  const mine = devices.filter((d) => d.license_id === license.id).map((d) => d.device_hash);
  return slotFor(mine, hash ?? "", license.max_devices ?? 3);
}

/**
 * The license to activate on this device, newest first among the usable ones (the rule
 * license-activate applies: `unusable`, with `allowTest` from ALLOW_TEST_LICENSES):
 * one it is already on, else one with room (or a site license), else a full one.
 */
export function chooseLicense<T extends LicenseRow>(
  rows: T[],
  allowTest: boolean,
  devices: DeviceRow[],
  hash: string | null,
): { license: T; slot: DeviceSlot } | null {
  const order: DeviceSlot[] = ["registered", "free", "full"];
  const ranked = rows
    .filter((r) => !unusable(r, allowTest))
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
  return row.plan === "lifetime" ? "Pro · lifetime" : "Pro";
}

/** Cookie holding where to go after signing in (`safeNext`). */
export const NEXT_COOKIE = "ddugit_next";

const HERE = "https://ddugit.invalid";

/**
 * A same-site path to return to after signing in (never another origin), normalized;
 * "/account" for anything else. Backslashes and control characters (tabs, newlines) are
 * refused outright, since URL parsers drop or turn them into "/" ("/\t/evil.com" reads as
 * "//evil.com"); so is a path that normalizes to start with "//" ("/.//evil.com").
 */
export function safeNext(next: string | undefined | null): string {
  if (!next || !next.startsWith("/") || /[\\\p{Cc}]/u.test(next)) return "/account";
  let url: URL;
  try {
    url = new URL(next, HERE);
  } catch {
    return "/account";
  }
  if (url.origin !== HERE || url.pathname.startsWith("//")) return "/account";
  return `${url.pathname}${url.search}${url.hash}`;
}

/**
 * Whether the signed-in user already owns Pro: an active license that isn't a site license
 * (store test orders count too, so a sandbox buyer is stopped the same way). /checkout then
 * points them at their account instead of selling a second copy.
 */
export const ownsPro = (rows: Pick<LicenseRow, "kind" | "status">[]) =>
  rows.some((r) => r.kind !== "site" && r.status === "active");

/** `path` (a path on this site) with `?notice=<what>` set, for the page to say what just happened. */
export function withNotice(path: string, what: string): string {
  const url = new URL(path, HERE);
  url.searchParams.set("notice", what);
  return url.pathname + url.search;
}
