/**
 * Filter / sort / tracking URL variants → base canonical (TODO #5).
 *
 * A page like `/news?page=2&utm_source=x&sort=newest&ref=tw` must canonicalize
 * to a single base. We:
 *  - drop tracking params entirely (utm_*, gclid, fbclid, ref, …)
 *  - drop pure filter/sort params that produce a duplicate of the base view
 *  - PRESERVE pagination (`page`) and a small allow-list of params that
 *    genuinely change page identity (e.g. `q` for search, `oblasts` for
 *    compare) — those are handled by their own canonical/noindex rules.
 *
 * Pure, no network. Operates on path+query strings, never fetches.
 */

/** Query params stripped unconditionally — they never change content. */
export const TRACKING_PARAMS: readonly string[] = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "msclkid",
  "yclid",
  "ref",
  "ref_src",
  "referrer",
  "mc_cid",
  "mc_eid",
  "igshid",
  "source",
  "_hsenc",
  "_hsmi",
];

/**
 * Filter / sort params that re-order or filter an existing listing without
 * creating genuinely new content → collapse to the base canonical.
 */
export const FILTER_SORT_PARAMS: readonly string[] = [
  "sort",
  "order",
  "orderby",
  "dir",
  "view",
  "layout",
  "filter",
  "tab",
  "from",
  "to",
  "range",
  "status",
  "type",
];

/**
 * Params that DO define a distinct canonical resource and must be preserved.
 * (Pagination is handled separately by `pagination-canonical.ts`, but kept here
 * so `toCanonicalParams` doesn't accidentally strip it.)
 */
export const IDENTITY_PARAMS: readonly string[] = [
  "page",
  "q",
  "oblasts",
];

export type ParamCanonicalOptions = {
  trackingParams?: readonly string[];
  filterSortParams?: readonly string[];
  identityParams?: readonly string[];
  /** When true, also drop `page` (used where pagination canonicalizes to p1). */
  dropPagination?: boolean;
};

/**
 * Given a URL (absolute or path+query), return the canonical path+query with
 * tracking + filter/sort params removed and identity params preserved & sorted
 * for stability.
 */
export function toCanonicalPath(
  url: string,
  opts: ParamCanonicalOptions = {},
): string {
  const tracking = new Set(opts.trackingParams ?? TRACKING_PARAMS);
  const filterSort = new Set(opts.filterSortParams ?? FILTER_SORT_PARAMS);
  const identity = new Set(opts.identityParams ?? IDENTITY_PARAMS);

  // Parse against a dummy base so relative paths work.
  const u = new URL(url, "https://canonical.local");
  const kept: [string, string][] = [];

  for (const [key, value] of u.searchParams.entries()) {
    const k = key.toLowerCase();
    if (tracking.has(k)) continue;
    if (filterSort.has(k)) continue;
    if (identity.has(k)) {
      if (k === "page" && opts.dropPagination) continue;
      kept.push([key, value]);
    }
    // Anything not explicitly identity is treated as non-canonical and dropped.
  }

  // Stable ordering so equivalent URLs produce one canonical string.
  kept.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));

  const search = kept
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

  const path = u.pathname.replace(/\/+$/, "") || "/";
  return search ? `${path}?${search}` : path;
}

/** True if the URL carries only strip-able params (a pure variant of its base). */
export function isParamVariant(url: string): boolean {
  const u = new URL(url, "https://canonical.local");
  if ([...u.searchParams.keys()].length === 0) return false;
  const base = (u.pathname.replace(/\/+$/, "") || "/");
  return toCanonicalPath(url) === base;
}
