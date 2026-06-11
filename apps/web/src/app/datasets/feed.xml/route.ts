import { DATASETS } from "@/lib/datasets-seed";
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
  const sorted = [...DATASETS].sort(
    (a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime(),
  );
  const feedUrl = `${SITE.url}/datasets/feed.xml`;
  const datasetsUrl = `${SITE.url}/datasets`;

  const lastBuild = sorted[0]?.updated
    ? new Date(sorted[0].updated).toUTCString()
    : new Date().toUTCString();

  const items = sorted
    .slice(0, 20)
    .map((d) => {
      const datasetUrl = `${SITE.url}/datasets/${d.slug}`;
      const pubDate = new Date(d.updated).toUTCString();
      return `  <item>
    <title>${escape(d.title)}</title>
    <link>${escape(datasetUrl)}</link>
    <guid isPermaLink="true">${escape(datasetUrl)}</guid>
    <description>${escape(d.description)}</description>
    <pubDate>${pubDate}</pubDate>
    <category>${escape(d.format)}</category>
    <category>${escape(d.license)}</category>
  </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(SITE.name)} — Public Datasets</title>
    <link>${escape(datasetsUrl)}</link>
    <description>${escape("Open datasets released by Aegis Lens: verified events, sources, geography, and knowledge graph exports.")}</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${escape(feedUrl)}" rel="self" type="application/rss+xml"/>
    <managingEditor>data@aegislens.io (Aegis Lens)</managingEditor>
    <image>
      <url>${escape(SITE.url)}/brand/aegis-logo.svg</url>
      <title>${escape(SITE.name)}</title>
      <link>${escape(datasetsUrl)}</link>
    </image>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
