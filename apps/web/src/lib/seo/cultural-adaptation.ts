/**
 * Cultural adaptation config for locale-aware content and OG images.
 *
 * Covers: date/number/currency formats, idiom warnings (phrases that don't
 * translate), political phrasing notes, regional examples, and OG image
 * font/overlay config per locale.
 *
 * See TODO/seo/TODO_international_seo.md → "Cultural adaptation".
 */

import type { SupportedLocale } from "./i18n-seo";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CulturalAdaptation {
  locale: SupportedLocale;
  /** Example of a localised date string */
  dateExample: string;
  /** Example of a localised number */
  numberExample: string;
  /** Example of a localised currency amount */
  currencyExample: string;
  /**
   * English-language warnings about idioms / phrases from EN copy that do NOT
   * translate cleanly into this locale. Reviewer checklist.
   */
  idiomWarnings_en: string[];
  /**
   * Notes on political or sensitive phrasing to avoid in this locale.
   * Written in EN for editorial team use.
   */
  politicalPhrasingNotes_en: string[];
  /**
   * Locale-relevant example regions, cities, or events to use instead of
   * defaulting to EN/UK-centric examples.
   */
  regionalExamples: string[];
}

export interface OgImageLocaleConfig {
  locale: SupportedLocale;
  /** Whether to render a translated text overlay on the OG image */
  overlayText: boolean;
  /** Font script family needed for the overlay */
  fontScript: "latin" | "cyrillic";
  /** Text direction for the overlay */
  textDirection: "ltr" | "rtl";
}

// ── Cultural adaptation configs (4 key locales) ───────────────────────────────

/**
 * Four key locales with the most editorial risk. Extend to all 8 when
 * locale-specific copy writers are onboarded.
 */
export const CULTURAL_ADAPTATIONS: CulturalAdaptation[] = [
  // ── English ────────────────────────────────────────────────────────────────
  {
    locale: "en",
    dateExample: "06/10/2026",
    numberExample: "1,234,567",
    currencyExample: "£1,234.56",
    idiomWarnings_en: [
      '"Front line" can mean different things to military vs civilian readers — clarify context.',
      '"Fog of war" is an idiom; may not be understood by non-EN readers if used without explanation.',
      '"Ground truth" is a technical OSINT term; define on first use.',
      '"Deep dive" is EN business idiom; use "detailed analysis" for non-EN markets.',
    ],
    politicalPhrasingNotes_en: [
      'Use "Russian forces" not "Russian army" when referring to irregular units.',
      'Avoid "civil war" framing — this is an internationally recognised armed conflict.',
      'Use "occupied territories" not "separatist-held" — the latter implies autonomy.',
      'Avoid the passive "territory changed hands" — prefer "seized" or "liberated" with sourcing.',
    ],
    regionalExamples: [
      "Kharkiv Oblast frontline",
      "Zaporizhzhia power plant",
      "Kherson crossing points",
      "Bakhmut/Chasiv Yar salient",
    ],
  },

  // ── Ukrainian ──────────────────────────────────────────────────────────────
  {
    locale: "uk",
    dateExample: "10.06.2026",
    numberExample: "1 234 567",
    currencyExample: "1 234,56 ₴",
    idiomWarnings_en: [
      '"Cyberwarfare" → use "кібератаки" (cyberattacks) — "кібервійна" sounds hyperbolic in UA press.',
      '"Intelligence" → "розвідувальні дані" (not "розвідка" alone, which implies an agency).',
      '"Confirmed" → "підтверджено" — always cite the source, not just the claim.',
      '"Sources say" → UA readers expect named or institutional attribution.',
    ],
    politicalPhrasingNotes_en: [
      'Always use Ukrainian transliterations for Ukrainian place names (e.g. Kyiv, not Kiev; Lviv, not Lwów).',
      'Avoid "conflict" alone — official UA framing is "повномасштабне вторгнення" (full-scale invasion) post-2022.',
      'Do not use "DNR/LNR" (Donbas separatist labels) — use "Russian-occupied Donetsk/Luhansk regions".',
      'Use "ЗСУ" (Armed Forces of Ukraine) not "Ukrainian military" — more precise and preferred by UA audience.',
    ],
    regionalExamples: [
      "Харківська область",
      "Запорізька АЕС",
      "Херсонська область",
      "Авдіївка / Часів Яр",
    ],
  },

  // ── Polish ─────────────────────────────────────────────────────────────────
  {
    locale: "pl",
    dateExample: "10.06.2026",
    numberExample: "1 234 567",
    currencyExample: "1 234,56 zł",
    idiomWarnings_en: [
      '"OSINT" is widely understood in PL security circles but less so in general public — add a brief explainer.',
      '"Real-time" → "w czasie rzeczywistym" — do not abbreviate as "RT" (TV channel connotation in PL).',
      '"Intelligence platform" → "platforma wywiadowcza" — acceptable in PL; avoid "szpiegowska".',
    ],
    politicalPhrasingNotes_en: [
      'PL readers are highly sensitive to Russo-Ukrainian war framing — always use "Rosja" (Russia) not "RF".',
      'Reference Polish-Ukrainian solidarity framing positively (Kresy, Lwów history is complex — tread carefully).',
      'Avoid "Eastern Europe" as a geographic catch-all — use specific countries.',
      'Do not imply NATO endorsement without sourcing — Poland is NATO, but platform neutrality matters.',
    ],
    regionalExamples: [
      "Ukraina wschodnia (Lwów, Charków)",
      "granica Polska-Ukraina",
      "Morze Czarne i korytarz zbożowy",
      "obwód doniecki",
    ],
  },

  // ── German ─────────────────────────────────────────────────────────────────
  {
    locale: "de",
    dateExample: "10.06.2026",
    numberExample: "1.234.567",
    currencyExample: "1.234,56 €",
    idiomWarnings_en: [
      '"Boots on the ground" has no clean DE equivalent — use "Bodentruppen" (ground troops).',
      '"OSINT" is understood in DE security/journalism circles but needs context for general readers.',
      '"Front line" → "Frontlinie" is correct; avoid "Kampflinie" (dated, WW2 connotation).',
      '"Deep fake" → "Deepfake" is accepted in DE tech press.',
    ],
    politicalPhrasingNotes_en: [
      'DE readers are cautious about military language given historical context — prefer neutral descriptors.',
      'Avoid "Krieg" alone in headlines where "Konflikt" may be more accurate for specific situations.',
      'Bundeswehr references should be accurate — Germany has specific rules on arms export/aid framing.',
      '"Zeitenwende" (turning point) is a politically loaded term in DE — use carefully.',
    ],
    regionalExamples: [
      "Frontlinie Donbass",
      "Schwarzes Meer (Kornkorridor)",
      "Saporischschja-Kraftwerk",
      "Odessa/Mykolajiw",
    ],
  },
];

// ── OG image locale configs ───────────────────────────────────────────────────

/**
 * OG image rendering config per locale.
 * Drives the image generation service (e.g. @vercel/og) to pick the correct
 * font, script, and whether to render a localised text overlay.
 */
export const OG_IMAGE_LOCALE_CONFIG: OgImageLocaleConfig[] = [
  { locale: "en", overlayText: true, fontScript: "latin", textDirection: "ltr" },
  { locale: "uk", overlayText: true, fontScript: "cyrillic", textDirection: "ltr" },
  { locale: "ru", overlayText: false, fontScript: "cyrillic", textDirection: "ltr" },
  { locale: "pl", overlayText: true, fontScript: "latin", textDirection: "ltr" },
  { locale: "de", overlayText: true, fontScript: "latin", textDirection: "ltr" },
  { locale: "ro", overlayText: true, fontScript: "latin", textDirection: "ltr" },
  { locale: "fr", overlayText: true, fontScript: "latin", textDirection: "ltr" },
  { locale: "es", overlayText: true, fontScript: "latin", textDirection: "ltr" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Get cultural adaptation config for a locale, or undefined if not defined. */
export function getCulturalAdaptation(locale: SupportedLocale): CulturalAdaptation | undefined {
  return CULTURAL_ADAPTATIONS.find((a) => a.locale === locale);
}

/** Get OG image config for a locale. */
export function getOgImageConfig(locale: SupportedLocale): OgImageLocaleConfig | undefined {
  return OG_IMAGE_LOCALE_CONFIG.find((c) => c.locale === locale);
}
