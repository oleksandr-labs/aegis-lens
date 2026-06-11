import { listReports } from "@/lib/reports-seed";
import { absoluteUrl, urls } from "@aegis/url-builder";
import { SITE } from "@/lib/site";

/**
 * RSS 2.0 feed of Aegis Lens reports, newest first.
 */
export const dynamic = "force-dynamic";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const reports = listReports()
    .slice()
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

  const items = reports
    .map((r) => {
      const link = absoluteUrl(SITE.url, urls.report("en", r.slug));
      const pubDate = new Date(r.publishedAt).toUTCString();
      const desc = `${r.kind} · by ${r.author} · ${r.citations.length} citation${r.citations.length === 1 ? "" : "s"}\n\n${r.summary.en}`;
      return `    <item>
      <title>${esc(r.title.en)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${esc(desc)}</description>
      <author>${esc(`noreply@aegislens.io (${r.author})`)}</author>
      <category>${esc(r.kind)}</category>
    </item>`;
    })
    .join("\n");

  const selfUrl = `${SITE.url}/reports/feed.xml`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(`${SITE.name} — reports`)}</title>
    <link>${SITE.url}/reports</link>
    <description>${esc("Published reports — weeklies, incident analyses, regional briefs, trends, methodology.")}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${selfUrl}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=900, stale-while-revalidate=3600",
    },
  });
}
