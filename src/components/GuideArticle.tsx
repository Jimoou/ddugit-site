import Link from "next/link";
import type { ReactNode } from "react";
import { DOCS, type DocSlug, docBySlug, docPath } from "@/lib/docs";
import { type Article, GUIDES, type GuideSlug, guideBySlug, guidePath } from "@/lib/guides";
import { docData, guideData, jsonLd } from "@/lib/seo";
import { SECTIONS } from "@/site";

const dateText = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

/** A guide page: breadcrumb, title, the article, then the other guides and a download prompt. */
export function GuideArticle({ slug, lead, children }: { slug: GuideSlug; lead: string; children: ReactNode }) {
  return (
    <ArticleFrame
      article={guideBySlug(slug)}
      data={guideData(slug)}
      up={SECTIONS.guides}
      lead={lead}
      after={
        <aside className="guide-more" aria-label="More guides">
          <h2>More guides</h2>
          <ul>
            {GUIDES.filter((g) => g.slug !== slug).map((g) => (
              <li key={g.slug}>
                <Link href={guidePath(g.slug)}>{g.title}</Link>
              </li>
            ))}
          </ul>
        </aside>
      }
    >
      {children}
    </ArticleFrame>
  );
}

/** A chapter of the docs: as a guide page, ending with the previous and next chapters and the contents. */
export function DocArticle({ slug, lead, children }: { slug: DocSlug; lead: string; children: ReactNode }) {
  const i = DOCS.findIndex((d) => d.slug === slug);
  const [prev, next] = [DOCS[i - 1], DOCS[i + 1]];
  return (
    <ArticleFrame
      article={docBySlug(slug)}
      data={docData(slug)}
      up={SECTIONS.docs}
      lead={lead}
      after={
        <>
          <nav className="doc-turn" aria-label="Chapters">
            {prev && (
              <Link href={docPath(prev.slug)} rel="prev">
                <span className="muted">Previous</span>
                {prev.title}
              </Link>
            )}
            {next && (
              <Link href={docPath(next.slug)} rel="next" className="next">
                <span className="muted">Next</span>
                {next.title}
              </Link>
            )}
          </nav>
          <aside className="guide-more" aria-label="Docs contents">
            <h2>All chapters</h2>
            <ol>
              {DOCS.map((d) => (
                <li key={d.slug}>
                  {d.slug === slug ? (
                    <span aria-current="page">{d.title}</span>
                  ) : (
                    <Link href={docPath(d.slug)}>{d.title}</Link>
                  )}
                </li>
              ))}
            </ol>
          </aside>
        </>
      }
    >
      {children}
    </ArticleFrame>
  );
}

function ArticleFrame(p: {
  article: Article;
  data: unknown;
  /** The section the article belongs to (the breadcrumb). */
  up: { href: string; label: string };
  lead: string;
  /** Links shown after the article, before the download prompt. */
  after: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className="page prose guide">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(p.data)} />
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href={p.up.href}>{p.up.label}</Link>
      </nav>
      <h1>{p.article.title}</h1>
      <p className="lead">{p.lead}</p>
      <p className="muted guide-date">
        Updated <time dateTime={p.article.updated}>{dateText(p.article.updated)}</time>
      </p>
      {p.children}
      {p.after}
      <aside className="card guide-cta">
        <h2>Try it on your own repository</h2>
        <p>ddugit is free for everyday Git on macOS and Windows. No account needed.</p>
        <Link href="/download" className="button primary">
          Download ddugit
        </Link>
      </aside>
    </article>
  );
}

/** A command-line example: one or more commands, each on its own line, with optional `# comments`. */
export function Shell({ children }: { children: string }) {
  return (
    <pre className="shell">
      <code>{children.trim()}</code>
    </pre>
  );
}
