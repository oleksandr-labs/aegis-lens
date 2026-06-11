/**
 * Hreflang Mappings — builds hreflang <link> tag data for multilingual content.
 * Each locale maps to its BCP-47 hreflang value; x-default points to English.
 *
 * Hreflang Mappings — будує дані hreflang <link> тегів для багатомовного контенту.
 * Кожна мова відображається у BCP-47 значення; x-default вказує на англійський варіант.
 */

// ── Locale → hreflang map ─────────────────────────────────────────────────────

/**
 * Mapping from internal locale code to BCP-47 hreflang attribute value.
 *
 * Відображення внутрішнього коду мови у BCP-47 значення hreflang.
 */
export const HREFLANG_LOCALE_MAP: Record<string, string> = {
  en: "en-gb",
  uk: "uk",
  pl: "pl",
  de: "de",
  ru: "ru",
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface HreflangEntry {
  /** BCP-47 hreflang value (e.g. "en-gb", "uk", "x-default"). */
  hreflang: string;
  /** Absolute URL for this locale variant. / Абсолютний URL для цього варіанту мови. */
  href: string;
}

// ── Content shape expected by buildHreflangTags ───────────────────────────────

export interface HreflangContent {
  /** Base URL of the site (no trailing slash). / Базовий URL сайту без кінцевого слешу. */
  siteUrl: string;
  /** URL path for this content (e.g. "/reports/ukraine-2025"). */
  path: string;
  /**
   * Map of locale → translated path (if different from the default path).
   * If absent for a locale, falls back to the default path with locale prefix.
   *
   * Карта мова → перекладений шлях (якщо відрізняється від стандартного).
   */
  localePaths?: Partial<Record<string, string>>;
  /** Locales available for this content. / Доступні мови для цього контенту. */
  availableLocales: string[];
}

// ── Builder ───────────────────────────────────────────────────────────────────

/**
 * Build the full list of hreflang entries for a piece of content.
 * Includes one entry per available locale plus x-default (→ en).
 *
 * Будує повний список hreflang записів для контентного документа.
 * Включає запис для кожної доступної мови та x-default (→ en).
 */
export function buildHreflangTags(content: HreflangContent): HreflangEntry[] {
  const entries: HreflangEntry[] = [];

  for (const locale of content.availableLocales) {
    const hreflang = HREFLANG_LOCALE_MAP[locale] ?? locale;
    const localePath = content.localePaths?.[locale];
    let href: string;

    if (localePath) {
      // Explicit translated path provided
      href = `${content.siteUrl}${localePath}`;
    } else if (locale === "en") {
      // English is the canonical root (no prefix)
      href = `${content.siteUrl}${content.path}`;
    } else {
      // Other locales get a /<locale> prefix
      href = `${content.siteUrl}/${locale}${content.path}`;
    }

    entries.push({ hreflang, href });
  }

  // x-default always points to the English version
  // x-default завжди вказує на англійський варіант
  const enPath = content.localePaths?.["en"] ?? content.path;
  entries.push({
    hreflang: "x-default",
    href: `${content.siteUrl}${enPath}`,
  });

  return entries;
}
