/**
 * Keyword-to-page mapping for Aegis Lens / Ukrainian MAP.
 *
 * Provides:
 *  - KEYWORD_PAGE_MAP — explicit keyword→page assignments
 *  - getKeywordsForPage — query all keywords targeting a page path
 *  - getPrimaryKeywordForPage — query the single primary keyword for a page
 */

import type { KeywordEntry, KeywordPageMapping } from "./types";
import { KEYWORD_CLUSTERS } from "./keyword-clusters";

// ─── Helper: resolve keywords by page path ─────────────────────────────────

/** Returns all KeywordEntry items whose targetPagePath matches pagePattern. */
export function getKeywordsForPage(pagePattern: string): KeywordEntry[] {
  return KEYWORD_CLUSTERS.filter((kw) => kw.targetPagePath === pagePattern);
}

/**
 * Returns the highest-priority EN keyword for a given page path.
 * Ties broken by priority number (lower = more important), then insertion order.
 */
export function getPrimaryKeywordForPage(
  pagePattern: string,
): KeywordEntry | undefined {
  const candidates = getKeywordsForPage(pagePattern).filter(
    (kw) => kw.locale === "en",
  );
  if (candidates.length === 0) return undefined;
  return candidates.reduce((best, current) =>
    current.priority < best.priority ? current : best,
  );
}

// ─── Helpers to build the mapping ──────────────────────────────────────────

function buildMapping(
  pagePattern: string,
  pageType: KeywordPageMapping["pageType"],
): KeywordPageMapping | null {
  const primary = getPrimaryKeywordForPage(pagePattern);
  if (!primary) return null;
  const secondary = getKeywordsForPage(pagePattern).filter(
    (kw) => kw !== primary,
  );
  return { pagePattern, primaryKeyword: primary, secondaryKeywords: secondary, pageType };
}

// ─── Explicit mapping table ─────────────────────────────────────────────────

/**
 * Maps every distinct target page to its primary + secondary keywords.
 * Pillar pages aggregate multiple clusters; cluster/comparison/region pages
 * are more focused.
 */
export const KEYWORD_PAGE_MAP: KeywordPageMapping[] = [
  {
    pagePattern: "/",
    pageType: "pillar",
    primaryKeyword: getPrimaryKeywordForPage("/")!,
    secondaryKeywords: getKeywordsForPage("/").filter(
      (kw) => kw !== getPrimaryKeywordForPage("/"),
    ),
  },
  // Blog — verification cluster
  ...((): KeywordPageMapping[] => {
    const pages: Array<[string, KeywordPageMapping["pageType"]]> = [
      ["/blog/how-to-verify-osint", "cluster"],
      ["/blog/geolocation-osint", "cluster"],
      ["/blog/image-verification", "cluster"],
      // Region pages
      ["/regions/donetsk", "region"],
      ["/regions/black-sea", "region"],
      // Comparison pages
      ["/compare/palantir-alternative", "comparison"],
      ["/compare/liveuamap-alternative", "comparison"],
    ];
    return pages
      .map(([pat, type]) => buildMapping(pat, type))
      .filter((m): m is KeywordPageMapping => m !== null);
  })(),
];
