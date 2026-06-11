/**
 * Per-template breadcrumb patterns (documented).
 *
 * Every programmatic page template has a canonical ancestor chain. Before this
 * module each page hand-rolled its own `<nav>` + `BreadcrumbList` inline
 * (Sprint 0), which drifts: labels differ, some skip Home, some link the
 * current page. Here we declare the chain ONCE per template so the visible
 * breadcrumb, the JSON-LD, and any audit all agree.
 *
 * A pattern is `(locale, params) => Crumb[]` returning the FULL chain
 * (Home … current). It composes the locale-aware `urls.*` builders so prefixes
 * never leak across locales, and provides en+uk labels for every fixed crumb.
 * The dynamic leaf label (entity name, article title) is passed in by the page
 * via `params.title`.
 *
 * Documented contract (per template) — see {@link BREADCRUMB_PATTERN_DOCS}:
 *   Home > <section index> [> <sub-section>]* > <current page>
 *
 * Pure (no React, no network) — unit-testable and audit-friendly. Templates not
 * listed here fall back to {@link hierarchy.resolveFromPath}.
 */

import { urls } from "@aegis/url-builder";
import type { Locale } from "@aegis/i18n-config";
import {
  type Crumb,
  type CrumbLabel,
  homeCrumb,
  sectionCrumb,
  currentCrumb,
} from "./hierarchy";

/** Template ids that have a bespoke breadcrumb pattern. */
export type BreadcrumbTemplateId =
  | "industry"
  | "industry-city"
  | "region"
  | "oblast"
  | "city"
  | "entity"
  | "event"
  | "glossary-term"
  | "guide"
  | "blog-post"
  | "news-archive-day"
  | "tool"
  | "compare-pair";

/** Params a pattern may consume. `title` is the dynamic leaf label (bilingual). */
export interface PatternParams {
  title: CrumbLabel;
  /** Slug/id segments the route carries (template-specific). */
  slug?: string;
  iso2?: string;
  oblastSlug?: string;
  citySlug?: string;
  id?: string;
  /** Intermediate labels the page already has (e.g. parent oblast name). */
  parentTitle?: CrumbLabel;
  year?: number;
  month?: number;
  day?: number;
  pairSlugA?: string;
  pairSlugB?: string;
}

const L = (en: string, uk: string): CrumbLabel => ({ en, uk });

/**
 * The pattern table. Each entry returns the full Home…current chain. Fixed
 * section crumbs carry en+uk labels; the leaf uses `params.title`.
 */
export const BREADCRUMB_PATTERNS: Record<
  BreadcrumbTemplateId,
  (locale: Locale, p: PatternParams) => Crumb[]
> = {
  industry: (locale, p) => [
    homeCrumb(locale),
    sectionCrumb(locale, "industries", L("Industries", "Галузі"), urls.industries),
    currentCrumb("current", p.title),
  ],

  "industry-city": (locale, p) => [
    homeCrumb(locale),
    sectionCrumb(locale, "industries", L("Industries", "Галузі"), urls.industries),
    sectionCrumb(locale, `industry:${p.slug}`, p.parentTitle ?? p.title, (lc) =>
      urls.industry(lc, p.slug ?? ""),
    ),
    currentCrumb("current", p.title),
  ],

  region: (locale, p) => [
    homeCrumb(locale),
    sectionCrumb(locale, "regions", L("Regions", "Регіони"), (lc) => urls.countries(lc)),
    currentCrumb("current", p.title),
  ],

  oblast: (locale, p) => [
    homeCrumb(locale),
    sectionCrumb(locale, "regions", L("Regions", "Регіони"), (lc) => urls.countries(lc)),
    sectionCrumb(locale, `country:${p.iso2}`, p.parentTitle ?? L("Country", "Країна"), (lc) =>
      urls.region(lc, p.iso2 ?? ""),
    ),
    currentCrumb("current", p.title),
  ],

  city: (locale, p) => [
    homeCrumb(locale),
    sectionCrumb(locale, "regions", L("Regions", "Регіони"), (lc) => urls.countries(lc)),
    sectionCrumb(locale, `oblast:${p.oblastSlug}`, p.parentTitle ?? L("Region", "Область"), (lc) =>
      urls.region(lc, p.iso2 ?? "", p.oblastSlug),
    ),
    currentCrumb("current", p.title),
  ],

  entity: (locale, p) => [
    homeCrumb(locale),
    sectionCrumb(locale, "entities", L("Entities", "Об'єкти"), urls.entities),
    currentCrumb("current", p.title),
  ],

  event: (locale, p) => [
    homeCrumb(locale),
    sectionCrumb(locale, "incidents", L("Incidents", "Інциденти"), urls.incidents),
    currentCrumb("current", p.title),
  ],

  "glossary-term": (locale, p) => [
    homeCrumb(locale),
    sectionCrumb(locale, "glossary", L("Glossary", "Глосарій"), (lc) => urls.glossary(lc)),
    currentCrumb("current", p.title),
  ],

  guide: (locale, p) => [
    homeCrumb(locale),
    sectionCrumb(locale, "guides", L("Guides", "Посібники"), urls.guides),
    currentCrumb("current", p.title),
  ],

  "blog-post": (locale, p) => [
    homeCrumb(locale),
    sectionCrumb(locale, "blog", L("Blog", "Блог"), urls.blog),
    currentCrumb("current", p.title),
  ],

  "news-archive-day": (locale, p) => [
    homeCrumb(locale),
    sectionCrumb(locale, "news", L("News", "Новини"), (lc) => urls.news(lc)),
    sectionCrumb(locale, "news-archive", L("Archive", "Архів"), urls.newsArchive),
    sectionCrumb(locale, `year:${p.year}`, L(String(p.year ?? ""), String(p.year ?? "")), (lc) =>
      urls.newsArchiveYear(lc, p.year ?? 0),
    ),
    sectionCrumb(
      locale,
      `month:${p.month}`,
      L(monthName(p.month, "en"), monthName(p.month, "uk")),
      (lc) => urls.newsArchiveMonth(lc, p.year ?? 0, p.month ?? 1),
    ),
    currentCrumb("current", p.title),
  ],

  tool: (locale, p) => [
    homeCrumb(locale),
    sectionCrumb(locale, "tools", L("Tools", "Інструменти"), (lc) => urls.tools(lc)),
    currentCrumb("current", p.title),
  ],

  "compare-pair": (locale, p) => [
    homeCrumb(locale),
    sectionCrumb(locale, "compare", L("Compare", "Порівняння"), (lc) => urls.compare(lc)),
    currentCrumb("current", p.title),
  ],
};

/** Resolve a template's full chain, or `undefined` if no bespoke pattern. */
export function resolvePattern(
  template: BreadcrumbTemplateId,
  locale: Locale,
  params: PatternParams,
): Crumb[] | undefined {
  const fn = BREADCRUMB_PATTERNS[template];
  return fn ? fn(locale, params) : undefined;
}

const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_UK = [
  "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
  "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень",
];

function monthName(month: number | undefined, locale: "en" | "uk"): string {
  if (!month || month < 1 || month > 12) return "";
  return (locale === "uk" ? MONTHS_UK : MONTHS_EN)[month - 1];
}

/**
 * Human-readable documentation of every template's breadcrumb pattern. Used by
 * the schema/breadcrumb audit and as living docs. Format:
 *   "Home > Section > … > Current page"
 */
export const BREADCRUMB_PATTERN_DOCS: Record<BreadcrumbTemplateId, string> = {
  industry: "Home > Industries > {industry}",
  "industry-city": "Home > Industries > {industry} > {city}",
  region: "Home > Regions > {country}",
  oblast: "Home > Regions > {country} > {oblast}",
  city: "Home > Regions > {country} > {oblast} > {city}",
  entity: "Home > Entities > {entity}",
  event: "Home > Incidents > {event}",
  "glossary-term": "Home > Glossary > {term}",
  guide: "Home > Guides > {guide}",
  "blog-post": "Home > Blog > {post}",
  "news-archive-day": "Home > News > Archive > {year} > {month} > {day}",
  tool: "Home > Tools > {tool}",
  "compare-pair": "Home > Compare > {toolA} vs {toolB}",
};
