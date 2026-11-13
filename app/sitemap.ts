import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

/**
 * Public pages for search engines. When the Team page ships, add it here
 * (and individual pages too, e.g. one entry per published blog).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: new URL("/", base).toString(), changeFrequency: "weekly", priority: 1 },
    { url: new URL("/roadmaps", base).toString(), changeFrequency: "weekly", priority: 0.8 },
    { url: new URL("/events", base).toString(), changeFrequency: "daily", priority: 0.8 },
    { url: new URL("/achievements", base).toString(), changeFrequency: "monthly", priority: 0.7 },
    { url: new URL("/hall-of-fame", base).toString(), changeFrequency: "monthly", priority: 0.6 },
    { url: new URL("/blogs", base).toString(), changeFrequency: "weekly", priority: 0.7 },
  ];
}
