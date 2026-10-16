import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES, guidePath } from "@/lib/guides";
import { PAGES, pageMeta } from "@/lib/seo";
import { SECTIONS } from "@/site";

export const metadata: Metadata = pageMeta("/guides");

export default function Guides() {
  return (
    <div className="page">
      <header className="page-head center">
        <p className="eyebrow">{SECTIONS.guides.label}</p>
        <h1>Get things done in ddugit</h1>
        <p className="lead">
          Step-by-step guides to the Git tasks that trip people up, done on the graph. Each one ends with the git
          commands behind it.
        </p>
      </header>
      <ul className="guide-list" aria-label={PAGES["/guides"].title}>
        {GUIDES.map((g) => (
          <li key={g.slug}>
            <Link href={guidePath(g.slug)} className="guide-card">
              <h2>{g.title}</h2>
              <p>{g.summary}</p>
              <span className="guide-go" aria-hidden>
                Read the guide →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
