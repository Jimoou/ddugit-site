import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  type Filters,
  KINDS,
  KIND_LABEL,
  PAGE,
  SOURCES,
  SOURCE_LABEL,
  STATUSES,
  STATUS_LABEL,
  type Status,
  adminHref,
  excerpt,
  parseFilters,
} from "@/lib/admin";
import { replyLink } from "@shared/email.ts";
import { hasSupabase } from "@/lib/supabase/config";
import { supabaseServer } from "@/lib/supabase/server";
import { saveNote, setStatus } from "./actions";

export const metadata: Metadata = { title: "Reports", robots: NOINDEX };

type Report = {
  id: string;
  kind: "bug" | "question";
  message: string;
  email: string | null;
  diagnostics: string | null;
  source: "app" | "web";
  app_version: string | null;
  os: string | null;
  status: Status;
  note: string | null;
  created_at: string;
  updated_at: string;
};

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });

/** Signed-in admins' inbox of problem reports and inquiries. Everyone else gets a 404. */
export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Read the query first: it keeps this page dynamic even when a build has no Supabase settings.
  const filters = parseFilters(await searchParams);
  if (!hasSupabase()) notFound();
  const db = await supabaseServer();
  const user = (await db.auth.getUser()).data.user;
  if (!user) notFound();
  // RLS shows a user only their own admin row.
  const { data: me } = await db.from("admins").select("email").limit(1);
  if (!me?.length) notFound();

  // Kind and source narrow the counts too; status picks one of them.
  const scope: Record<string, string> = {};
  if (filters.kind) scope.kind = filters.kind;
  if (filters.source) scope.source = filters.source;
  let list = db
    .from("reports")
    .select("id, kind, message, email, diagnostics, source, app_version, os, status, note, created_at, updated_at")
    .match(filters.status ? { ...scope, status: filters.status } : scope);
  if (filters.before) list = list.lt("created_at", filters.before);
  const [{ data, error }, ...counts] = await Promise.all([
    list.order("created_at", { ascending: false }).limit(PAGE + 1),
    ...STATUSES.map((s) =>
      db
        .from("reports")
        .select("id", { count: "exact", head: true })
        .match({ ...scope, status: s }),
    ),
  ]);
  const rows = ((data ?? []) as Report[]).slice(0, PAGE);
  const more = (data?.length ?? 0) > PAGE;
  const count = Object.fromEntries(STATUSES.map((s, i) => [s, counts[i].count ?? 0])) as Record<Status, number>;
  const total = STATUSES.reduce((n, s) => n + count[s], 0);
  const view = { ...filters, open: undefined };

  return (
    <div className="page admin">
      <header className="admin-head">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Reports</h1>
        </div>
        <p className="muted small">Signed in as {user.email}</p>
      </header>

      <nav className="admin-filters" aria-label="Filters">
        <Chips
          label="Status"
          items={[
            {
              text: `All ${total}`,
              href: adminHref(view, { status: undefined, before: undefined }),
              on: !filters.status,
            },
            ...STATUSES.map((s) => ({
              text: `${STATUS_LABEL[s]} ${count[s]}`,
              href: adminHref(view, { status: s, before: undefined }),
              on: filters.status === s,
            })),
          ]}
        />
        <Chips
          label="Kind"
          items={[
            { text: "All", href: adminHref(view, { kind: undefined, before: undefined }), on: !filters.kind },
            ...KINDS.map((k) => ({
              text: KIND_LABEL[k],
              href: adminHref(view, { kind: k, before: undefined }),
              on: filters.kind === k,
            })),
          ]}
        />
        <Chips
          label="Source"
          items={[
            { text: "All", href: adminHref(view, { source: undefined, before: undefined }), on: !filters.source },
            ...SOURCES.map((s) => ({
              text: SOURCE_LABEL[s],
              href: adminHref(view, { source: s, before: undefined }),
              on: filters.source === s,
            })),
          ]}
        />
      </nav>

      {error ? (
        <p className="note">Couldn&apos;t load reports. Reload to try again.</p>
      ) : rows.length ? (
        <ul className="reports">
          {rows.map((r) => (
            <Row key={r.id} r={r} filters={filters} />
          ))}
        </ul>
      ) : (
        <p className="muted">No reports here.</p>
      )}

      <p className="admin-pages">
        {filters.before && (
          <Link className="button small" href={adminHref(view, { before: undefined })}>
            Newest
          </Link>
        )}
        {more && (
          <Link className="button small" href={adminHref(view, { before: rows[rows.length - 1].created_at })}>
            Older
          </Link>
        )}
      </p>
    </div>
  );
}

function Chips({ label, items }: { label: string; items: { text: string; href: string; on: boolean }[] }) {
  return (
    <div className="chips">
      <span className="chips-label">{label}</span>
      {items.map((i) => (
        <Link key={i.href} href={i.href} className="chip" aria-current={i.on ? "true" : undefined}>
          {i.text}
        </Link>
      ))}
    </div>
  );
}

function Row({ r, filters }: { r: Report; filters: Filters }) {
  // Actions come back to this view with this report open.
  const here = adminHref(filters, { open: r.id });
  const reply = r.email ? replyLink(r.email, "Re: your message to ddugit") : null;
  return (
    <li id={`r-${r.id}`}>
      <details className={`report status-${r.status}`} open={filters.open === r.id}>
        <summary>
          <span className={`status-dot ${r.status}`} aria-label={STATUS_LABEL[r.status]} role="img" />
          <span className="report-kind">{KIND_LABEL[r.kind]}</span>
          <span className="report-excerpt">{excerpt(r.message)}</span>
          <span className="report-meta muted">
            {SOURCE_LABEL[r.source]} · {when(r.created_at)}
          </span>
        </summary>
        <div className="report-body">
          <p className="report-message">{r.message}</p>
          <dl className="report-facts">
            <div>
              <dt>Reply to</dt>
              <dd>
                {reply ? (
                  <a href={reply}>{r.email}</a>
                ) : r.email ? (
                  // Not a plain address (stored before the stricter check): shown, never linked.
                  <span>{r.email}</span>
                ) : (
                  <span className="muted">No email given</span>
                )}
              </dd>
            </div>
            <div>
              <dt>App version</dt>
              <dd>{r.app_version ?? "—"}</dd>
            </div>
            <div>
              <dt>OS</dt>
              <dd>{r.os ?? "—"}</dd>
            </div>
            <div>
              <dt>Received</dt>
              <dd>{when(r.created_at)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                {STATUS_LABEL[r.status]}
                {r.updated_at !== r.created_at ? ` · changed ${when(r.updated_at)}` : ""}
              </dd>
            </div>
            <div>
              <dt>Id</dt>
              <dd>
                <code>{r.id}</code>
              </dd>
            </div>
          </dl>
          {r.diagnostics && (
            <>
              <h3 className="report-sub">Diagnostics</h3>
              <pre className="report-diag">{r.diagnostics}</pre>
            </>
          )}
          <div className="report-actions">
            {STATUSES.map((s) => (
              <form key={s} action={setStatus.bind(null, r.id, s, here)}>
                <button className="button small" disabled={r.status === s}>
                  Mark {STATUS_LABEL[s].toLowerCase()}
                </button>
              </form>
            ))}
          </div>
          <form className="report-note" action={saveNote.bind(null, r.id, here)}>
            <label htmlFor={`note-${r.id}`}>Private note</label>
            <textarea id={`note-${r.id}`} name="note" rows={3} maxLength={5000} defaultValue={r.note ?? ""} />
            <button className="button small">Save note</button>
          </form>
        </div>
      </details>
    </li>
  );
}
