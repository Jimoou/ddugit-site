"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/#features", label: "Features", wide: true },
  { href: "/guides", label: "Guides", wide: true },
  { href: "/pricing", label: "Pricing" },
  { href: "/account", label: "Account" },
];

/** The header links and the download button; the current page's link carries aria-current. */
export function Nav() {
  const path = usePathname();
  // A guide marks Guides as the current section.
  const current = (href: string) => (path === href || path.startsWith(`${href}/`) ? "page" : undefined);
  return (
    <nav className="nav" aria-label="Main">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} className={l.wide ? "wide" : undefined} aria-current={current(l.href)}>
          {l.label}
        </Link>
      ))}
      <Link href="/download" className="button primary small" aria-current={current("/download")}>
        Download
      </Link>
    </nav>
  );
}
