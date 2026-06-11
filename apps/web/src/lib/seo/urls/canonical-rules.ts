/**
 * Canonical policy rules — per page-type canonical strategy.
 *
 * Covers 10 page types. Used to drive the canonical resolver and noindex
 * decisions across the application.
 *
 * See TODO/urls_slugs/TODO_canonical_strategy.md and
 * apps/web/src/lib/seo/dedup/canonical-rules.ts (the lower-level resolver).
 * These policies are the human-readable source of truth; the dedup module
 * implements them mechanically.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type CanonicalStrategy =
  | "self"         // canonical = this page's URL (standard)
  | "strip-query"  // canonical = URL without tracking/filter query params
  | "redirect"     // 301/308 to the canonical variant; this URL should not exist
  | "noindex"      // robots noindex + canonical still self (don't pass equity)
  | "rel-paginate"; // rel=next/prev + first-page canonical for page 1+

export interface CanonicalPolicy {
  /** Page type identifier — matches route template names */
  pageType: string;
  /** The canonical strategy to apply */
  canonicalStrategy: CanonicalStrategy;
  /** Human-readable explanation for the editorial/engineering team */
  notes_en: string;
}

// ── Policies ──────────────────────────────────────────────────────────────────

/**
 * Canonical policies for all major page types.
 *
 * These map to the `CanonicalTemplate` type in dedup/canonical-rules.ts.
 * New templates MUST be assigned a policy here before shipping.
 */
export const CANONICAL_POLICIES: CanonicalPolicy[] = [
  {
    pageType: "homepage",
    canonicalStrategy: "self",
    notes_en:
      "The homepage canonical is always its own URL. EN: https://aegislens.com/. UK: https://aegislens.com/uk/. " +
      "Never point the homepage canonical to /en/ or vice versa.",
  },
  {
    pageType: "event-detail",
    canonicalStrategy: "self",
    notes_en:
      "Individual event pages are canonical to themselves. Any query params (filters, UTMs) " +
      "are stripped. The slug is the primary identifier; numeric IDs must not appear in the URL.",
  },
  {
    pageType: "filter-listing",
    canonicalStrategy: "strip-query",
    notes_en:
      "Category / region filter pages may carry ?type=, ?severity=, etc. The canonical strips " +
      "these filter params — the clean base URL is the canonical. This avoids creating unique " +
      "indexed pages for every filter combination.",
  },
  {
    pageType: "search-results",
    canonicalStrategy: "noindex",
    notes_en:
      "Search result pages (/search?q=...) are noindexed and self-canonical (clean base). " +
      "They expose thin, query-dependent content with no stable URL. Do not submit to sitemaps.",
  },
  {
    pageType: "paginated-listing",
    canonicalStrategy: "rel-paginate",
    notes_en:
      "Paginated list pages (e.g. /events?page=2) use rel=next/prev. Page 1 is canonical to " +
      "/events (no ?page=1). Pages 2+ are self-canonical to their own URL. Do not noindex " +
      "paginated pages; they receive link equity from rel=prev/next.",
  },
  {
    pageType: "user-profile",
    canonicalStrategy: "self",
    notes_en:
      "Public analyst / contributor profiles are canonical to themselves. Profiles with " +
      "private visibility are noindexed separately (handled by NOINDEX_ROUTES). " +
      "URL slug must be username-based, not numeric ID.",
  },
  {
    pageType: "embed",
    canonicalStrategy: "noindex",
    notes_en:
      "Embed / iframe-builder pages (/embed/*) are noindexed. They are UX surfaces for " +
      "third-party integration, not crawlable content. Self-canonical but excluded from sitemap.",
  },
  {
    pageType: "api-endpoint",
    canonicalStrategy: "noindex",
    notes_en:
      "API routes (/api/*) must never be indexed. They return JSON/binary, not HTML. " +
      "Ensure X-Robots-Tag: noindex is returned on all /api/* responses at the edge.",
  },
  {
    pageType: "admin",
    canonicalStrategy: "noindex",
    notes_en:
      "Admin and authenticated management pages (/admin/*, /settings/*, /cases/*) are noindexed " +
      "and excluded from the sitemap. Authentication gates these pages at the application layer; " +
      "noindex is the SEO-level defence.",
  },
  {
    pageType: "duplicate-slug",
    canonicalStrategy: "redirect",
    notes_en:
      "When a slug collision is detected (e.g. a legacy URL or a renamed entity), the old URL " +
      "should 301-redirect to the canonical slug. Never serve two different paths for the same " +
      "content — pick one canonical and redirect all others. " +
      "Track in apps/web/src/lib/seo/redirects/ to preserve link equity.",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Look up the canonical policy for a given page type. */
export function getCanonicalPolicy(pageType: string): CanonicalPolicy | undefined {
  return CANONICAL_POLICIES.find((p) => p.pageType === pageType);
}

/**
 * Convenience: return true if the page type should be noindexed.
 * Combines `noindex` strategy and known admin/embed/API patterns.
 */
export function isNoindexPageType(pageType: string): boolean {
  const policy = getCanonicalPolicy(pageType);
  return policy?.canonicalStrategy === "noindex";
}
