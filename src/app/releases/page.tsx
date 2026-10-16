import type { Metadata } from "next";
import Link from "next/link";
import { RELEASES, releaseId } from "@/lib/releases";
import { PAGES, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta("/releases");

const dateText = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

const KIND = { new: "New", improved: "Improved", fixed: "Fixed" } as const;

export default function Releases() {
  return (
    <div className="page prose releases">
      <header className="page-head">
        <p className="eyebrow">Release notes</p>
        <h1>What&apos;s new in ddugit</h1>
        <p className="lead">
          Every release since 1.0, newest first. The app updates itself (Microsoft Store installs update through the
          Store), or you can <Link href="/download">download the latest version</Link>.
        </p>
      </header>
      <ol className="release-list" aria-label={PAGES["/releases"].title}>
        {RELEASES.map((r) => (
          <li key={r.version} id={releaseId(r.version)} className="release">
            <h2>
              <a href={`#${releaseId(r.version)}`}>{r.version}</a>
              <time dateTime={r.date} className="muted">
                {dateText(r.date)}
              </time>
            </h2>
            <ul>
              {r.changes.map((c) => (
                <li key={c.text}>
                  <span className={`change-kind ${c.kind}`}>{KIND[c.kind]}</span>
                  {c.text}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
