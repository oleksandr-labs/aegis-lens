import {
  PODCAST_TITLE,
  PODCAST_DESCRIPTION,
  PODCAST_AUTHOR,
  listEpisodes,
  isoDuration,
} from "@/lib/podcast-seed";
import { SITE } from "@/lib/site";

/**
 * RSS 2.0 feed for the Aegis Lens podcast.
 * Includes the iTunes namespace fields major directories require.
 * Middleware skips dot-suffix paths so the root-level route is hit directly.
 */
export const dynamic = "force-dynamic";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const episodes = listEpisodes();
  const selfUrl = `${SITE.url}/podcast/feed.xml`;
  const siteFeed = `${SITE.url}/podcast`;
  const updated = episodes[0]?.publishedAt ?? new Date().toISOString();

  const items = episodes
    .map((e) => {
      const link = `${SITE.url}/podcast/${e.slug}`;
      const pub = new Date(e.publishedAt).toUTCString();
      return `
    <item>
      <title>${esc(`Ep. ${e.number} — ${e.title}`)}</title>
      <link>${esc(link)}</link>
      <guid isPermaLink="true">${esc(link)}</guid>
      <pubDate>${esc(pub)}</pubDate>
      <description>${esc(e.summary)}</description>
      <itunes:duration>${isoDuration(e.durationSeconds)}</itunes:duration>
      <itunes:episode>${e.number}</itunes:episode>
      <itunes:episodeType>full</itunes:episodeType>
      <itunes:explicit>false</itunes:explicit>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(PODCAST_TITLE)}</title>
    <link>${esc(siteFeed)}</link>
    <atom:link href="${esc(selfUrl)}" rel="self" type="application/rss+xml" />
    <description>${esc(PODCAST_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${esc(new Date(updated).toUTCString())}</lastBuildDate>
    <itunes:author>${esc(PODCAST_AUTHOR)}</itunes:author>
    <itunes:summary>${esc(PODCAST_DESCRIPTION)}</itunes:summary>
    <itunes:explicit>false</itunes:explicit>
    <itunes:owner>
      <itunes:name>${esc(PODCAST_AUTHOR)}</itunes:name>
      <itunes:email>press@aegislens.io</itunes:email>
    </itunes:owner>
    <itunes:type>episodic</itunes:type>${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=300, stale-while-revalidate=900",
    },
  });
}
