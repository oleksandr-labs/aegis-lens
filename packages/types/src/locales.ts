/**
 * Supported locales. Order matters: first = default.
 * Keep in sync with @aegis/i18n-config.
 */
export const LOCALES = ["en", "uk", "ru", "pl", "de", "ro", "fr", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  uk: "Українська",
  ru: "Русский",
  pl: "Polski",
  de: "Deutsch",
  ro: "Română",
  fr: "Français",
  es: "Español",
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
