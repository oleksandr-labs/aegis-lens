import type { Locale } from "@aegis/types";

/**
 * Locale-URL contract for Aegis Lens.
 *
 * Rules (see TODO/urls_slugs/TODO_url_localization.md):
 * - Translated slugs per locale; never mix locales in one path
 * - Slug-collision detection across locales
 * - Missing-locale page → 301 to EN canonical + noindex
 * - Locale switcher preserves current path
 * - Never auto-redirect by IP (Googlebot ≠ user)
 * - Banner-suggest only; never force
 */

// ---------- Translated slug spec ----------

/**
 * Spec record for a human-reviewed translated slug.
 *
 * All slug translations MUST go through native-reviewer sign-off before
 * being written to the DB or static config. MT-only slugs are not accepted.
 *
 * @field entityId    Stable identifier of the entity this slug belongs to.
 * @field locale      Target locale for this slug.
 * @field slug        The translated slug (already slugified, no leading slash).
 * @field reviewedBy  Email / handle of the native reviewer who approved this.
 */
export interface TranslatedSlugSpec {
  entityId: string;
  locale: Locale;
  slug: string;
  reviewedBy: string;
}

// ---------- Slug-collision detection ----------

/**
 * Detect collisions in a slug map across locales.
 *
 * A collision occurs when two different entity IDs produce the same slug
 * within the same locale. The function returns an array of collision
 * descriptions for logging / CI failure output.
 *
 * @param slugMap  Keys are slugs; values are arrays of entity IDs that
 *                 resolved to that slug within a given locale.
 *                 Build this map per-locale before calling.
 *
 * @returns Array of collision records (empty → no collisions).
 *
 * @example
 *   const map = new Map([
 *     ["kharkiv", ["entity-1", "entity-2"]],   // collision
 *     ["kyiv",    ["entity-3"]],                // ok
 *   ]);
 *   detectSlugCollision(map);
 *   // [{ slug: "kharkiv", entityIds: ["entity-1", "entity-2"] }]
 */
export function detectSlugCollision(
  slugMap: Map<string, string[]>,
): { slug: string; entityIds: string[] }[] {
  const collisions: { slug: string; entityIds: string[] }[] = [];
  for (const [slug, entityIds] of slugMap) {
    if (entityIds.length > 1) {
      collisions.push({ slug, entityIds });
    }
  }
  return collisions;
}

// ---------- CI hreflang fixture ----------

/**
 * Shape of a CI fixture for verifying hreflang completeness.
 *
 * For every `path`, render the page and assert that:
 * 1. All `locales` appear as `<link rel=alternate hreflang="…">`.
 * 2. `xDefault` appears as `<link rel=alternate hreflang="x-default">`.
 *
 * @example
 *   const fixtures: HreflangCiFixture[] = [
 *     {
 *       path: "/regions/ua/kharkiv-oblast",
 *       locales: ["en", "uk"],
 *       xDefault: "en",
 *     },
 *   ];
 */
export interface HreflangCiFixture {
  /** Canonical path (EN, no locale prefix). */
  path: string;
  /** All locale variants that must be present in hreflang tags. */
  locales: Locale[];
  /** The locale that must carry `hreflang="x-default"`. */
  xDefault: Locale;
}

// ---------- Missing-locale redirect ----------

/**
 * Build a redirect spec for when a user visits a locale variant of a page
 * that has not yet been translated.
 *
 * The returned spec:
 * - `from`     — the locale-prefixed path that was visited.
 * - `to`       — the canonical path in `canonicalLocale` (typically EN).
 * - `noindex`  — always `true`; the visited URL must not be indexed.
 *
 * The caller is responsible for emitting the 301/302 response and the
 * `X-Robots-Tag: noindex` header on `from`.
 *
 * @example
 *   missingLocaleRedirect("/de/regions/ua/kharkiv", "de", "en")
 *   // { from: "/de/regions/ua/kharkiv", to: "/regions/ua/kharkiv", noindex: true }
 */
export function missingLocaleRedirect(
  path: string,
  visitedLocale: Locale,
  canonicalLocale: Locale,
): { from: string; to: string; noindex: true } {
  // Strip the visited-locale prefix to get the bare path.
  const prefix = `/${visitedLocale}`;
  const bare = path.startsWith(prefix) ? path.slice(prefix.length) || "/" : path;

  // Re-prefix with canonical locale (EN default = no prefix).
  const to = canonicalLocale === "en" ? bare : `/${canonicalLocale}${bare}`;

  return { from: path, to, noindex: true };
}

// ---------- Locale-switcher behaviour flags ----------

/**
 * When the user switches locale via the language switcher, the current
 * page path is preserved (translated slug if available, else fallback).
 *
 * This must be implemented in the locale switcher component; this constant
 * serves as the authoritative documentation flag referenced in tests.
 */
export const localeSwitcherPreservesPath = true as const;

/**
 * SEO pages must NEVER trigger an automatic locale redirect based on the
 * visitor's IP address or Accept-Language header.
 *
 * Rationale: Googlebot crawls from US IPs; auto-redirecting it would cause
 * it to index only the EN locale even for non-EN canonical pages.
 *
 * Show a banner suggestion instead (see `BannerSuggestLocale`).
 */
export const neverAutoRedirectByIp = true as const;

// ---------- Banner locale suggestion ----------

/**
 * Data shape for the locale-suggestion banner.
 *
 * Shown when the platform detects (via Accept-Language or geolocation) that
 * the user's preferred locale differs from the currently displayed locale.
 * The user clicks to switch; we never force a redirect.
 *
 * @field detected   The locale we believe the user prefers.
 * @field suggested  The locale we recommend switching to (may differ if the
 *                   detected locale is not fully available yet).
 * @field href       The URL of the suggested-locale variant of the current page.
 *
 * @example
 *   const banner: BannerSuggestLocale = {
 *     detected: "uk",
 *     suggested: "uk",
 *     href: "/uk/regions/ua/kharkiv-oblast",
 *   };
 */
export interface BannerSuggestLocale {
  detected: Locale;
  suggested: Locale;
  href: string;
}
