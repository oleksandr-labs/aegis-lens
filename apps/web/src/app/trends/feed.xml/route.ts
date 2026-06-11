import { TRENDS } from "@/lib/trends-seed";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const sorted = [...TRENDS].sort(
    (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  );
  const feedUrl = `${SITE.url}/trends/feed.xml`;
  const trendsUrl = `${SITE.url}/trends`;

  const lastBuild = sorted[0]?.updatedAt
    ? new Date(sorted[0].updatedAt).toUTCString()
    : new Date().toUTCString();

  const items = sorted
    .slice(0, 20)
    .map((t) => {
      const postUrl = `${SITE.url}/trends/${t.slug}`;
      const pubDate = new Date(t.publishedAt).toUTCString();
      const cats = t.tags.map((tag) => `    <category>${escape(tag)}</category>`).join("\n");
      return `  <item>
    <title>${escape(t.title)}</title>
    <link>${escape(postUrl)}</link>
    <guid isPermaLink="true">${escape(postUrl)}</guid>
    <description>${escape(t.description)}</description>
    <pubDate>${pubDate}</pubDate>
    <author>desk@aegislens.io (Aegis Lens)</author>
${cats}
  </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(SITE.name)} — Trends</title>
    <link>${escape(trendsUrl)}</link>
    <description>${escape("Emerging conflict and security trends tracked by Aegis Lens — anchored to verifiable event series.")}</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${escape(feedUrl)}" rel="self" type="application/rss+xml"/>
    <managingEditor>desk@aegislens.io (Aegis Lens)</managingEditor>
    <image>
      <url>${escape(SITE.url)}/brand/aegis-logo.svg</url>
      <title>${escape(SITE.name)}</title>
      <link>${escape(trendsUrl)}</link>
    </image>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
