import { notFound } from "next/navigation";
import { getTag } from "@/lib/tags-index";
import { absoluteUrl, urls } from "@aegis/url-builder";
import { SITE } from "@/lib/site";

/**
 * RSS 2.0 feed for a single tag. Aggregates investigations, guides, and
 * equipment that share the tag. EN canonical; locale-prefixed feeds can
 * follow if there's demand.
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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const tag = getTag(slug);
  if (!tag) notFound();

  type Entry = {
    title: string;
    link: string;
    pubDate: string;
    description: string;
    category: string;
  };

  const entries: Entry[] = [];

  for (const inv of tag.investigations) {
    entries.push({
      title: inv.title,
      link: absoluteUrl(SITE.url, urls.investigation("en", inv.slug)),
      pubDate: new Date(inv.date).toUTCString(),
      description: inv.summary,
      category: "investigation",
    });
  }
  for (const g of tag.guides) {
    entries.push({
      title: g.title.en,
      link: absoluteUrl(SITE.url, urls.guide("en", g.slug)),
      pubDate: new Date(g.publishedAt).toUTCString(),
      description: g.summary.en,
      category: "guide",
    });
  }
  for (const eq of tag.equipment) {
    entries.push({
      title: eq.name.en,
      link: absoluteUrl(SITE.url, urls.equipment("en", eq.slug)),
      // Equipment lacks a publishedAt — use the current build time as a stable fallback.
      pubDate: new Date().toUTCString(),
      description: `${eq.type} · ${eq.origin}`,
      category: "equipment",
    });
  }

  entries.sort((a, b) => Date.parse(b.pubDate) - Date.parse(a.pubDate));

  const items = entries
    .map(
      (e) => `    <item>
      <title>${esc(e.title)}</title>
      <link>${e.link}</link>
      <guid isPermaLink="true">${e.link}</guid>
      <pubDate>${e.pubDate}</pubDate>
      <description>${esc(e.description)}</description>
      <category>${esc(e.category)}</category>
    </item>`,
    )
    .join("\n");

  const selfUrl = `${SITE.url}/tags/${slug}/feed.xml`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(`${SITE.name} — ${tag.label} tag`)}</title>
    <link>${SITE.url}/tags/${slug}</link>
    <description>${esc(`${tag.total} items tagged ${tag.label} across investigations, guides, and equipment.`)}</description>
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
