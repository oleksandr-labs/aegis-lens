import { listInvestigations } from "@/lib/investigations-seed";
import { absoluteUrl, urls } from "@aegis/url-builder";
import { SITE } from "@/lib/site";

/**
 * RSS 2.0 feed of Aegis Lens investigations, newest first.
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
  const items = listInvestigations()
    .map((inv) => {
      const link = absoluteUrl(SITE.url, urls.investigation("en", inv.slug));
      const pubDate = new Date(inv.date).toUTCString();
      return `    <item>
      <title>${esc(inv.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${esc(inv.summary)}</description>
      <author>${esc(`noreply@aegislens.io (${inv.analyst})`)}</author>
      ${inv.tags.map((t) => `<category>${esc(t)}</category>`).join("\n      ")}
    </item>`;
    })
    .join("\n");

  const selfUrl = `${SITE.url}/investigations/feed.xml`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(`${SITE.name} — investigations`)}</title>
    <link>${SITE.url}/investigations</link>
    <description>${esc("Long-form OSINT investigations from Aegis Lens analysts.")}</description>
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
