// The reports dashboard (/admin): its filters live in the URL, so every view is a link.

export const STATUSES = ["new", "read", "done"] as const;
export const KINDS = ["bug", "question"] as const;
export const SOURCES = ["app", "web"] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<Status, string> = { new: "New", read: "Read", done: "Done" };
export const KIND_LABEL: Record<(typeof KINDS)[number], string> = { bug: "Problem", question: "Question" };
export const SOURCE_LABEL: Record<(typeof SOURCES)[number], string> = { app: "App", web: "Website" };

/** Reports shown per page. */
export const PAGE = 50;

export interface Filters {
  status?: (typeof STATUSES)[number];
  kind?: (typeof KINDS)[number];
  source?: (typeof SOURCES)[number];
  /** Show reports created before this time (ISO): the next page. */
  before?: string;
  /** The report shown expanded. */
  open?: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (s: unknown): s is string => typeof s === "string" && UUID.test(s);
export const isStatus = (s: unknown): s is Status => STATUSES.includes(s as Status);

const one = <T extends string>(allowed: readonly T[], v: unknown) =>
  typeof v === "string" && allowed.includes(v as T) ? (v as T) : undefined;

/** The dashboard's filters from its query string; anything unknown is dropped. */
export function parseFilters(params: Record<string, string | string[] | undefined>): Filters {
  const before =
    typeof params.before === "string" && !Number.isNaN(Date.parse(params.before)) ? params.before : undefined;
  return {
    status: one(STATUSES, params.status),
    kind: one(KINDS, params.kind),
    source: one(SOURCES, params.source),
    before,
    open: isUuid(params.open) ? params.open : undefined,
  };
}

/** The dashboard's address for `filters` changed by `change` (undefined removes a filter). */
export function adminHref(filters: Filters, change: Partial<Filters> = {}) {
  const next = { ...filters, ...change };
  const q = new URLSearchParams();
  for (const key of ["status", "kind", "source", "before", "open"] as const) {
    const v = next[key];
    if (v) q.set(key, v);
  }
  const s = q.toString();
  return s ? `/admin?${s}` : "/admin";
}

/** The first line of a message, cut to `max` characters. */
export function excerpt(message: string, max = 90) {
  const line = message.trim().split("\n")[0].trim();
  const chars = [...line];
  return chars.length > max
    ? `${chars
        .slice(0, max - 1)
        .join("")
        .trimEnd()}…`
    : line;
}
