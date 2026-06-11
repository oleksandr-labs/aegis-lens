import { isLocale, type Locale } from "@aegis/i18n-config";
import { listReports } from "@/lib/reports-seed";
import { absoluteUrl, urls } from "@aegis/url-builder";
import { SITE } from "@/lib/site";

/** Locale-prefixed reports RSS. */
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
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const selfPath =
    locale === "en" ? `/reports/feed.xml` : `/${locale}/reports/feed.xml`;

  const reports = listReports()
    .slice()
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

  const items = reports
    .map((r) => {
      const link = absoluteUrl(SITE.url, urls.report(locale, r.slug));
      const pubDate = new Date(r.publishedAt).toUTCString();
      const title = r.title[locale] ?? r.title.en;
      const summary = r.summary[locale] ?? r.summary.en;
      const desc = `${r.kind} · by ${r.author} · ${r.citations.length} citation${r.citations.length === 1 ? "" : "s"}\n\n${summary}`;
      return `    <item>
      <title>${esc(title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${esc(desc)}</description>
      <author>${esc(`noreply@aegislens.io (${r.author})`)}</author>
      <category>${esc(r.kind)}</category>
    </item>`;
    })
    .join("\n");

  const selfUrl = `${SITE.url}${selfPath}`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(`${SITE.name} — reports`)}</title>
    <link>${SITE.url}${urls.reports(locale)}</link>
    <description>${esc("Published reports — weeklies, incident analyses, regional briefs, trends, methodology.")}</description>
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
