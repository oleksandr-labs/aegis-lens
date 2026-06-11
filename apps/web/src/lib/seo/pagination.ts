/**
 * Paginated-listing SEO helpers.
 *
 * TODO/seo/TODO_crawl_indexing.md:
 *  - Pagination via `rel=next/prev` + canonical (or load-more + canonical to first)
 *
 * Google dropped rel=next/prev as an *indexing* signal, but Bing/Yandex still use
 * it and it remains valid discovery markup, so we emit both rel=next/prev link
 * hints AND a canonical policy. Two supported strategies:
 *   - "self": each page self-canonicalises (paginated content is genuinely distinct)
 *   - "first": all pages canonicalise to page 1 (load-more / infinite-scroll mirror)
 *
 * Pure + typed; consumed by listing route metadata builders.
 */

export type CanonicalStrategy = "self" | "first";

export type PaginationInput = {
  /** Locale-prefixed base path WITHOUT the page segment, e.g. "/uk/news". */
  basePath: string;
  /** Current 1-based page number. */
  page: number;
  /** Total number of pages (>= 1). */
  totalPages: number;
  /** How to build a page URL. Default appends `?page=N` (page 1 omits it). */
  pageUrl?: (basePath: string, page: number) => string;
  /** Canonical policy. Default "self". */
  canonical?: CanonicalStrategy;
};

export type PaginationLinks = {
  /** rel="prev" target, or null on the first page. */
  prev: string | null;
  /** rel="next" target, or null on the last page. */
  next: string | null;
  /** Canonical URL per the chosen strategy. */
  canonical: string;
  /** First / last page URLs (handy for "load more" and bots). */
  first: string;
  last: string;
};

/** Default page-URL scheme: `?page=N`, with page 1 canonicalised to the bare path. */
export function defaultPageUrl(basePath: string, page: number): string {
  const clean = basePath.replace(/\/$/, "") || "/";
  return page <= 1 ? clean : `${clean}?page=${page}`;
}

export function buildPaginationLinks(input: PaginationInput): PaginationLinks {
  const { basePath, page, totalPages } = input;
  const pageUrl = input.pageUrl ?? defaultPageUrl;
  const strategy = input.canonical ?? "self";

  const clampedTotal = Math.max(1, totalPages);
  const clampedPage = Math.min(Math.max(1, page), clampedTotal);

  const first = pageUrl(basePath, 1);
  const last = pageUrl(basePath, clampedTotal);
  const prev = clampedPage > 1 ? pageUrl(basePath, clampedPage - 1) : null;
  const next = clampedPage < clampedTotal ? pageUrl(basePath, clampedPage + 1) : null;
  const canonical = strategy === "first" ? first : pageUrl(basePath, clampedPage);

  return { prev, next, canonical, first, last };
}

/**
 * Build the `<link>` "other" entries for Next.js `Metadata.alternates`/`other`.
 * Returns a flat record suitable for `Metadata.other` so the bare rel=prev/next
 * hints render in <head> (Next has no first-class field for them).
 */
export function paginationLinkTags(links: PaginationLinks): Record<string, string> {
  const tags: Record<string, string> = {};
  if (links.prev) tags["link:prev"] = links.prev;
  if (links.next) tags["link:next"] = links.next;
  return tags;
}

/**
 * Should page N be indexable? Page 1 always; deeper pages indexable under "self"
 * (distinct content) but excluded under "first" (they collapse to page 1).
 */
export function isPaginatedPageIndexable(
  page: number,
  strategy: CanonicalStrategy,
): boolean {
  if (page <= 1) return true;
  return strategy === "self";
}
