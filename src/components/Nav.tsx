"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SECTIONS } from "@/site";

/** Header links, in the footer's order. `hide` drops a link on narrow screens: "md" first, then "sm". */
const LINKS = [
  { ...SECTIONS.features, hide: "md" },
  { ...SECTIONS.docs, hide: "sm" },
  { ...SECTIONS.guides, hide: "sm" },
  { ...SECTIONS.releases, hide: "md" },
  { ...SECTIONS.pricing },
  { ...SECTIONS.account },
] as const;

/** The header links and the download button; the current page's link carries aria-current. */
export function Nav() {
  const path = usePathname();
  // An article or chapter marks its section (Docs, Guides) as current.
  const current = (href: string) => (path === href || path.startsWith(`${href}/`) ? "page" : undefined);
  return (
    <nav className="nav" aria-label="Main">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={"hide" in l ? `hide-${l.hide}` : undefined}
          aria-current={current(l.href)}
        >
          {l.label}
        </Link>
      ))}
      <Link href={SECTIONS.download.href} className="button primary small" aria-current={current("/download")}>
        {SECTIONS.download.label}
      </Link>
    </nav>
  );
}
