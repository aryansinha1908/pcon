/**
 * Absolute base URL of the public site, used for metadata, the sitemap and
 * share images. Set NEXT_PUBLIC_SITE_URL in production; on Vercel the project's
 * production domain is used automatically.
 */
export function siteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return new URL(explicit);
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return new URL(`https://${vercel}`);
  return new URL("http://localhost:3000");
}

export const SITE_NAME = "PCON";
export const SITE_TITLE = "PCON — Programming Club of NIT Jamshedpur";
export const SITE_DESCRIPTION =
  "A community of curious builders at NIT Jamshedpur. We explore competitive programming, development, AI, cloud, and everything in between.";

/**
 * Shared Open Graph fields. A page that sets `openGraph` replaces the parent's
 * object rather than merging, so pages spread this in alongside their own url/title.
 */
export const baseOpenGraph = { type: "website", siteName: SITE_NAME, locale: "en_IN" } as const;
