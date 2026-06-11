/**
 * Faceted-navigation crawl policy.
 *
 * TODO/seo/TODO_crawl_indexing.md:
 *  - Faceted nav blocked from crawling beyond canonical facets
 *
 * Faceted listings (filters: class, country, severity, year, sort, view…) explode
 * into near-infinite parameter combinations that waste crawl budget and create
 * duplicate content. Policy: a small allow-list of *canonical facets* (single,
 * SEO-valuable filters that map to real landing pages) are crawlable + indexable;
 * everything else (combinations, sort/view/pagination params) is `noindex,follow`
 * and excluded from the sitemap, plus emitted as robots `Disallow` patterns.
 *
 * Pure + typed. The robots `Disallow` patterns produced here feed the robots.txt
 * handoff. The per-request decision feeds page metadata (noindex) + sitemap gating.
 */

/** A facet key that is allowed to stand alone as a canonical, indexable landing page. */
export type CanonicalFacet = {
  /** Query-param key, e.g. "class" or "country". */
  param: string;
  /**
   * Allowed values, or "*" for any single value. Combinations of multiple
   * canonical facets are still NOT canonical (only one facet at a time).
   */
  values: string[] | "*";
};

/**
 * Aegis Lens canonical facets — exactly one of these, alone, on a listing page,
 * is indexable. These mirror real programmatic landing pages we already build
 * (topic hubs, country hubs). Sort/view/page params are never canonical.
 */
export const CANONICAL_FACETS: CanonicalFacet[] = [
  { param: "class", values: "*" },
  { param: "country", values: "*" },
  { param: "year", values: "*" },
];

/** Params that are purely presentational / paginating — always non-canonical. */
export const NON_CANONICAL_PARAMS = ["sort", "view", "page", "per_page", "layout", "q", "ref"];

export type FacetDecision = {
  /** True if the URL should be indexable & sitemap-eligible. */
  index: boolean;
  /** Always true — we let bots follow links even on noindex listings. */
  follow: true;
  /** Robots meta directive string. */
  robots: "index,follow" | "noindex,follow";
  reason: string;
};

/**
 * Decide indexability for a set of active query params on a listing page.
 * Indexable iff: zero params (the base listing) OR exactly one canonical facet
 * with an allowed value and no other params present.
 */
export function decideFacet(
  params: Record<string, string | string[] | undefined>,
  facets: CanonicalFacet[] = CANONICAL_FACETS,
): FacetDecision {
  const active = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0),
  );

  if (active.length === 0) {
    return { index: true, follow: true, robots: "index,follow", reason: "base listing, no facets" };
  }

  // Any presentational param present → noindex.
  const presentational = active.find(([k]) => NON_CANONICAL_PARAMS.includes(k));
  if (presentational) {
    return {
      index: false,
      follow: true,
      robots: "noindex,follow",
      reason: `presentational param "${presentational[0]}" present`,
    };
  }

  if (active.length > 1) {
    return {
      index: false,
      follow: true,
      robots: "noindex,follow",
      reason: `facet combination (${active.map(([k]) => k).join("+")}) is non-canonical`,
    };
  }

  // Exactly one param — must be a canonical facet with an allowed value.
  const [key, raw] = active[0]!;
  const value = Array.isArray(raw) ? raw[0]! : raw!;
  const facet = facets.find((f) => f.param === key);
  if (!facet) {
    return { index: false, follow: true, robots: "noindex,follow", reason: `unknown facet "${key}"` };
  }
  if (facet.values !== "*" && !facet.values.includes(value)) {
    return {
      index: false,
      follow: true,
      robots: "noindex,follow",
      reason: `facet "${key}=${value}" not in canonical allow-list`,
    };
  }
  // Multi-value of a single canonical facet (e.g. ?class=a&class=b) is non-canonical.
  if (Array.isArray(raw) && raw.length > 1) {
    return {
      index: false,
      follow: true,
      robots: "noindex,follow",
      reason: `multi-select facet "${key}" is non-canonical`,
    };
  }
  return { index: true, follow: true, robots: "index,follow", reason: `canonical facet "${key}"` };
}

/**
 * Robots `Disallow` patterns to keep crawlers out of non-canonical facet space.
 * We block presentational params outright; canonical facet params are left
 * crawlable (their single-value landing pages are valuable).
 *
 * These strings are intended for the robots.txt handoff (shared file).
 */
export function facetDisallowPatterns(
  nonCanonicalParams: string[] = NON_CANONICAL_PARAMS,
): string[] {
  // robots.txt wildcard syntax (supported by Google/Bing): block any URL carrying
  // a presentational query param.
  return nonCanonicalParams.map((p) => `/*?*${p}=`);
}
