import Link from "next/link";
import { GUIDES, type GuideSlug, guideBySlug, guidePath } from "@/lib/guides";
import { guideData, jsonLd } from "@/lib/seo";

const dateText = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

/** A guide page: breadcrumb, title, the article, then the other guides and a download prompt. */
export function GuideArticle({ slug, lead, children }: { slug: GuideSlug; lead: string; children: React.ReactNode }) {
  const guide = guideBySlug(slug);
  const others = GUIDES.filter((g) => g.slug !== slug);
  return (
    <article className="page prose guide">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(guideData(slug))} />
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/guides">Guides</Link>
      </nav>
      <h1>{guide.title}</h1>
      <p className="lead">{lead}</p>
      <p className="muted guide-date">
        Updated <time dateTime={guide.updated}>{dateText(guide.updated)}</time>
      </p>
      {children}
      <aside className="guide-more" aria-label="More guides">
        <h2>More guides</h2>
        <ul>
          {others.map((g) => (
            <li key={g.slug}>
              <Link href={guidePath(g.slug)}>{g.title}</Link>
            </li>
          ))}
        </ul>
      </aside>
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
