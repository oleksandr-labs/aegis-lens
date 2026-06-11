/**
 * Embed Locale — locale resolution for embed iframes.
 *
 * Resolves the best locale from a query param or Accept-Language header,
 * with a defined fallback chain per language.
 *
 * Визначає локаль за query-параметром або заголовком Accept-Language.
 */

// ── Supported locales ─────────────────────────────────────────────────────────

/**
 * Locales supported by the embed rendering layer.
 *
 * Локалі, підтримувані embed-системою.
 */
export const EMBED_SUPPORTED_LOCALES: ReadonlyArray<string> = [
  'en',
  'uk',
  'ru',
  'pl',
  'de',
  'ar',
];

/** Default locale when nothing can be resolved. Локаль за замовчуванням. */
const EMBED_DEFAULT_LOCALE = 'en';

// ── Fallback chain ────────────────────────────────────────────────────────────

/**
 * Ordered fallback chain per locale.
 * When the preferred locale is unavailable, try each item in order.
 *
 * Ланцюжок резервних локалей.
 */
export const LOCALE_FALLBACK_CHAIN: Record<string, string> = {
  // Slavic cluster: uk → ru → pl → en
  // Слов'янський кластер: uk → ru → pl → en
  uk: 'ru',
  ru: 'uk',
  pl: 'en',
  // Germanic
  de: 'en',
  // RTL
  ar: 'en',
  // Base
  en: 'en',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Parse an Accept-Language header and return BCP-47 primary subtags in priority order.
 * Example: "uk-UA,uk;q=0.9,en;q=0.8" → ['uk', 'en']
 *
 * Парсить Accept-Language і повертає коди мов за пріоритетом.
 */
function parseAcceptLanguage(header: string): string[] {
  return header
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=');
      return { tag: tag.split('-')[0].toLowerCase(), quality: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.quality - a.quality)
    .map((item) => item.tag)
    .filter(Boolean);
}

/**
 * Determine whether a locale string is in the supported list.
 *
 * Перевіряє, чи локаль підтримується.
 */
function isSupported(locale: string): boolean {
  return (EMBED_SUPPORTED_LOCALES as string[]).includes(locale);
}

// ── Main resolver ─────────────────────────────────────────────────────────────

/**
 * Resolve the best embed locale from a query param and/or Accept-Language header.
 *
 * Priority order:
 *   1. `queryParam` (e.g. `?locale=uk`) — if supported
 *   2. First supported language from `acceptLanguage` header
 *   3. Follow LOCALE_FALLBACK_CHAIN for the best candidate
 *   4. EMBED_DEFAULT_LOCALE ('en')
 *
 * Визначає найкращу локаль: query → Accept-Language → fallback → 'en'.
 */
export function resolveEmbedLocale(
  queryParam?: string | null,
  acceptLanguage?: string | null,
): string {
  // 1. Explicit query param. Явний query-параметр.
  if (queryParam) {
    const normalised = queryParam.toLowerCase().split('-')[0];
    if (isSupported(normalised)) return normalised;
  }

  // 2. Accept-Language header. Заголовок Accept-Language.
  if (acceptLanguage) {
    const candidates = parseAcceptLanguage(acceptLanguage);
    for (const candidate of candidates) {
      if (isSupported(candidate)) return candidate;
    }
  }

  // 3 + 4. Default. За замовчуванням.
  return EMBED_DEFAULT_LOCALE;
}

// ── RTL detector ──────────────────────────────────────────────────────────────

/** Locales that require right-to-left text direction. RTL-локалі. */
const RTL_LOCALES: ReadonlySet<string> = new Set(['ar']);

/**
 * Return 'rtl' or 'ltr' for the given locale.
 *
 * Повертає напрямок тексту для локалі.
 */
export function getTextDirection(locale: string): 'rtl' | 'ltr' {
  return RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
}
