import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Wordmark } from "@/components/Wordmark";
import { OPEN_GRAPH, PAGES, TWITTER } from "@/lib/seo";
import { SITE } from "@/site";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
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
              <div>
                <h2>Product</h2>
                <Link href="/#features">Features</Link>
                <Link href="/download">Download</Link>
                <Link href="/pricing">Pricing</Link>
                <Link href="/account">Account</Link>
              </div>
              <div>
                <h2>Legal</h2>
                <Link href="/terms">Terms</Link>
                <Link href="/privacy">Privacy</Link>
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
            © {new Date().getFullYear()} {SITE.seller} · {SITE.name}
          </p>
        </footer>
      </body>
    </html>
  );
}
