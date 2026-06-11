/**
 * Per-locale sitemap configuration and XML sitemap index builder.
 *
 * Each locale gets its own sitemap file (e.g. /uk/sitemap.xml) to allow
 * separate submission per locale in Google Search Console.
 *
 * See TODO/seo/TODO_international_seo.md → "Per-locale sitemaps" and
 * "Search Console properties per locale".
 */

import { SITE } from "../site";
import type { SupportedLocale } from "./i18n-seo";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SitemapConfig {
  locale: SupportedLocale;
  /** URL prefix for this locale (empty = EN default) */
  urlPrefix: string;
  /** Path to the locale's sitemap within the site */
  sitemapPath: string;
  /** Default priority for pages in this locale's sitemap */
  priority: number;
  /** Default change frequency */
  changefreq: string;
}

export interface SearchConsoleProperty {
  locale: SupportedLocale;
  propertyType: "url-prefix" | "domain";
  propertyValue: string;
}

// ── Per-locale sitemap configs ────────────────────────────────────────────────

export const LOCALE_SITEMAP_CONFIGS: SitemapConfig[] = [
  {
    locale: "en",
    urlPrefix: "",
    sitemapPath: "/sitemap.xml",
    priority: 1.0,
    changefreq: "hourly",
  },
  {
    locale: "uk",
    urlPrefix: "/uk",
    sitemapPath: "/uk/sitemap.xml",
    priority: 0.9,
    changefreq: "daily",
  },
  {
    locale: "ru",
    urlPrefix: "/ru",
    sitemapPath: "/ru/sitemap.xml",
    priority: 0.6,
    changefreq: "weekly",
  },
  {
    locale: "pl",
    urlPrefix: "/pl",
    sitemapPath: "/pl/sitemap.xml",
    priority: 0.8,
    changefreq: "daily",
  },
  {
    locale: "de",
    urlPrefix: "/de",
    sitemapPath: "/de/sitemap.xml",
    priority: 0.8,
    changefreq: "daily",
  },
  {
    locale: "ro",
    urlPrefix: "/ro",
    sitemapPath: "/ro/sitemap.xml",
    priority: 0.7,
    changefreq: "weekly",
  },
  {
    locale: "fr",
    urlPrefix: "/fr",
    sitemapPath: "/fr/sitemap.xml",
    priority: 0.7,
    changefreq: "weekly",
  },
  {
    locale: "es",
    urlPrefix: "/es",
    sitemapPath: "/es/sitemap.xml",
    priority: 0.7,
    changefreq: "weekly",
  },
];

// ── Search Console property definitions ──────────────────────────────────────

/**
 * Google Search Console property definitions, one per locale.
 *
 * When the site ships a locale for the first time, add the corresponding
 * Search Console property and verify ownership.
 *
 * Use "url-prefix" type for subpath locales (e.g. https://aegislens.com/uk/)
 * until a subdomain/ccTLD strategy is adopted.
 */
export const SEARCH_CONSOLE_PROPERTIES: SearchConsoleProperty[] = [
  {
    locale: "en",
    propertyType: "url-prefix",
    propertyValue: SITE.url,
  },
  {
    locale: "uk",
    propertyType: "url-prefix",
    propertyValue: `${SITE.url}/uk`,
  },
  {
    locale: "ru",
    propertyType: "url-prefix",
    propertyValue: `${SITE.url}/ru`,
  },
  {
    locale: "pl",
    propertyType: "url-prefix",
    propertyValue: `${SITE.url}/pl`,
  },
  {
    locale: "de",
    propertyType: "url-prefix",
    propertyValue: `${SITE.url}/de`,
  },
  {
    locale: "ro",
    propertyType: "url-prefix",
    propertyValue: `${SITE.url}/ro`,
  },
  {
    locale: "fr",
    propertyType: "url-prefix",
    propertyValue: `${SITE.url}/fr`,
  },
  {
    locale: "es",
    propertyType: "url-prefix",
    propertyValue: `${SITE.url}/es`,
  },
];

// ── Sitemap index builder ─────────────────────────────────────────────────────

/**
 * Build an XML sitemap index that references all per-locale sitemaps.
 *
 * Output is served at /sitemap-index.xml (or consumed by the root sitemap
 * handler). Each locale's sitemap is a separate <sitemap> entry to allow
 * per-property submission in Search Console.
 */
export function buildLocaleSitemapIndex(
  options: { locales?: SupportedLocale[]; lastmod?: string } = {},
): string {
  const { locales, lastmod = new Date().toISOString().split("T")[0] } = options;

  const configs = locales
    ? LOCALE_SITEMAP_CONFIGS.filter((c) => locales.includes(c.locale))
    : LOCALE_SITEMAP_CONFIGS;

  const base = SITE.url.replace(/\/$/, "");

  const entries = configs
    .map(
      (cfg) =>
        `  <sitemap>\n    <loc>${base}${cfg.sitemapPath}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`,
    )
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries,
    "</sitemapindex>",
  ].join("\n");
}

// ── Utility ───────────────────────────────────────────────────────────────────

/** Get sitemap config for a specific locale. */
export function getSitemapConfigForLocale(locale: SupportedLocale): SitemapConfig | undefined {
  return LOCALE_SITEMAP_CONFIGS.find((c) => c.locale === locale);
}
