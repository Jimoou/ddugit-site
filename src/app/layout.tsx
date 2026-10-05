import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Wordmark } from "@/components/Wordmark";
import { SITE } from "@/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} · ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description:
    "ddugit is a Git client for macOS and Windows built around the commit graph. Drag to merge, rebase from a list, and keep every repository in view.",
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
                <a href={`mailto:${SITE.contact}`}>{SITE.contact}</a>
              </div>
            </nav>
          </div>
          <p className="bottom-legal">
            © {new Date().getFullYear()} {SITE.name}
          </p>
        </footer>
      </body>
    </html>
  );
}
