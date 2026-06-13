/**
 * Canonical URL utilities for Aegis Lens.
 *
 * Rules (see TODO/urls_slugs/TODO_canonical_strategy.md):
 * - One canonical per piece of content
 * - Pagination: canonical → first page (or self if independent)
 * - Facet/filter variants: noindex; canonical → base
 * - Tracking params stripped from canonicals
 * - No trailing slash
 * - HTTPS only; non-WWW
 */

// ---------- Pagination ----------

/**
 * Return the canonical URL for a paginated series.
 *
 * - Page 1 (or unset): canonical is the base URL (no `?page=` appended).
 * - Pages 2+: canonical is `base?page=N`.
 *
 * NOTE: In `<head>`, always emit `<link rel="canonical">` pointing to this
 * value, NOT to the "first page for all". For independent-value pages
 * (e.g. deep news archive) use self-canonical instead.
 *
 * @example
 *   canonicalForPagination("/news", 1)  // "/news"
 *   canonicalForPagination("/news", 3)  // "/news?page=3"
 */
export function canonicalForPagination(base: string, page: number): string {
  const clean = enforceNoTrailingSlash(base);
  if (page <= 1) return clean;
  return `${clean}?page=${page}`;
}

// ---------- Facet / filter variants ----------

/**
 * Return the canonical URL for a faceted/filtered variant.
 * All facet combos point back to the base URL; the facet page itself
 * should be marked `noindex` in its metadata.
 *
 * @example
 *   canonicalForFacet("/tools?category=osint&sort=stars") // "/tools"
 *   (base is already the clean path — caller strips params before calling)
 */
export function canonicalForFacet(base: string): string {
  return enforceNoTrailingSlash(base);
}

// ---------- Tracking-parameter stripping ----------

/** Parameters that MUST be stripped from canonical URLs. */
const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "msclkid",
  "mc_eid",
  "yclid",
];

/**
 * Strip all tracking query parameters from a URL string.
 * Preserves other query parameters (e.g. `page`, `q`).
 *
 * Works with both absolute URLs and path+query strings (relative).
 *
 * @example
 *   stripTrackingParams("/news?utm_source=twitter&page=2") // "/news?page=2"
 *   stripTrackingParams("https://aegis.com/search?q=osint&gclid=XYZ")
 *     // "https://aegis.com/search?q=osint"
 */
export function stripTrackingParams(url: string): string {
  // Use a synthetic base to handle relative paths in URL constructor.
  const DUMMY_BASE = "https://dummy.invalid";
  const isRelative = !url.startsWith("http://") && !url.startsWith("https://");
  const parsed = new URL(isRelative ? `${DUMMY_BASE}${url}` : url);

  for (const param of TRACKING_PARAMS) {
    parsed.searchParams.delete(param);
  }

  if (isRelative) {
    const path = parsed.pathname;
    const qs = parsed.search; // includes leading "?" or empty string
    const hash = parsed.hash;
    return `${path}${qs}${hash}`;
  }
  return parsed.toString();
}

// ---------- URL enforcement helpers ----------

/**
 * Strip a trailing slash from a URL.
 * The root path `/` is returned unchanged.
 *
 * @example
 *   enforceNoTrailingSlash("/news/")   // "/news"
 *   enforceNoTrailingSlash("/")        // "/"
 *   enforceNoTrailingSlash("/news")    // "/news"
 */
export function enforceNoTrailingSlash(url: string): string {
  if (url === "/") return url;
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

/**
 * Ensure the URL uses HTTPS. Replaces `http://` with `https://`.
 * Relative paths are returned unchanged (they have no scheme).
 *
 * @example
 *   enforceHttps("http://aegis.com/news")   // "https://aegis.com/news"
 *   enforceHttps("https://aegis.com/news")  // "https://aegis.com/news"
 *   enforceHttps("/news")                   // "/news"
 */
export function enforceHttps(url: string): string {
  if (url.startsWith("http://")) {
    return `https://${url.slice("http://".length)}`;
  }
  return url;
}

/**
 * Ensure the URL uses the non-WWW host. Strips `www.` prefix from the host.
 * Relative paths are returned unchanged.
 *
 * @example
 *   enforceNonWww("https://www.aegis.com/news")  // "https://aegis.com/news"
 *   enforceNonWww("https://aegis.com/news")      // "https://aegis.com/news"
 *   enforceNonWww("/news")                       // "/news"
 */
export function enforceNonWww(url: string): string {
  return url.replace(/^(https?:\/\/)www\./, "$1");
}

// ---------- Duplicate-content guard ----------

/**
 * Similarity threshold for programmatic-page dedup guard.
 *
 * Pages whose content similarity score (0–1) exceeds this value against
 * another already-indexed page should be marked `noindex` to avoid thin
 * / near-duplicate penalties.
 *
 * Adjust this constant in conjunction with the dedup scoring implementation.
 * Value 0.85 = 85 % similarity → treat as near-duplicate.
 */
export const similarityThreshold = 0.85;

// ---------- CI test fixtures ----------

/**
 * Shape of a CI test fixture for verifying canonical URL emission.
 *
 * Usage: build an array of these, render each `path`, and assert that
 * the `<link rel="canonical">` href matches `expectedCanonical`.
 *
 * @example
 *   const fixtures: BuildCanonicalCI[] = [
 *     { path: "/news/",       expectedCanonical: "https://aegis.com/news" },
 *     { path: "/news?page=1", expectedCanonical: "https://aegis.com/news" },
 *   ];
 */
export interface BuildCanonicalCI {
  /** Incoming path (may have trailing slash, tracking params, etc.) */
  path: string;
  /** Expected value of `<link rel="canonical" href="…">` */
  expectedCanonical: string;
}
