/**
 * Locale Expansion — Phase 4 multi-locale rollout plan.
 *
 * Defines the 10 target locales and their phased launch schedule.
 * Phase 1: EN only. Phase 2: UK. Phase 3: RU/PL/DE. Phase 4: 8+ locales.
 *
 * 10 цільових локалей та поетапний графік запуску.
 */

'use server';

// ── Target locales ────────────────────────────────────────────────────────────

export const TARGET_LOCALES = [
  'en', 'uk', 'ru', 'pl', 'de', 'ar', 'fr', 'es', 'fa', 'tr',
] as const;

export type TargetLocale = typeof TARGET_LOCALES[number];

// ── Launch phases ─────────────────────────────────────────────────────────────

/**
 * Phase in which each locale launches.
 *
 * Фаза, в якій запускається кожна локаль.
 */
export const LOCALE_LAUNCH_PHASES: Record<TargetLocale, number> = {
  en: 1,
  uk: 2,
  ru: 3,
  pl: 3,
  de: 3,
  ar: 4,
  fr: 4,
  es: 4,
  fa: 4,
  tr: 4,
};

// ── Locale metadata ───────────────────────────────────────────────────────────

export interface LocaleMeta {
  code: TargetLocale;
  /** English name — Назва мовою English */
  name: string;
  /** Native name — Рідна назва */
  nativeName: string;
  /** Text direction — Напрямок тексту */
  dir: 'ltr' | 'rtl';
  /** Launch phase — Фаза запуску */
  launchPhase: number;
}

export const LOCALE_META: Record<TargetLocale, LocaleMeta> = {
  en: { code: 'en', name: 'English',  nativeName: 'English',    dir: 'ltr', launchPhase: 1 },
  uk: { code: 'uk', name: 'Ukrainian',nativeName: 'Українська', dir: 'ltr', launchPhase: 2 },
  ru: { code: 'ru', name: 'Russian',  nativeName: 'Русский',    dir: 'ltr', launchPhase: 3 },
  pl: { code: 'pl', name: 'Polish',   nativeName: 'Polski',     dir: 'ltr', launchPhase: 3 },
  de: { code: 'de', name: 'German',   nativeName: 'Deutsch',    dir: 'ltr', launchPhase: 3 },
  ar: { code: 'ar', name: 'Arabic',   nativeName: 'العربية',    dir: 'rtl', launchPhase: 4 },
  fr: { code: 'fr', name: 'French',   nativeName: 'Français',   dir: 'ltr', launchPhase: 4 },
  es: { code: 'es', name: 'Spanish',  nativeName: 'Español',    dir: 'ltr', launchPhase: 4 },
  fa: { code: 'fa', name: 'Persian',  nativeName: 'فارسی',      dir: 'rtl', launchPhase: 4 },
  tr: { code: 'tr', name: 'Turkish',  nativeName: 'Türkçe',     dir: 'ltr', launchPhase: 4 },
};

// ── Expansion config ──────────────────────────────────────────────────────────

export interface LocaleExpansionConfig {
  targetLocales: ReadonlyArray<TargetLocale>;
  launchPhases: Record<TargetLocale, number>;
  localeMeta: Record<TargetLocale, LocaleMeta>;
  /** RTL locales — Локалі з правим-до-лівого напрямом */
  rtlLocales: TargetLocale[];
  /** Locales requiring native-review before launch (YMYL) — Локалі, що потребують нейтивного ревью */
  nativeReviewRequired: TargetLocale[];
}

export const LOCALE_EXPANSION_CONFIG: LocaleExpansionConfig = {
  targetLocales: TARGET_LOCALES,
  launchPhases: LOCALE_LAUNCH_PHASES,
  localeMeta: LOCALE_META,
  rtlLocales: ['ar', 'fa'],
  nativeReviewRequired: ['ar', 'fa', 'tr', 'ru'],
};
