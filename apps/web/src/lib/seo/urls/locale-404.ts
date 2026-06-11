/**
 * Per-locale 404 page configuration.
 *
 * Each supported locale gets its own 404 page with localized copy.
 * Covers the "Per-locale 404 page" requirement from
 * TODO/urls_slugs/TODO_404_410_strategy.md.
 *
 * Usage:
 *   import { LOCALE_404_CONFIGS, build404PageMeta } from "@/lib/seo/urls/locale-404";
 *
 *   const meta = build404PageMeta("uk");
 *   // → { title: "Сторінку не знайдено", noindex: true }
 */

// ── Config type ───────────────────────────────────────────────────────────────

export interface Locale404Config {
  /** BCP-47 locale code. */
  locale: string;
  /** Page title in English (for reference / fallback). */
  notFoundTitle_en: string;
  /** Page title in the target locale. */
  notFoundTitle_locale: string;
  /** Search input placeholder in the target locale. */
  searchPlaceholder_locale: string;
  /** Number of top links to show on the 404 page. */
  topLinksCount: 5;
}

// ── Supported locales ─────────────────────────────────────────────────────────

export const LOCALE_404_CONFIGS: Locale404Config[] = [
  {
    locale: "en",
    notFoundTitle_en: "Page not found",
    notFoundTitle_locale: "Page not found",
    searchPlaceholder_locale: "Search Aegis Lens…",
    topLinksCount: 5,
  },
  {
    locale: "uk",
    notFoundTitle_en: "Page not found",
    notFoundTitle_locale: "Сторінку не знайдено",
    searchPlaceholder_locale: "Пошук в Aegis Lens…",
    topLinksCount: 5,
  },
  {
    locale: "pl",
    notFoundTitle_en: "Page not found",
    notFoundTitle_locale: "Strona nie została znaleziona",
    searchPlaceholder_locale: "Szukaj w Aegis Lens…",
    topLinksCount: 5,
  },
  {
    locale: "de",
    notFoundTitle_en: "Page not found",
    notFoundTitle_locale: "Seite nicht gefunden",
    searchPlaceholder_locale: "Aegis Lens durchsuchen…",
    topLinksCount: 5,
  },
  {
    locale: "ro",
    notFoundTitle_en: "Page not found",
    notFoundTitle_locale: "Pagina nu a fost găsită",
    searchPlaceholder_locale: "Caută în Aegis Lens…",
    topLinksCount: 5,
  },
  {
    locale: "fr",
    notFoundTitle_en: "Page not found",
    notFoundTitle_locale: "Page introuvable",
    searchPlaceholder_locale: "Rechercher dans Aegis Lens…",
    topLinksCount: 5,
  },
];

// ── Helper ────────────────────────────────────────────────────────────────────

/**
 * Build the minimal page meta required for a 404 page in a given locale.
 *
 * Always marks the page noindex — 404 pages must never be indexed.
 *
 * Falls back to EN if the locale is not found in LOCALE_404_CONFIGS.
 *
 * @param locale - BCP-47 locale code, e.g. "uk", "pl".
 * @returns Page meta with title and noindex flag.
 */
export function build404PageMeta(locale: string): { title: string; noindex: true } {
  const config =
    LOCALE_404_CONFIGS.find((c) => c.locale === locale) ??
    LOCALE_404_CONFIGS.find((c) => c.locale === "en")!;

  return {
    title: config.notFoundTitle_locale,
    noindex: true,
  };
}
