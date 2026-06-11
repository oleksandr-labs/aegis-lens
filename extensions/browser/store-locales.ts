/**
 * Browser Extension — Per-locale Chrome Web Store metadata.
 *
 * Chrome Web Store supports submitting locale-specific listing metadata via
 * the Publish API or the Developer Dashboard UI. Each locale entry provides
 * a short description and keyword list. The full description is shared from
 * store-listing.ts unless a locale-specific override is provided here.
 *
 * CWS locale format follows BCP 47 (e.g. "en", "uk", "pl", "de").
 * Locales must be submitted separately in the Developer Dashboard under
 * "Store listing" → "Localised description".
 *
 * Chrome Web Store підтримує локалізовані описи через Publish API або UI.
 * Локалі подаються окремо в розділі "Localised description".
 */

// ── StoreLocale ───────────────────────────────────────────────────────────────

/**
 * Per-locale listing metadata for the Chrome Web Store.
 *
 * Метадані лістингу для однієї локалі Chrome Web Store.
 */
export interface StoreLocale {
  /** BCP 47 locale code */
  locale: string;
  /** Display name of the locale in English */
  localeName: string;
  /** Extension title in this locale (max 45 chars) */
  title: string;
  /** Short description (max 132 chars) */
  shortDescription: string;
  /**
   * Locale-specific keywords.
   * CWS uses these for internal search ranking in that locale's store.
   *
   * Ключові слова для внутрішнього пошукового ранжування в CWS.
   */
  keywords: string[];
  /**
   * Whether a full locale-specific description override exists.
   * If false, falls back to the English description from store-listing.ts.
   *
   * Чи існує повний локалізований опис; якщо ні — використовується EN-варіант.
   */
  hasFullDescription: boolean;
}

// ── STORE_LOCALES ─────────────────────────────────────────────────────────────

/**
 * All supported Chrome Web Store locales for the Aegis Lens extension.
 *
 * Chrome Web Store locale note: submit each locale via Developer Dashboard
 * → Store listing → "+ Add language". The Publish API endpoint for locale
 * data is PATCH /chromewebstore/v1.1/items/{itemId}/localizations/{locale}.
 *
 * Примітка: кожна локаль подається через Developer Dashboard або Publish API.
 */
export const STORE_LOCALES: Record<string, StoreLocale> = {
  en: {
    locale: "en",
    localeName: "English",
    title: "Aegis Lens — OSINT Companion",
    shortDescription:
      "One-click capture of images, URLs & text into Aegis Lens. For journalists and analysts.",
    keywords: [
      "OSINT",
      "open source intelligence",
      "investigative journalism",
      "fact checking",
      "geolocation",
      "reverse image search",
      "conflict monitoring",
    ],
    hasFullDescription: true,
  },

  uk: {
    locale: "uk",
    localeName: "Ukrainian",
    title: "Aegis Lens — OSINT-помічник",
    shortDescription:
      "Одним кліком зберігайте зображення, URL і текст у Aegis Lens. Для журналістів і аналітиків.",
    keywords: [
      "OSINT",
      "розвідка відкритих джерел",
      "журналістика розслідувань",
      "перевірка фактів",
      "геолокація",
      "Україна",
      "верифікація новин",
    ],
    hasFullDescription: true,
  },

  pl: {
    locale: "pl",
    localeName: "Polish",
    title: "Aegis Lens — towarzysz OSINT",
    shortDescription:
      "Jednym kliknięciem zapisuj obrazy, URL-e i tekst do Aegis Lens. Dla dziennikarzy i analityków.",
    keywords: [
      "OSINT",
      "wywiad ze źródeł otwartych",
      "dziennikarstwo śledcze",
      "weryfikacja faktów",
      "geolokalizacja",
      "monitoring konfliktów",
    ],
    hasFullDescription: false,
  },

  de: {
    locale: "de",
    localeName: "German",
    title: "Aegis Lens — OSINT-Assistent",
    shortDescription:
      "Mit einem Klick Bilder, URLs und Texte in Aegis Lens erfassen. Für Journalisten und Analysten.",
    keywords: [
      "OSINT",
      "Open-Source-Aufklärung",
      "investigativer Journalismus",
      "Faktencheck",
      "Geolokalisierung",
      "Konfliktbeobachtung",
    ],
    hasFullDescription: false,
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Return the locale entry for a given BCP 47 code, or undefined if unsupported. */
export function getStoreLocale(locale: string): StoreLocale | undefined {
  return STORE_LOCALES[locale];
}

/** Return all supported BCP 47 locale codes. */
export function getSupportedLocales(): string[] {
  return Object.keys(STORE_LOCALES);
}
