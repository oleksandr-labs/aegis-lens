import { SITE } from "@/lib/site";

/**
 * Video sitemap XML builder (`<video:video>`).
 *
 * Works from a neutral `VideoEntry` shape so it can be fed from the VIDEOS seed
 * (videos library) or from event video media without coupling to either. Each
 * required Google field is encoded; optional fields (duration, publication
 * date, thumbnail) are emitted only when present.
 */

function escXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type VideoEntry = {
  /** Page the video is embedded on. */
  pageUrl: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  /** Direct file or player URL. At least one of these should be set. */
  contentUrl?: string;
  playerUrl?: string;
  /** Duration in seconds (Google requires 1..28800). */
  durationSeconds?: number;
  /** ISO publication date. */
  publishedAt?: string;
  tags?: string[];
};

/** Map the VIDEOS seed shape (slug/title/...) to VideoEntry. */
export function videoSeedToEntries(
  videos: {
    slug: string;
    title: string;
    summary: string;
    durationSeconds: number;
    publishedAt: string;
    tags?: string[];
  }[],
  locale = "en",
): VideoEntry[] {
  const prefix = locale === "en" ? "" : `/${locale}`;
  return videos.map((v) => ({
    pageUrl: `${SITE.url}${prefix}/videos/${v.slug}`,
    title: v.title,
    description: v.summary,
    thumbnailUrl: `${SITE.url}/videos/${v.slug}/opengraph-image`,
    playerUrl: `${SITE.url}${prefix}/videos/${v.slug}`,
    durationSeconds: v.durationSeconds,
    publishedAt: v.publishedAt,
    tags: v.tags,
  }));
}

/** Render an `<urlset>` video sitemap from prepared entries. */
export function renderVideoSitemapXml(entries: VideoEntry[]): string {
  const body = entries
    .map((v) => {
      const parts: string[] = [
        `      <video:title>${escXml(v.title)}</video:title>`,
        `      <video:description>${escXml(v.description)}</video:description>`,
      ];
      if (v.thumbnailUrl)
        parts.unshift(
          `      <video:thumbnail_loc>${escXml(v.thumbnailUrl)}</video:thumbnail_loc>`,
        );
      if (v.contentUrl)
        parts.push(
          `      <video:content_loc>${escXml(v.contentUrl)}</video:content_loc>`,
        );
      if (v.playerUrl)
        parts.push(
          `      <video:player_loc>${escXml(v.playerUrl)}</video:player_loc>`,
        );
      if (
        typeof v.durationSeconds === "number" &&
        v.durationSeconds >= 1 &&
        v.durationSeconds <= 28800
      )
        parts.push(
          `      <video:duration>${Math.round(v.durationSeconds)}</video:duration>`,
        );
      if (v.publishedAt)
        parts.push(
          `      <video:publication_date>${escXml(v.publishedAt)}</video:publication_date>`,
        );
      for (const tag of (v.tags ?? []).slice(0, 32)) {
        parts.push(`      <video:tag>${escXml(tag)}</video:tag>`);
      }
      return `  <url>
    <loc>${escXml(v.pageUrl)}</loc>
    <video:video>
${parts.join("\n")}
    </video:video>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${body}
</urlset>
`;
}
