import { SITE } from "@/lib/site";

/**
 * Sitemap index referencing the main sitemap + sub-sitemaps for high-volume
 * URL buckets. Useful as the URL volume crosses comfortable single-file
 * thresholds.
 *
 * Engines that crawl this index treat each referenced sitemap as a peer
 * collection. We continue to expose /sitemap.xml as the primary entry; the
 * sub-sitemaps complement (overlap is fine and routine).
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date().toISOString();
  const children = [
    "/sitemap.xml",
    "/sitemap-events.xml",
    "/sitemap-cross-cuts.xml",
    "/sitemap-media.xml",
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${children
  .map(
    (path) => `  <sitemap>
    <loc>${SITE.url}${path}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`,
  )
  .join("\n")}
</sitemapindex>
`;

  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
