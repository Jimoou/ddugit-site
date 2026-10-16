import type { Metadata } from "next";
import Link from "next/link";
import { DOCS, docPath } from "@/lib/docs";
import { PAGES, pageMeta } from "@/lib/seo";
import { SECTIONS } from "@/site";

export const metadata: Metadata = pageMeta("/docs");

export default function Docs() {
  return (
    <div className="page">
      <header className="page-head center">
        <p className="eyebrow">{SECTIONS.docs.label}</p>
        <h1>How ddugit works</h1>
        <p className="lead">
          Every part of the app, chapter by chapter: where to find it, what it does, and the Git behind it. For one task
          from start to finish, see the <Link href="/guides">guides</Link>.
        </p>
      </header>
      <ol className="guide-list doc-list" aria-label={PAGES["/docs"].title}>
        {DOCS.map((d, i) => (
          <li key={d.slug}>
            <Link href={docPath(d.slug)} className="guide-card">
              <span className="doc-number" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2>{d.title}</h2>
              <p>{d.summary}</p>
              <span className="guide-go" aria-hidden>
                Read the chapter →
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
