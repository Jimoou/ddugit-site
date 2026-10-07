import type { MetadataRoute } from "next";
import { GUIDES, guidePath, guidesUpdated } from "@/lib/guides";
import { PAGES, type PublicPath } from "@/lib/seo";
import { SITE } from "@/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = (Object.keys(PAGES) as PublicPath[]).map((path) => ({
    url: path === "/" ? SITE.url : `${SITE.url}${path}`,
    priority: PAGES[path].priority,
    ...(path === "/guides" ? { lastModified: guidesUpdated() } : {}),
  }));
  const guides = GUIDES.map((g) => ({
    url: `${SITE.url}${guidePath(g.slug)}`,
    priority: 0.6,
    lastModified: g.updated,
  }));
  return [...pages, ...guides];
}
