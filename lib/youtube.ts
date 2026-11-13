/**
 * Preview data (title, channel, thumbnail) for YouTube links, from YouTube's
 * public oEmbed endpoint — no API key needed. Fetched on the server at build
 * time and revalidated daily; any failure just means "no preview".
 */

export type YouTubePreview = { title: string; channel: string; thumbnail: string };

const isYouTube = (url: string) => /^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(url);

async function fetchPreview(url: string): Promise<YouTubePreview | null> {
  try {
    const response = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`, {
      next: { revalidate: 86_400 },
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { title?: unknown; author_name?: unknown; thumbnail_url?: unknown };
    if (typeof data.title !== "string" || typeof data.thumbnail_url !== "string") return null;
    if (!data.thumbnail_url.startsWith("https://i.ytimg.com/")) return null;
    return { title: data.title, channel: typeof data.author_name === "string" ? data.author_name : "", thumbnail: data.thumbnail_url };
  } catch {
    return null;
  }
}

/** Map of url → preview for every YouTube url in the list (others are skipped). */
export async function getYouTubePreviews(urls: string[]): Promise<Record<string, YouTubePreview>> {
  const unique = [...new Set(urls.filter(isYouTube))];
  const results = await Promise.all(unique.map(async (url) => [url, await fetchPreview(url)] as const));
  return Object.fromEntries(results.filter((entry): entry is readonly [string, YouTubePreview] => entry[1] !== null));
}
