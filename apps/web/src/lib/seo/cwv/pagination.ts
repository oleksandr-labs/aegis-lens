/**
 * Pagination: rel=prev/next + canonical strategy.
 *
 * See TODO/seo/TODO_core_web_vitals.md ("Pagination via rel=prev/next +
 * canonical strategy"). The internal-link engine (TODO_internal_link_engine.md /
 * TODO_internal_links.md) owns crawl-graph link building; THIS module owns the
 * narrow CWV/crawlability concern: what canonical + prev/next a paginated
 * listing page should emit so paginated sets are not seen as duplicates or
 * soft-404s.
 *
 * Policy (matches current Google guidance + safe canonical practice):
 *  - Each page self-canonicalizes (page 2 canonicals to page 2, NOT page 1) so
 *    deep listing pages stay indexable and don't collapse into the first page.
 *  - rel=prev/next are emitted as <link> hints for clients that still use them.
 *  - Page 1 is the bare path with NO `?page=1` (canonical = clean URL).
 *  - Locale prefix is preserved verbatim (en = no prefix, uk = "/uk/...").
 */

export interface PaginationInput {
  /** Root-relative base path WITH locale prefix, no query. e.g. "/uk/regions". */
  basePath: string;
  /** 1-based current page. */
  page: number;
  /** Total number of pages (>= 1). */
  totalPages: number;
  /** Query param name for pages. Default "page". */
  pageParam?: string;
}

export interface PaginationLinks {
  /** Self-canonical URL for the current page. */
  canonical: string;
  /** Previous page URL or null on page 1. */
  prev: string | null;
  /** Next page URL or null on the last page. */
  next: string | null;
  /** True when the requested page is out of range (caller should 404). */
  outOfRange: boolean;
}

function pageUrl(basePath: string, page: number, pageParam: string): string {
  const clean = basePath.replace(/\/+$/, "") || "/";
  return page <= 1 ? clean : `${clean}?${pageParam}=${page}`;
}

/**
 * Compute canonical + prev/next for a paginated listing. Page numbers outside
 * [1, totalPages] are flagged `outOfRange` so the route can return a real 404
 * (prevents soft-404s on `?page=9999`).
 */
export function paginationLinks(input: PaginationInput): PaginationLinks {
  const { basePath, page, totalPages } = input;
  const pageParam = input.pageParam ?? "page";
  const outOfRange = page < 1 || (totalPages >= 1 && page > totalPages);

  const canonical = pageUrl(basePath, page, pageParam);
  const prev = page > 1 ? pageUrl(basePath, page - 1, pageParam) : null;
  const next = page < totalPages ? pageUrl(basePath, page + 1, pageParam) : null;

  return { canonical, prev, next, outOfRange };
}
