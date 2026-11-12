import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

/**
 * Public pages for search engines. When the Events, Blogs and Team pages ship,
 * add them here (and their individual pages, e.g. one entry per published blog).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: new URL("/", base).toString(), changeFrequency: "weekly", priority: 1 },
    { url: new URL("/roadmaps", base).toString(), changeFrequency: "weekly", priority: 0.8 },
  ];
}
