import { absoluteUrl } from "@aegis/url-builder";
import { ACTIVE_LOCALES, type Locale } from "@aegis/i18n-config";
import { SITE } from "@/lib/site";

/**
 * Shared XML sitemap builder for sub-sitemap shards. Each shard handler
 * produces its own list of (pathFor, priority) tuples and pipes them through
 * `renderSitemapXml`. Kept locale-aware so each URL surfaces hreflang
 * `<xhtml:link rel="alternate">` entries identical to the main /sitemap.xml.
 */

export type ShardRoute = {
  pathFor: (lc: Locale) => string;
  priority?: number;
};

function escXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderSitemapXml(routes: ShardRoute[]): string {
  const now = new Date().toISOString();
  const urls = routes.map((r) => {
    const enUrl = absoluteUrl(SITE.url, r.pathFor("en"));
    const alternates = ACTIVE_LOCALES.map(
      (lc) =>
        `      <xhtml:link rel="alternate" hreflang="${lc}" href="${escXml(absoluteUrl(SITE.url, r.pathFor(lc)))}"/>`,
    ).join("\n");
    const xDefault = `      <xhtml:link rel="alternate" hreflang="x-default" href="${escXml(enUrl)}"/>`;
    return `  <url>
    <loc>${escXml(enUrl)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${(r.priority ?? 0.5).toFixed(1)}</priority>
${alternates}
${xDefault}
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;
}

export function sitemapResponse(routes: ShardRoute[]): Response {
  return new Response(renderSitemapXml(routes), {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
