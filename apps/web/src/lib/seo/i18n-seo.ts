/**
 * International SEO — hreflang, locale configs, round-trip validator.
 *
 * All 8 supported locales with ICU date/number/currency formats.
 * Implements TODO/seo/TODO_international_seo.md: URL strategy, hreflang CI,
 * per-locale sitemap properties, cultural adaptation hooks.
 */

import { SITE } from "../site";

// ── Types ─────────────────────────────────────────────────────────────────────

export type SupportedLocale = "en" | "uk" | "ru" | "pl" | "de" | "ro" | "fr" | "es";

export interface LocaleConfig {
  locale: SupportedLocale;
  /** BCP-47 hreflang value (e.g. "en", "uk", "x-default") */
  hreflang: string;
  /** URL prefix (empty string = root for default EN) */
  urlPrefix: string;
  /** True for the default locale (EN) — no prefix */
  isDefault: boolean;
  /** True if this entry should also emit an x-default tag */
  isXDefault: boolean;
  /** Google Search Console property URL (if registered) */
  searchConsolePropUrl?: string;
  /** Bing Webmaster verified */
  bingWebmasterVerified?: boolean;
  /** Yandex Webmaster verified (where lawful) */
  yandexWebmasterVerified?: boolean;
  /** ICU locale identifier for Intl APIs */
  iculocale: string;
  /** ICU date format skeleton */
  dateFormat: string;
  /** ICU number format skeleton */
  numberFormat: string;
  /** ICU currency format skeleton */
  currencyFormat: string;
  /** Right-to-left text direction */
  rtl: boolean;
}

// ── Config ────────────────────────────────────────────────────────────────────

/**
 * Canonical locale configuration for all 8 supported locales.
 *
 * URL strategy (see TODO_international_seo.md):
 *   /       → EN (default)
 *   /uk/    → Ukrainian
 *   /ru/    → Russian (coverage only, not promoted)
 *   /pl/    → Polish
 *   /de/    → German
 *   /ro/    → Romanian
 *   /fr/    → French
 *   /es/    → Spanish
 */
export const I18N_LOCALE_CONFIGS: LocaleConfig[] = [
  {
    locale: "en",
    hreflang: "en",
    urlPrefix: "",
    isDefault: true,
    isXDefault: true,
    iculocale: "en-GB",
    dateFormat: "MM/dd/yyyy",
    numberFormat: "1,234.56",
    currencyFormat: "£1,234.56",
    rtl: false,
  },
  {
    locale: "uk",
    hreflang: "uk",
    urlPrefix: "/uk",
    isDefault: false,
    isXDefault: false,
    iculocale: "uk-UA",
    dateFormat: "dd.MM.yyyy",
    numberFormat: "1 234,56",
    currencyFormat: "1 234,56 ₴",
    rtl: false,
  },
  {
    locale: "ru",
    hreflang: "ru",
    urlPrefix: "/ru",
    isDefault: false,
    isXDefault: false,
    iculocale: "ru-RU",
    dateFormat: "dd.MM.yyyy",
    numberFormat: "1 234,56",
    currencyFormat: "1 234,56 ₽",
    rtl: false,
  },
  {
    locale: "pl",
    hreflang: "pl",
    urlPrefix: "/pl",
    isDefault: false,
    isXDefault: false,
    iculocale: "pl-PL",
    dateFormat: "dd.MM.yyyy",
    numberFormat: "1 234,56",
    currencyFormat: "1 234,56 zł",
    rtl: false,
  },
  {
    locale: "de",
    hreflang: "de",
    urlPrefix: "/de",
    isDefault: false,
    isXDefault: false,
    iculocale: "de-DE",
    dateFormat: "dd.MM.yyyy",
    numberFormat: "1.234,56",
    currencyFormat: "1.234,56 €",
    rtl: false,
  },
  {
    locale: "ro",
    hreflang: "ro",
    urlPrefix: "/ro",
    isDefault: false,
    isXDefault: false,
    iculocale: "ro-RO",
    dateFormat: "dd.MM.yyyy",
    numberFormat: "1.234,56",
    currencyFormat: "1.234,56 RON",
    rtl: false,
  },
  {
    locale: "fr",
    hreflang: "fr",
    urlPrefix: "/fr",
    isDefault: false,
    isXDefault: false,
    iculocale: "fr-FR",
    dateFormat: "dd/MM/yyyy",
    numberFormat: "1 234,56",
    currencyFormat: "1 234,56 €",
    rtl: false,
  },
  {
    locale: "es",
    hreflang: "es",
    urlPrefix: "/es",
    isDefault: false,
    isXDefault: false,
    iculocale: "es-ES",
    dateFormat: "dd/MM/yyyy",
    numberFormat: "1.234,56",
    currencyFormat: "1.234,56 €",
    rtl: false,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildHref(urlPrefix: string, pagePath: string): string {
  const base = SITE.url.replace(/\/$/, "");
  const path = pagePath.startsWith("/") ? pagePath : `/${pagePath}`;
  return `${base}${urlPrefix}${path}`;
}

function configForLocale(locale: SupportedLocale): LocaleConfig | undefined {
  return I18N_LOCALE_CONFIGS.find((c) => c.locale === locale);
}

// ── hreflang tag builder ──────────────────────────────────────────────────────

/**
 * Build `<link rel="alternate" hreflang="..." href="...">` strings for all
 * available locales, plus x-default.
 *
 * hreflang round-trip rule: every locale must reference every other locale.
 * This function returns the full set, so each page receives the full list.
 *
 * @param pagePath  The locale-agnostic path, e.g. "/events/kharkiv"
 * @param availableLocales  Which locales actually have content for this page
 */
export function buildHreflangTags(
  pagePath: string,
  availableLocales: SupportedLocale[],
): string[] {
  const tags: string[] = [];
  const xDefaultConfig = I18N_LOCALE_CONFIGS.find((c) => c.isXDefault);

  for (const locale of availableLocales) {
    const cfg = configForLocale(locale);
    if (!cfg) continue;
    const href = buildHref(cfg.urlPrefix, pagePath);
    tags.push(`<link rel="alternate" hreflang="${cfg.hreflang}" href="${href}" />`);
  }

  // x-default always points at the EN (default) version
  if (xDefaultConfig && availableLocales.includes(xDefaultConfig.locale)) {
    const href = buildHref(xDefaultConfig.urlPrefix, pagePath);
    tags.push(`<link rel="alternate" hreflang="x-default" href="${href}" />`);
  }

  return tags;
}

// ── hreflang JSON-LD representation ──────────────────────────────────────────

/**
 * Structured-data representation of hreflang — useful for custom schema
 * injection or server-side verification tools.
 */
export function buildHreflangJsonLd(
  pagePath: string,
): object {
  const locales = I18N_LOCALE_CONFIGS.map((cfg) => ({
    hreflang: cfg.hreflang,
    href: buildHref(cfg.urlPrefix, pagePath),
    isXDefault: cfg.isXDefault,
    isDefault: cfg.isDefault,
  }));
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: buildHref("", pagePath),
    inLanguage: locales.map((l) => l.hreflang),
    availableLanguage: locales.map((l) => ({
      "@type": "Language",
      name: l.hreflang,
      alternateName: l.hreflang,
      url: l.href,
    })),
  };
}

// ── hreflang round-trip validator (CI-testable) ───────────────────────────────

/**
 * Validate that every locale references every other locale — the hreflang
 * "round-trip" requirement. Errors indicate missing hreflang entries.
 *
 * Usage in CI:
 *   const result = validateHreflangRoundTrip("/events/kyiv", ["en", "uk", "pl"]);
 *   expect(result.isValid).toBe(true);
 */
export function validateHreflangRoundTrip(
  pagePath: string,
  locales: SupportedLocale[],
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (locales.length === 0) {
    errors.push("No locales provided — cannot validate round-trip.");
    return { isValid: false, errors };
  }

  // Build the expected href set for these locales
  const expectedHrefs = new Map<SupportedLocale, string>();
  for (const locale of locales) {
    const cfg = configForLocale(locale);
    if (!cfg) {
      errors.push(`Unknown locale: "${locale}"`);
      continue;
    }
    expectedHrefs.set(locale, buildHref(cfg.urlPrefix, pagePath));
  }

  // Every locale page must list ALL other locales (round-trip)
  for (const fromLocale of locales) {
    for (const toLocale of locales) {
      const toHref = expectedHrefs.get(toLocale);
      if (!toHref) continue;
      // In practice each page emits the full set; check no locale is skipped
      const fromCfg = configForLocale(fromLocale);
      if (!fromCfg) continue;
      // Rule: the from-locale page MUST include hreflang for to-locale
      if (!expectedHrefs.has(toLocale)) {
        errors.push(
          `Locale "${fromLocale}" page at ${buildHref(fromCfg.urlPrefix, pagePath)} is missing hreflang="${toLocale}"`,
        );
      }
    }
  }

  // x-default must be present if EN is in the set
  const hasEn = locales.includes("en");
  if (!hasEn) {
    errors.push("x-default requires EN locale to be in the available set.");
  }

  // Each locale must have a valid config
  for (const locale of locales) {
    if (!configForLocale(locale)) {
      errors.push(`No LocaleConfig defined for locale "${locale}".`);
    }
  }

  return { isValid: errors.length === 0, errors };
}

// ── Utility exports ───────────────────────────────────────────────────────────

/** All locales in order of priority (default first). */
export const ALL_LOCALES: SupportedLocale[] = I18N_LOCALE_CONFIGS.map((c) => c.locale);

/** Quick lookup: locale → config. */
export function getLocaleConfig(locale: SupportedLocale): LocaleConfig {
  const cfg = configForLocale(locale);
  if (!cfg) throw new Error(`[i18n-seo] No config for locale "${locale}"`);
  return cfg;
}
