/**
 * Locale Content — per-locale document storage with fallback chain resolution.
 * Supports 5 locales; missing translations fall back according to LOCALE_FALLBACK_CHAIN.
 *
 * Локалізований контент — зберігання документів за мовою з ланцюжком відступів.
 * Підтримує 5 мов; відсутні переклади відступають за LOCALE_FALLBACK_CHAIN.
 */

import { CmsContentType } from "./content-types";

// ── Locales ───────────────────────────────────────────────────────────────────

export const SUPPORTED_LOCALES = ["en", "uk", "ru", "pl", "de"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Fallback chain: if a document is missing for a locale, try the mapped locale next.
 * Terminal locales (en) have no entry — they are the final fallback.
 *
 * Ланцюжок відступів: якщо документ відсутній для мови — пробуємо наступну.
 * Термінальні мови (en) не мають запису — вони є фінальним відступом.
 */
export const LOCALE_FALLBACK_CHAIN: Record<SupportedLocale, SupportedLocale | undefined> = {
  uk: "en",
  pl: "en",
  de: "en",
  ru: "uk",
  en: undefined,
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LocalizedContent {
  locale: SupportedLocale;
  /** Whether this was fetched from a fallback locale (not the requested one). */
  isFallback: boolean;
  /** The locale that was actually used to retrieve the content. */
  resolvedLocale: SupportedLocale;
  /** Raw content document (type depends on content type). */
  content: unknown;
}

// ── Resolver (stub) ───────────────────────────────────────────────────────────

/**
 * Retrieve a content document for the given type, slug, and locale, walking
 * the fallback chain until a document is found.
 *
 * Отримує документ контенту для заданого типу, slug та мови,
 * проходячи ланцюжок відступів до першого знайденого документа.
 */
export async function getLocalizedContent(
  type: CmsContentType,
  slug: string,
  locale: SupportedLocale,
): Promise<LocalizedContent | null> {
  // Walk the fallback chain
  // Проходимо ланцюжок відступів
  let current: SupportedLocale | undefined = locale;
  let attempts = 0;
  const MAX_CHAIN = SUPPORTED_LOCALES.length + 1;

  while (current !== undefined && attempts < MAX_CHAIN) {
    // Stub lookup — replace with real Keystatic reader
    // Заглушка пошуку — замінити на реальний Keystatic reader
    const found = await _stubFetchContent(type, slug, current);

    if (found !== null) {
      return {
        locale,
        isFallback: current !== locale,
        resolvedLocale: current,
        content: found,
      };
    }

    current = LOCALE_FALLBACK_CHAIN[current];
    attempts++;
  }

  return null;
}

/**
 * Stub content fetcher — returns null (not found) for every request.
 * Replace with Keystatic reader in production.
 *
 * Заглушка пошуку контенту — завжди повертає null.
 * Замінити на Keystatic reader у продакшні.
 */
async function _stubFetchContent(
  _type: CmsContentType,
  _slug: string,
  _locale: SupportedLocale,
): Promise<unknown | null> {
  return null;
}
