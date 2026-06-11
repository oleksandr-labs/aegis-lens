import { SITE } from "@/lib/site";
import { SITEMAP_SEGMENTS, type SitemapSegment } from "./sitemap-segments";
import { paginateRoutes, MAX_URLS_PER_SITEMAP } from "./sitemap-limits";

/**
 * Sitemap-index builder. Produces a `<sitemapindex>` document referencing one
 * `<sitemap>` per template segment (and, where a segment overflows the 50k
 * URL cap, one entry per page: `seg-1.xml`, `seg-2.xml`, ...).
 *
 * Pure function (XML string in → string out) so it is unit-testable and can be
 * served from the existing `app/sitemap-index.xml/route.ts` (see handoff).
 */

export type IndexEntry = {
  /** Absolute-from-root path to a child sitemap. */
  path: string;
  /** ISO lastmod for the child. */
  lastmod: string;
};

function escXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Expand a segment into one or more child sitemap paths. `urlCounts` maps a
 * segment id → live URL count; segments exceeding the cap are split into
 * paged children using the limits helper. Unknown counts default to a single
 * page (the common case for small segments).
 */
export function expandSegment(
  seg: SitemapSegment,
  urlCount?: number,
): string[] {
  if (urlCount === undefined || urlCount <= MAX_URLS_PER_SITEMAP) {
    return [seg.path];
  }
  // Page the segment: seg.path "/sitemap-events.xml" -> "/sitemap-events-2.xml"
  const pages = paginateRoutes(
    Array.from({ length: urlCount }, (_, i) => i),
  );
  const base = seg.path.replace(/\.xml$/, "");
  return pages.map((_page, idx) =>
    idx === 0 ? seg.path : `${base}-${idx + 1}.xml`,
  );
}

/**
 * Build the full set of index entries from the segment registry. `urlCounts`
 * is optional live data (segment id → count) used only to decide paging.
 */
export function buildIndexEntries(
  urlCounts: Record<string, number> = {},
  now: string = new Date().toISOString(),
): IndexEntry[] {
  const entries: IndexEntry[] = [];
  for (const seg of SITEMAP_SEGMENTS) {
    for (const path of expandSegment(seg, urlCounts[seg.id])) {
      entries.push({ path, lastmod: now });
    }
  }
  return entries;
}

/** Render a `<sitemapindex>` XML document from index entries. */
export function renderSitemapIndex(entries: IndexEntry[]): string {
  const body = entries
    .map(
      (e) => `  <sitemap>
    <loc>${escXml(SITE.url + e.path)}</loc>
    <lastmod>${escXml(e.lastmod)}</lastmod>
  </sitemap>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>
`;
}

/** One-shot: registry (+ optional live counts) → index XML. */
export function buildSitemapIndexXml(
  urlCounts?: Record<string, number>,
): string {
  return renderSitemapIndex(buildIndexEntries(urlCounts ?? {}));
}
