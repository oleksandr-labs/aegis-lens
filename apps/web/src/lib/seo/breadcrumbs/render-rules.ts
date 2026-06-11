/**
 * Breadcrumb render rules — the small, testable policy layer between a resolved
 * {@link Crumb} chain and what the UI / JSON-LD actually emit.
 *
 * The two rules SEO + UX care about most:
 *   1. The **last crumb is the current page and MUST be unlinked** (rendered as
 *      plain text / `aria-current="page"`, no `<a>`/`item` URL). Google's
 *      BreadcrumbList guidance and WAI-ARIA both expect this; a self-link on the
 *      current page is a UX smell and a (minor) crawl-budget waste.
 *   2. JSON-LD `position` is 1-based and contiguous over the *visible* crumbs.
 *
 * Pure — produces plain data the page renders. No React here so it stays
 * unit-testable. The existing inline page markup
 * (`<nav aria-label="Breadcrumb">` + `BreadcrumbList` JSON-LD, Sprint 0) maps
 * 1:1 onto these helpers; pages can adopt them without changing output shape.
 */

import { absoluteUrl } from "@aegis/url-builder";
import type { Locale } from "@aegis/i18n-config";
import { type Crumb, labelFor } from "./hierarchy";

/**
 * Normalize a chain so it obeys rule #1: force the last crumb to be hrefless
 * (current page) even if a builder accidentally gave it a URL, and strip any
 * stray href from a duplicate-of-last. Returns a new array; input untouched.
 */
export function applyCurrentPageRule(crumbs: Crumb[]): Crumb[] {
  if (crumbs.length === 0) return crumbs;
  return crumbs.map((c, i) =>
    i === crumbs.length - 1 ? { ...c, href: undefined } : c,
  );
}

/** True for the crumb that is the current page (last, hrefless). */
export function isCurrentPage(crumbs: Crumb[], index: number): boolean {
  return index === crumbs.length - 1;
}

/** A view-model row the UI iterates over. */
export interface CrumbView {
  text: string;
  /** Locale-aware href, or null when this is the current page (unlinked). */
  href: string | null;
  isCurrent: boolean;
  key: string;
}

/**
 * Project a resolved chain into render-ready rows for the active locale,
 * with the current-page rule applied. The UI maps `href === null` to a
 * `<span aria-current="page">` and everything else to a `<Link>`.
 */
export function toCrumbViews(crumbs: Crumb[], locale: Locale): CrumbView[] {
  const normalized = applyCurrentPageRule(crumbs);
  return normalized.map((c, i) => ({
    text: labelFor(c.label, locale),
    href: c.href ?? null,
    isCurrent: i === normalized.length - 1,
    key: c.key,
  }));
}

/** One `ListItem` in a schema.org `BreadcrumbList`. */
export interface BreadcrumbListItem {
  "@type": "ListItem";
  position: number;
  name: string;
  /** Absolute URL. Omitted for the current page per Google guidance. */
  item?: string;
}

export interface BreadcrumbListJsonLd {
  "@type": "BreadcrumbList";
  itemListElement: BreadcrumbListItem[];
}

/**
 * Build the `BreadcrumbList` JSON-LD from a resolved chain. Positions are
 * 1-based and contiguous; the last item omits `item` (current page). `href`
 * paths are made absolute against `siteUrl`. Locale-aware: paths already carry
 * their locale prefix, so the emitted absolute URLs never leak across locales.
 *
 * This mirrors the inline shape pages already emit (Sprint 0) so it can be
 * dropped into the existing `@graph` without changing crawler-visible output.
 */
export function breadcrumbListJsonLd(
  crumbs: Crumb[],
  locale: Locale,
  siteUrl: string,
): BreadcrumbListJsonLd {
  const normalized = applyCurrentPageRule(crumbs);
  return {
    "@type": "BreadcrumbList",
    itemListElement: normalized.map((c, i) => {
      const item: BreadcrumbListItem = {
        "@type": "ListItem",
        position: i + 1,
        name: labelFor(c.label, locale),
      };
      if (c.href) item.item = absoluteUrl(siteUrl, c.href);
      return item;
    }),
  };
}
