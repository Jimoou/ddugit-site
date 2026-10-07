import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES, guidePath } from "@/lib/guides";
import { PAGES, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta("/guides");

export default function Guides() {
  return (
    <div className="page">
      <header className="page-head center">
        <p className="eyebrow">Guides</p>
        <h1>Everyday Git, explained</h1>
        <p className="lead">
          Short guides to the Git tasks that trip people up. Each one shows the commands and how the same thing looks on
          the graph in ddugit.
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
