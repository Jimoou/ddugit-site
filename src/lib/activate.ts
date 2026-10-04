// Sign-in activation for the app (ddugit `activate.rs`): pure checks shared by the
// /activate page and its server action. The app listens on 127.0.0.1:<port> and
// sends a random `state`; the code goes back there, never anywhere else.

/** The app's loopback port and state, if both look like what the app sends. */
export function activationTarget(port: unknown, state: unknown): { port: number; state: string } | null {
  const p = Number(port);
  if (typeof port !== "string" || !/^\d{1,5}$/.test(port) || p < 1024 || p > 65535) return null;
  if (typeof state !== "string" || !/^[A-Za-z0-9_-]{16,128}$/.test(state)) return null;
  return { port: p, state };
}

/** Where the browser takes the one-time code: the app's listener on this computer. */
export const callbackUrl = (t: { port: number; state: string }, code: string) =>
  `http://127.0.0.1:${t.port}/callback?code=${code}&state=${t.state}`;

export interface LicenseRow {
  id: string;
  kind: string;
  status: string;
  paid_through: string | null;
  created_at?: string;
}

/** The license to activate: a site license, or a subscription paid through today or later (newest first). */
export function usableLicense<T extends LicenseRow>(rows: T[], today: string): T | null {
  return rows.find((r) => r.paid_through === null || r.paid_through >= today) ?? null;
}

/** Cookie holding where to go after signing in (`safeNext`). */
export const NEXT_COOKIE = "ddugit_next";

/** A same-site path to return to after signing in (never another origin). */
export const safeNext = (next: string | undefined | null) =>
  next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : "/account";
