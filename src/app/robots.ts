import type { MetadataRoute } from "next";
import { BLOCKED_PATHS } from "@/lib/seo";
import { SITE } from "@/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: BLOCKED_PATHS },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
