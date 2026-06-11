/**
 * Per-locale keyword clusters — separate keyword research per language,
 * NOT direct translations. Each cluster reflects how native speakers actually
 * search for OSINT / conflict-monitoring content in that language.
 *
 * See TODO/seo/TODO_international_seo.md → "Per-locale keyword research".
 * Pairs with locale-sitemaps.ts and i18n-seo.ts.
 */

import type { SupportedLocale } from "./i18n-seo";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LocaleKeywordCluster {
  locale: SupportedLocale;
  /** Human-readable cluster name (EN) */
  cluster: string;
  /** Primary keywords for this locale — native-language terms */
  keywords: string[];
  /** Indicative monthly search volume range */
  searchVolume?: string;
  /** SEO keyword difficulty estimate */
  difficulty?: string;
}

// ── Clusters ──────────────────────────────────────────────────────────────────

/**
 * Separate keyword clusters per language.
 * EN and UK are primary; others are secondary (coverage) locales.
 *
 * Rule: these are NATIVE search patterns, not Google Translate outputs.
 * Review each cluster with a native speaker before using in page copy.
 */
export const LOCALE_KEYWORD_CLUSTERS: LocaleKeywordCluster[] = [
  // ── English ──────────────────────────────────────────────────────────────
  {
    locale: "en",
    cluster: "Live conflict map",
    keywords: [
      "live ukraine war map",
      "ukraine conflict map real time",
      "ukraine war tracker",
      "ukraine front line map 2024",
      "ukraine battlefield map live",
      "ukraine attack map today",
      "ukraine war map update",
      "ukraine missile strikes map",
    ],
    searchVolume: "50k–200k/mo",
    difficulty: "medium-high",
  },
  {
    locale: "en",
    cluster: "OSINT platform",
    keywords: [
      "osint intelligence platform",
      "open source intelligence tools",
      "osint investigation tool",
      "osint map tool",
      "conflict monitoring platform",
      "real-time event tracking osint",
      "osint ukraine",
      "geolocation verification tool",
    ],
    searchVolume: "10k–50k/mo",
    difficulty: "medium",
  },

  // ── Ukrainian ─────────────────────────────────────────────────────────────
  {
    locale: "uk",
    cluster: "Карта війни",
    keywords: [
      "карта війни онлайн",
      "карта бойових дій онлайн",
      "карта фронту Україна",
      "карта обстрілів України",
      "карта ударів по Україні",
      "онлайн карта фронту 2024",
      "актуальна карта бойових дій",
      "карта бойових дій сьогодні",
    ],
    searchVolume: "100k–500k/mo",
    difficulty: "high",
  },
  {
    locale: "uk",
    cluster: "OSINT Україна",
    keywords: [
      "аналіз подій в Україні",
      "OSINT Україна",
      "моніторинг конфлікту",
      "верифікація фото та відео",
      "геолокація відео розслідування",
      "розвідка відкритих джерел",
      "розслідування воєнних злочинів",
      "аналіз супутникових знімків",
    ],
    searchVolume: "5k–20k/mo",
    difficulty: "low-medium",
  },

  // ── Russian (coverage locale — not promoted, no advertising) ──────────────
  {
    locale: "ru",
    cluster: "Карта конфликта",
    keywords: [
      "карта войны в реальном времени",
      "карта боевых действий онлайн",
      "мониторинг конфликта",
      "карта фронта Украина",
    ],
    searchVolume: "unknown",
    difficulty: "n/a — coverage only",
  },

  // ── Polish ────────────────────────────────────────────────────────────────
  {
    locale: "pl",
    cluster: "Mapa konfliktu",
    keywords: [
      "mapa konfliktu na żywo",
      "mapa wojny ukraina aktualna",
      "monitoring sytuacji w Ukrainie",
      "OSINT Polska narzędzia",
      "weryfikacja zdjęć online",
      "aktualna mapa frontu ukraina",
    ],
    searchVolume: "20k–80k/mo",
    difficulty: "medium",
  },

  // ── German ────────────────────────────────────────────────────────────────
  {
    locale: "de",
    cluster: "Ukraine Krieg Karte",
    keywords: [
      "Ukraine Krieg Karte live",
      "Ukraine Konflikt Karte aktuell",
      "Konfliktüberwachung Ukraine",
      "OSINT Deutschland Werkzeuge",
      "Ukraine Front Karte heute",
      "offene Quellen Nachrichtendienst",
    ],
    searchVolume: "30k–100k/mo",
    difficulty: "medium",
  },

  // ── Romanian ──────────────────────────────────────────────────────────────
  {
    locale: "ro",
    cluster: "Harta conflict Ucraina",
    keywords: [
      "harta conflict ucraina live",
      "harta razboi ucraina",
      "monitorizare conflict ucraina",
      "OSINT Romania instrumente",
    ],
    searchVolume: "5k–20k/mo",
    difficulty: "low",
  },

  // ── French ────────────────────────────────────────────────────────────────
  {
    locale: "fr",
    cluster: "Carte conflit Ukraine",
    keywords: [
      "carte conflit ukraine en direct",
      "carte guerre ukraine temps réel",
      "surveillance conflit ukraine",
      "renseignement sources ouvertes",
    ],
    searchVolume: "10k–40k/mo",
    difficulty: "medium",
  },

  // ── Spanish ───────────────────────────────────────────────────────────────
  {
    locale: "es",
    cluster: "Mapa conflicto Ucrania",
    keywords: [
      "mapa conflicto ucrania en vivo",
      "mapa guerra ucrania tiempo real",
      "monitoreo conflicto ucrania",
      "inteligencia fuentes abiertas",
    ],
    searchVolume: "10k–35k/mo",
    difficulty: "medium",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Get all keywords for a given locale across all clusters.
 */
export function getKeywordsForLocale(locale: SupportedLocale): string[] {
  return LOCALE_KEYWORD_CLUSTERS.filter((c) => c.locale === locale).flatMap(
    (c) => c.keywords,
  );
}

/**
 * Per-locale meta templates with `{pageTitle}` placeholder.
 * These are base patterns; page-specific metadata overrides the title portion.
 *
 * Note: keep descriptions under 160 chars for SERP truncation.
 */
export function buildLocaleMetaTemplate(locale: SupportedLocale): {
  titleTemplate: string;
  descriptionTemplate: string;
} {
  switch (locale) {
    case "en":
      return {
        titleTemplate: "{pageTitle} | Aegis Lens — Live Ukraine Conflict Map & OSINT Platform",
        descriptionTemplate:
          "Track Ukraine conflict events in real time. Verified OSINT intelligence, live map, analyst-grade data. {pageTitle} on Aegis Lens.",
      };
    case "uk":
      return {
        titleTemplate: "{pageTitle} | Aegis Lens — Карта бойових дій онлайн",
        descriptionTemplate:
          "Відстежуйте події конфлікту в Україні в реальному часі. Верифіковані OSINT-дані, карта фронту, аналітика. {pageTitle} на Aegis Lens.",
      };
    case "ru":
      return {
        titleTemplate: "{pageTitle} | Aegis Lens — Карта конфликта онлайн",
        descriptionTemplate:
          "Мониторинг событий конфликта в реальном времени. Верифицированные данные OSINT. {pageTitle} на Aegis Lens.",
      };
    case "pl":
      return {
        titleTemplate: "{pageTitle} | Aegis Lens — Mapa konfliktu na żywo",
        descriptionTemplate:
          "Śledź wydarzenia na Ukrainie w czasie rzeczywistym. Zweryfikowane dane OSINT, mapa frontu. {pageTitle} na Aegis Lens.",
      };
    case "de":
      return {
        titleTemplate: "{pageTitle} | Aegis Lens — Ukraine Karte live",
        descriptionTemplate:
          "Echtzeit-Überwachung des Ukraine-Konflikts. Verifizierte OSINT-Daten, Live-Karte. {pageTitle} auf Aegis Lens.",
      };
    case "ro":
      return {
        titleTemplate: "{pageTitle} | Aegis Lens — Harta conflict live",
        descriptionTemplate:
          "Monitorizare conflict Ucraina în timp real. Date OSINT verificate, hartă live. {pageTitle} pe Aegis Lens.",
      };
    case "fr":
      return {
        titleTemplate: "{pageTitle} | Aegis Lens — Carte conflit en direct",
        descriptionTemplate:
          "Surveillance du conflit en Ukraine en temps réel. Données OSINT vérifiées, carte en direct. {pageTitle} sur Aegis Lens.",
      };
    case "es":
      return {
        titleTemplate: "{pageTitle} | Aegis Lens — Mapa conflicto en vivo",
        descriptionTemplate:
          "Monitoreo del conflicto en Ucrania en tiempo real. Datos OSINT verificados, mapa en vivo. {pageTitle} en Aegis Lens.",
      };
    default: {
      const _exhaustive: never = locale;
      return _exhaustive;
    }
  }
}
