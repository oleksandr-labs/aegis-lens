/**
 * Pagination canonical strategy (TODO #7).
 *
 * Google no longer uses rel=prev/next. The modern guidance:
 *  - Each paginated page (`?page=N`) self-canonicalizes (page 2 canonical =
 *    page 2), so deep items remain discoverable; it must NOT canonical back to
 *    page 1 (that would hide pages 2..N's links/content from indexing).
 *  - Page 1 must NOT carry a `?page=1` param — that is a duplicate of the bare
 *    listing; `?page=1` canonicalizes to the param-less base.
 *  - `pageFor` is the page-builder closure (locale-aware) the caller already
 *    has from `@aegis/url-builder`.
 *
 * Pure, no network.
 */

export type PaginationCanonicalInput = {
  /** Locale-aware builder: given a 1-based page number → path. */
  pageFor: (page: number) => string;
  /** Current page (1-based). Values < 1 are treated as 1. */
  currentPage: number;
};

export type PaginationCanonical = {
  /** Path this page should declare as canonical. */
  canonicalPath: string;
  /** Whether `?page=1` (or page<=1) collapsed to the base. */
  collapsedToBase: boolean;
};

/**
 * Resolve the canonical path for a paginated listing page.
 *
 * - page <= 1 → base listing (no `page` param). `collapsedToBase` is true when
 *   the input was an explicit `page=1`.
 * - page >= 2 → self-canonical to that same page.
 */
export function paginationCanonical(
  input: PaginationCanonicalInput,
): PaginationCanonical {
  const n = Number.isFinite(input.currentPage)
    ? Math.floor(input.currentPage)
    : 1;

  if (n <= 1) {
    return { canonicalPath: input.pageFor(1), collapsedToBase: n === 1 };
  }
  return { canonicalPath: input.pageFor(n), collapsedToBase: false };
}

/**
 * `pageFor` should already omit the param for page 1. This helper documents the
 * expected contract and gives callers a default for builders that take a
 * `page?: number` (like `urls.news`): page 1 → no param, page N → `?page=N`.
 */
export function withPageParam(base: string, page: number): string {
  if (page <= 1) return base;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}page=${page}`;
}
