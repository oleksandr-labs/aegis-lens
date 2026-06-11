import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@aegis/i18n-config";
import { getTag } from "@/lib/tags-index";
import { absoluteUrl, urls } from "@aegis/url-builder";
import { SITE } from "@/lib/site";

/** Locale-prefixed per-tag RSS. */
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
  { params }: { params: Promise<{ locale: string; slug: string }> },
) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
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
      link: absoluteUrl(SITE.url, urls.investigation(locale, inv.slug)),
      pubDate: new Date(inv.date).toUTCString(),
      description: inv.summary,
      category: "investigation",
    });
  }
  for (const g of tag.guides) {
    entries.push({
      title: g.title[locale] ?? g.title.en,
      link: absoluteUrl(SITE.url, urls.guide(locale, g.slug)),
      pubDate: new Date(g.publishedAt).toUTCString(),
      description: g.summary[locale] ?? g.summary.en,
      category: "guide",
    });
  }
  for (const eq of tag.equipment) {
    entries.push({
      title: eq.name[locale] ?? eq.name.en,
      link: absoluteUrl(SITE.url, urls.equipment(locale, eq.slug)),
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

  const selfPath =
    locale === "en" ? `/tags/${slug}/feed.xml` : `/${locale}/tags/${slug}/feed.xml`;
  const selfUrl = `${SITE.url}${selfPath}`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(`${SITE.name} — ${tag.label} tag`)}</title>
    <link>${SITE.url}${urls.tag(locale, slug)}</link>
    <description>${esc(`${tag.total} items tagged ${tag.label} across investigations, guides, and equipment.`)}</description>
    <language>${locale}</language>
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
