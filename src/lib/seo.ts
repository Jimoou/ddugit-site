// What search engines see: one table of public pages (titles, descriptions, sitemap),
// the paths they must not index, and the structured data for the product.

import type { Metadata } from "next";
import { DEVICES, PRO_PRICE, SITE } from "../site.ts";
import { type GuideSlug, guideBySlug, guidePath } from "./guides.ts";

type Page = { title: string; description: string; priority: number };

/** Every page meant for search results, by path. The sitemap lists exactly these. */
export const PAGES = {
  "/": {
    title: "ddugit: graph-first Git client for macOS and Windows",
    description:
      "ddugit is a Git GUI for Mac and Windows built around the commit graph. Merge, rebase and cherry-pick by dragging, resolve conflicts file by file, and undo anything. Free, with a one-time Pro upgrade.",
    priority: 1,
  },
  "/download": {
    title: "Download for macOS and Windows",
    description:
      "Download the free ddugit Git client for macOS (Apple silicon and Intel) and Windows 10 or later. No sign-up, no time limit, and the app keeps itself up to date.",
    priority: 0.9,
  },
  "/pricing": {
    title: `Pricing: free Git client, $${PRO_PRICE} lifetime Pro`,
    description: `ddugit is free for everyday Git, with no time limit. Pro is a one-time $${PRO_PRICE} payment: use it forever on up to ${DEVICES} devices, with every future update.`,
    priority: 0.8,
  },
  "/guides": {
    title: "ddugit guides: rebase, conflicts, cherry-pick and undo",
    description:
      "Step-by-step guides to everyday Git in ddugit: interactive rebase, merge conflicts, cherry-pick and backports, and undo with reset and the reflog.",
    priority: 0.7,
  },
  "/contact": {
    title: "Contact",
    description: "Report a problem with ddugit or ask a question, including about site licenses.",
    priority: 0.3,
  },
  "/terms": { title: "Terms of use", description: "The terms for using ddugit and ddugit Pro.", priority: 0.2 },
  "/privacy": { title: "Privacy", description: "What ddugit and ddugit.com collect, and why.", priority: 0.2 },
} as const satisfies Record<string, Page>;

export type PublicPath = keyof typeof PAGES;

/**
 * Not crawled at all: endpoints and sign-in redirects. Pages for signed-in users (account,
 * activate, admin, checkout, thanks) stay crawlable but carry `NOINDEX`, because a crawler
 * that is blocked by robots.txt never sees a page's noindex and may still list its URL.
 */
export const BLOCKED_PATHS = ["/api/", "/auth/"];

/** For pages that hold a signed-in user's data or a one-off step. */
export const NOINDEX = { index: false, follow: false } as const;

/** `app/opengraph-image.tsx`. A page that sets its own `openGraph` loses the file's image, so every card names it. */
const SHARE_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${SITE.name}: Git client for macOS and Windows`,
};

export const OPEN_GRAPH: Metadata["openGraph"] = {
  siteName: SITE.name,
  type: "website",
  locale: "en_US",
  images: [SHARE_IMAGE],
};
export const TWITTER: Metadata["twitter"] = { card: "summary_large_image", images: [SHARE_IMAGE] };

/**
 * A public page's metadata: title, description, canonical URL and the matching Open Graph and
 * Twitter cards.
 */
export function pageMeta(path: PublicPath): Metadata {
  const { title, description } = PAGES[path];
  // The home page's title is already complete; the others get the "· ddugit" template.
  return meta(path, path === "/" ? { absolute: title } : title, title, description);
}

/** A guide's metadata, as `pageMeta`. */
export function guideMeta(slug: GuideSlug): Metadata {
  const { title, description } = guideBySlug(slug);
  return meta(guidePath(slug), title, title, description, "article");
}

function meta(
  path: string,
  full: Metadata["title"],
  title: string,
  description: string,
  type: "website" | "article" = "website",
): Metadata {
  return {
    title: full,
    description,
    alternates: { canonical: path },
    openGraph: { ...OPEN_GRAPH, type, url: path, title, description },
    twitter: { ...TWITTER, title, description },
  };
}

/** The product as schema.org data (Google's software app rich result needs `offers`). */
export function productData(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE.name,
    description: PAGES["/"].description,
    url: SITE.url,
    downloadUrl: `${SITE.url}/download`,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "macOS 11 or later, Windows 10 or later",
    screenshot: ["graph", "rebase", "backport"].map((s) => `${SITE.url}/screens/${s}.webp`),
    offers: [
      { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
      { "@type": "Offer", name: "Pro (lifetime)", price: String(PRO_PRICE), priceCurrency: "USD" },
    ],
  };
}

/** A guide as schema.org data: the article and its place under Guides (for the breadcrumb in results). */
export function guideData(slug: GuideSlug): Record<string, unknown>[] {
  const { title, description, published, updated } = guideBySlug(slug);
  const url = `${SITE.url}${guidePath(slug)}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: title,
      description,
      url,
      mainEntityOfPage: url,
      datePublished: published,
      dateModified: updated,
      image: `${SITE.url}${SHARE_IMAGE.url}`,
      author: { "@type": "Person", name: SITE.seller },
      publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
      about: { "@type": "SoftwareApplication", name: "Git" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Guides", item: `${SITE.url}/guides` },
        { "@type": "ListItem", position: 2, name: title, item: url },
      ],
    },
  ];
}

/** Embeds structured data in a page; `<` is escaped so the JSON can't close the script tag. */
export const jsonLd = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });
