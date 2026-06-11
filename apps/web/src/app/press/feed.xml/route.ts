import { PRESS_RELEASES } from "@/lib/press-seed";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildPressFeed(): string {
  const selfUrl = `${SITE.url}/press/feed.xml`;
  const channelUrl = `${SITE.url}/press`;

  const latestDate = PRESS_RELEASES.reduce((latest, pr) =>
    pr.date > latest.date ? pr : latest,
  ).date;

  const items = PRESS_RELEASES.sort((a, b) => b.date.localeCompare(a.date))
    .map((pr) => {
      const link = `${channelUrl}#${pr.slug}`;
      return `    <item>
      <title>${escapeXml(pr.headline)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(pr.date).toUTCString()}</pubDate>
      <description>${escapeXml(pr.summary)}</description>
      <category>${escapeXml(pr.category)}</category>
      <source url="${selfUrl}">${escapeXml(SITE.name)} Press Releases</source>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.name)} — Press Releases</title>
    <link>${channelUrl}</link>
    <description>Official press releases and company announcements from ${escapeXml(SITE.name)}.</description>
    <language>en</language>
    <lastBuildDate>${new Date(latestDate).toUTCString()}</lastBuildDate>
    <atom:link href="${selfUrl}" rel="self" type="application/rss+xml"/>
    <managingEditor>press@aegislens.io (${escapeXml(SITE.name)} Press)</managingEditor>
    <webMaster>press@aegislens.io (${escapeXml(SITE.name)} Press)</webMaster>
    <image>
      <url>${SITE.url}/brand/aegis-logo-1024.png</url>
      <title>${escapeXml(SITE.name)}</title>
      <link>${SITE.url}</link>
    </image>
${items}
  </channel>
</rss>`;
}

export async function GET() {
  return new Response(buildPressFeed(), {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
