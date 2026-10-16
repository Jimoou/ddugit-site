import type { MetadataRoute } from "next";
import { DOCS, docPath } from "@/lib/docs";
import { GUIDES, guidePath, newest } from "@/lib/guides";
import { RELEASES } from "@/lib/releases";
import { PAGES, type PublicPath } from "@/lib/seo";
import { SITE } from "@/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Pages that list articles or releases change when those do.
  const lastModified: Partial<Record<PublicPath, string>> = {
    "/guides": newest(GUIDES),
    "/docs": newest(DOCS),
    "/releases": RELEASES[0].date,
  };
  const pages = (Object.keys(PAGES) as PublicPath[]).map((path) => ({
    url: path === "/" ? SITE.url : `${SITE.url}${path}`,
    priority: PAGES[path].priority,
    ...(lastModified[path] ? { lastModified: lastModified[path] } : {}),
  }));
  const articles = [
    ...GUIDES.map((g) => ({ path: guidePath(g.slug), updated: g.updated })),
    ...DOCS.map((d) => ({ path: docPath(d.slug), updated: d.updated })),
  ].map((a) => ({ url: `${SITE.url}${a.path}`, priority: 0.6, lastModified: a.updated }));
  return [...pages, ...articles];
}
