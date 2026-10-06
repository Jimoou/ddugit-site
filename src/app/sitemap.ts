import type { MetadataRoute } from "next";
import { PAGES, type PublicPath } from "@/lib/seo";
import { SITE } from "@/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return (Object.keys(PAGES) as PublicPath[]).map((path) => ({
    url: path === "/" ? SITE.url : `${SITE.url}${path}`,
    priority: PAGES[path].priority,
  }));
}
