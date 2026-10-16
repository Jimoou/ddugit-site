import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { NavProgress } from "@/components/Pending";
import { Nav } from "@/components/Nav";
import { Wordmark } from "@/components/Wordmark";
import { OPEN_GRAPH, PAGES, TWITTER } from "@/lib/seo";
import { SECTIONS, SITE } from "@/site";
import "./globals.css";

// Defaults for every page; public pages add their own title, description and canonical URL (`pageMeta`).
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: PAGES["/"].title, template: `%s · ${SITE.name}` },
  description: PAGES["/"].description,
  applicationName: SITE.name,
  openGraph: OPEN_GRAPH,
  twitter: TWITTER,
};

/** Footer columns of site sections; the header lists the same sections by the same names. */
const FOOTER = [
  { title: "Product", links: [SECTIONS.features, SECTIONS.download, SECTIONS.pricing, SECTIONS.account] },
  { title: "Learn", links: [SECTIONS.docs, SECTIONS.guides, SECTIONS.releases] },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* useSearchParams: kept out of the static pages' render by its own Suspense boundary. */}
        <Suspense fallback={null}>
          <NavProgress />
        </Suspense>
        <a href="#content" className="skip">
          Skip to content
        </a>
        <header className="top">
          <div className="top-inner">
            <Link href="/" className="brand" aria-label={`${SITE.name} home`}>
              <Wordmark />
            </Link>
            <Nav />
          </div>
        </header>
        <main id="content">{children}</main>
        <footer className="bottom">
          <div className="bottom-inner">
            <div className="bottom-brand">
              <Wordmark />
              <p>A Git client built around the commit graph. For macOS and Windows.</p>
            </div>
            <nav className="bottom-links" aria-label="Footer">
              {FOOTER.map((group) => (
                <div key={group.title}>
                  <h2>{group.title}</h2>
                  {group.links.map((l) => (
                    <Link key={l.href} href={l.href}>
                      {l.label}
                    </Link>
                  ))}
                </div>
              ))}
              <div>
                <h2>Legal</h2>
                <Link href="/terms">Terms</Link>
                <Link href="/privacy">Privacy</Link>
                <Link href="/refunds">Refunds</Link>
              </div>
              <div>
                <h2>Contact</h2>
                <Link href="/contact">Report a problem</Link>
                <Link href="/contact?topic=question">Ask a question</Link>
                <a href={`mailto:${SITE.contact}`}>Email us</a>
              </div>
            </nav>
          </div>
          <p className="bottom-legal">
            © {new Date().getFullYear()} {SITE.maker} · {SITE.name}
          </p>
        </footer>
      </body>
    </html>
  );
}
