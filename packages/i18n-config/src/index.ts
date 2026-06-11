import { LOCALES, DEFAULT_LOCALE, type Locale, isLocale, LOCALE_LABELS } from "@aegis/types";

export { LOCALES, DEFAULT_LOCALE, isLocale, LOCALE_LABELS };
export type { Locale };

/**
 * Active locales — what we actually ship copy for.
 * Other LOCALES exist in the type union for forward-compat but are not yet authored.
 */
export const ACTIVE_LOCALES: Locale[] = ["en", "uk"];

/**
 * Fallback chain. If a key is missing in locale X, try this chain in order.
 */
export const FALLBACK_CHAIN: Record<Locale, Locale[]> = {
  en: [],
  uk: ["en"],
  ru: ["uk", "en"],
  pl: ["en"],
  de: ["en"],
  ro: ["en"],
  fr: ["en"],
  es: ["en"],
};

/**
 * Negotiate locale from Accept-Language header value.
 * Returns DEFAULT_LOCALE if no match.
 */
export function negotiateLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const candidates = acceptLanguage
    .split(",")
    .map((part) => part.split(";")[0]?.trim().toLowerCase().split("-")[0])
    .filter(Boolean) as string[];
  for (const c of candidates) {
    if (isLocale(c) && ACTIVE_LOCALES.includes(c)) return c;
  }
  return DEFAULT_LOCALE;
}
