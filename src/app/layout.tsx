import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { SITE } from "@/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description:
    "ddugit is a graph-first Git client for macOS and Windows. Drag to merge, tidy history from a list, and watch all your repositories at a glance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="top">
          <Link href="/" className="brand" aria-label={SITE.name}>
            <Wordmark />
          </Link>
          <nav>
            <Link href="/download">Download</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/account">Account</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="bottom">
          <span>© {new Date().getFullYear()} ddugit</span>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <a href={`mailto:${SITE.contact}`}>{SITE.contact}</a>
        </footer>
      </body>
    </html>
  );
}
