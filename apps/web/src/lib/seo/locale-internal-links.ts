/**
 * Per-locale internal links — Sprint 2.73.
 *
 * Closes TODO/seo/TODO_international_seo.md:
 *  "Per-locale internal links (don't cross-link locales)"
 *
 * Rule: an English page may only link to English pages. A Ukrainian page may
 * only link to Ukrainian pages. Cross-locale internal links break the
 * hreflang + crawl-budget model by sending Googlebot from one locale cluster
 * into another, diluting the per-locale PageRank signal.
 *
 * This module provides:
 *  - `buildLocaleInternalLinks` — builds locale-safe internal link lists
 *  - `validateNoLocaleLeakage` — validates an existing link set for cross-locale links
 *  - Types: LocaleLink, LocalePageMap, ValidationResult
 *
 * Pure — no network.
 */

import type { SupportedLocale } from "./i18n-seo";

// ── Types ──────────────────────────────────────────────────────────────────────

/** A single internal link resolved within the current page's locale. */
export interface LocaleLink {
  url: string;
  /** Localised anchor text. */
  anchor: string;
  /** Locale of the target page (must match the source page's locale). */
  locale: SupportedLocale;
  /** Semantic relation type. */
  relation: "related" | "hub" | "sibling" | "breadcrumb";
}

/** A page entry in the locale-aware page index. */
export interface LocalePage {
  /** Absolute URL including locale prefix (e.g. /uk/regions/kharkiv). */
  url: string;
  locale: SupportedLocale;
  title: string;
  /** Template family — used for same-template preference. */
  template: string;
  /** Tags / slugs for relevance matching. */
  tags?: string[];
}

/**
 * Flat locale-aware page map.
 *
 * Key format: `{locale}:{path}` — e.g. "en:/regions/kharkiv" or "uk:/uk/regions/kharkiv".
 * Using a compound key avoids URL-collision between /en/foo and /uk/foo.
 */
export type LocalePageMap = Map<string, LocalePage>;

/** Result of locale-leakage validation. */
export interface ValidationResult {
  valid: boolean;
  /** Violations: links whose target locale differs from the source locale. */
  violations: Array<{
    sourceUrl: string;
    targetUrl: string;
    sourceLocale: SupportedLocale;
    targetLocale: SupportedLocale;
    message: string;
  }>;
}

// ── Locale extraction ──────────────────────────────────────────────────────────

const KNOWN_LOCALES: SupportedLocale[] = ["en", "uk", "ru", "pl", "de", "ro", "fr", "es"];

/**
 * Extract the locale from a URL path.
 * Paths without a locale prefix (e.g. /regions/kharkiv) are treated as "en"
 * (the default locale in the Next.js i18n config).
 */
export function extractLocaleFromUrl(url: string): SupportedLocale {
  // Strip protocol + host if present
  let path = url;
  try {
    const parsed = new URL(url, "https://aegislens.com");
    path = parsed.pathname;
  } catch {
    // Already a path
  }

  const match = path.match(/^\/([a-z]{2})(\/|$)/);
  if (match) {
    const candidate = match[1] as SupportedLocale;
    if (KNOWN_LOCALES.includes(candidate) && candidate !== "en") {
      return candidate;
    }
  }
  return "en";
}

// ── Locale-safe link builder ───────────────────────────────────────────────────

/**
 * Build a ranked list of internal links for a given page, guaranteed to stay
 * within the same locale.
 *
 * Algorithm:
 *  1. Filter the page map to entries with the same locale.
 *  2. Exclude the source page itself.
 *  3. Prefer same-template pages, then same-tag pages, then any same-locale page.
 *  4. Return up to `maxLinks` entries.
 *
 * @param page       URL of the source page.
 * @param locale     Locale of the source page.
 * @param pages      Full locale page map.
 * @param maxLinks   Maximum number of links to return (default 5).
 * @param sourceTemplate  Optional template for same-template preference.
 * @param sourceTags      Optional tags for relevance matching.
 */
export function buildLocaleInternalLinks(
  page: string,
  locale: SupportedLocale,
  pages: LocalePageMap,
  options: {
    maxLinks?: number;
    sourceTemplate?: string;
    sourceTags?: string[];
  } = {},
): LocaleLink[] {
  const { maxLinks = 5, sourceTemplate, sourceTags = [] } = options;

  // Collect same-locale candidates, excluding self
  const sameLocale: LocalePage[] = [];
  for (const [, candidate] of pages) {
    if (candidate.locale !== locale) continue;
    if (candidate.url === page) continue;
    sameLocale.push(candidate);
  }

  // Score candidates: higher = more relevant
  const scored = sameLocale.map((candidate) => {
    let score = 0;

    // Same template gets a priority boost
    if (sourceTemplate && candidate.template === sourceTemplate) score += 10;

    // Tag overlap
    if (sourceTags.length > 0 && candidate.tags) {
      const sourceTagSet = new Set(sourceTags);
      const overlap = candidate.tags.filter((t) => sourceTagSet.has(t)).length;
      score += overlap * 3;
    }

    return { candidate, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, maxLinks).map(({ candidate }) => ({
    url: candidate.url,
    anchor: candidate.title,
    locale: candidate.locale,
    relation: deriveRelation(candidate, sourceTemplate),
  }));
}

function deriveRelation(
  candidate: LocalePage,
  sourceTemplate?: string,
): LocaleLink["relation"] {
  if (!sourceTemplate) return "related";
  // Hub pages link down as "hub"; spoke pages link up as "hub"
  if (candidate.template.endsWith("-hub")) return "hub";
  if (candidate.template === sourceTemplate) return "sibling";
  return "related";
}

// ── Locale leakage validator ───────────────────────────────────────────────────

/**
 * Validate that no link in `links` points to a page in a different locale
 * than `currentLocale`.
 *
 * Used in CI to catch accidental cross-locale linking, e.g. an EN page
 * linking to /uk/regions/kharkiv instead of /regions/kharkiv.
 *
 * @param links         The set of internal links on the current page.
 * @param currentLocale Locale of the page emitting the links.
 */
export function validateNoLocaleLeakage(
  links: Array<{ url: string; anchor?: string }>,
  currentLocale: SupportedLocale,
): ValidationResult {
  const violations: ValidationResult["violations"] = [];

  for (const link of links) {
    const targetLocale = extractLocaleFromUrl(link.url);
    if (targetLocale !== currentLocale) {
      violations.push({
        sourceUrl: "(current page)",
        targetUrl: link.url,
        sourceLocale: currentLocale,
        targetLocale,
        message:
          `Cross-locale link detected: ${currentLocale} page links to ${targetLocale} URL "${link.url}". ` +
          `Link to the ${currentLocale} variant instead.`,
      });
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

// ── Locale URL builder ─────────────────────────────────────────────────────────

/**
 * Given a canonical EN path, derive the locale-specific URL.
 *
 * Enforces the locale-prefix convention:
 *  - EN (default): /regions/kharkiv  (no prefix)
 *  - UK:           /uk/regions/kharkiv
 *  - Others:       /{locale}/regions/kharkiv
 */
export function toLocaleUrl(
  canonicalPath: string,
  targetLocale: SupportedLocale,
): string {
  // Strip any existing locale prefix first
  let clean = canonicalPath;
  for (const loc of KNOWN_LOCALES) {
    if (loc === "en") continue;
    if (clean.startsWith(`/${loc}/`) || clean === `/${loc}`) {
      clean = clean.slice(loc.length + 1) || "/";
      break;
    }
  }
  if (!clean.startsWith("/")) clean = `/${clean}`;

  if (targetLocale === "en") return clean;
  return `/${targetLocale}${clean}`;
}

/**
 * Filter a `LocalePageMap` to only include pages for a given locale.
 * Utility for callers that build per-locale link lists in one pass.
 */
export function filterByLocale(
  pages: LocalePageMap,
  locale: SupportedLocale,
): LocalePage[] {
  const result: LocalePage[] = [];
  for (const [, page] of pages) {
    if (page.locale === locale) result.push(page);
  }
  return result;
}

/**
 * Build a `LocalePageMap` from a flat array of pages.
 * Useful in tests and data-fixture construction.
 */
export function buildLocalePageMap(pages: LocalePage[]): LocalePageMap {
  const map: LocalePageMap = new Map();
  for (const page of pages) {
    const key = `${page.locale}:${page.url}`;
    map.set(key, page);
  }
  return map;
}
