/**
 * Lowercase / trailing-slash URL policy — enforced at the edge.
 *
 * Canonical policy (see TODO/seo/TODO_url_seo.md and url-builder rules):
 *   - lowercase path (avoid mixed-case duplicate URLs)
 *   - NO trailing slash, except the bare root "/"
 *   - collapse repeated slashes
 *   - preserve query string and locale prefix verbatim
 *
 * This is a PURE function returning the canonical path (and whether a redirect
 * is needed). The middleware applies it as a 308/301 before other handling
 * (see handoff snippet in sprint261_shared_REDIRECTS.txt).
 *
 * NOTE: only the PATH is lowercased. Query values are case-preserving (they may
 * be tokens / search terms). Encoded segments are left untouched.
 */

export interface NormalizationResult {
  /** Canonical path (no host, leading slash). */
  path: string;
  /** True when the input differed from canonical → caller should redirect. */
  changed: boolean;
}

/**
 * Normalize a request path per the edge policy.
 *
 * @param pathname the request path (no query), e.g. "/Regions/UA/Kharkiv/"
 */
export function normalizePath(pathname: string): NormalizationResult {
  let p = pathname || "/";

  // Collapse duplicate slashes.
  p = p.replace(/\/{2,}/g, "/");

  // Lowercase the path only.
  const lower = p.toLowerCase();

  // Strip trailing slash (except bare root).
  const trimmed = lower.length > 1 ? lower.replace(/\/+$/, "") : lower;
  const finalPath = trimmed === "" ? "/" : trimmed;

  return { path: finalPath, changed: finalPath !== pathname };
}

/**
 * Full normalization keeping the query string intact.
 *
 * @example
 *   normalizeUrl("/News/", "?q=Kyiv") -> { path: "/news", search: "?q=Kyiv", changed: true }
 */
export function normalizeUrl(
  pathname: string,
  search = "",
): { path: string; search: string; changed: boolean } {
  const { path, changed } = normalizePath(pathname);
  return { path, search, changed };
}
