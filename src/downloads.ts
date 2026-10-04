// The manifest the release workflow writes next to the installers (scripts/downloads.mjs in ddugit).
export type Installer = { name: string; url: string; size: number };
export type Downloads = {
  version: string;
  date: string;
  files: { macos: Installer; windows: Installer };
};
export type Os = "macos" | "windows" | "other";

export function osOf(userAgent: string): Os {
  if (/Windows/i.test(userAgent)) return "windows";
  if (/Mac OS X|Macintosh/i.test(userAgent) && !/iPhone|iPad/i.test(userAgent)) return "macos";
  return "other";
}

export function isDownloads(v: unknown): v is Downloads {
  const d = v as Downloads;
  const ok = (i: Installer | undefined) =>
    !!i && typeof i.url === "string" && typeof i.name === "string" && typeof i.size === "number";
  return !!d && typeof d.version === "string" && ok(d.files?.macos) && ok(d.files?.windows);
}

export const megabytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
