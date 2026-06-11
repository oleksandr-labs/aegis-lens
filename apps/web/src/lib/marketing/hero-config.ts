/**
 * Hero animation configurations for Aegis Lens marketing surfaces.
 *
 * Four variants cover different entry points:
 *   globe-ticker      — primary landing (WebGL globe + live event ticker)
 *   use-case          — persona-specific landing (/for/journalist, /for/analyst …)
 *   comparison        — vs-competitor page (split-screen)
 *   region-snapshot   — regional focus page (live map snapshot as hero)
 */

export type HeroVariant =
  | "globe-ticker"
  | "use-case"
  | "comparison"
  | "region-snapshot";

export interface HeroConfig {
  variant: HeroVariant;
  headline_en: string;
  headline_uk: string;
  subheadline_en: string;
  subheadline_uk: string;
  ctaPrimary_en: string;
  ctaPrimary_uk: string;
  ctaSecondary_en?: string;
  ctaSecondary_uk?: string;
  /** Enable the Three.js / WebGL globe. Disable on low-end / no-JS paths. */
  webGLEnabled: boolean;
  /** Three.js particle count for the event stream effect. */
  particleCount: number;
  /** Globe auto-rotation speed in deg/s. 0 = static. */
  globeRotationSpeed: number;
  /** Optional UTM persona tag used for CTA copy selection. */
  personaTag?: string;
}

export const HERO_CONFIGS: Record<HeroVariant, HeroConfig> = {
  "globe-ticker": {
    variant: "globe-ticker",
    headline_en: "Intelligence at the speed of events.",
    headline_uk: "Розвідка зі швидкістю подій.",
    subheadline_en:
      "AI-native OSINT platform. Verified events, multilingual analysis, real-time map. Ukraine first — global next.",
    subheadline_uk:
      "AI-нативна OSINT-платформа. Верифіковані події, багатомовний аналіз, карта в реальному часі.",
    ctaPrimary_en: "Start for free",
    ctaPrimary_uk: "Почати безплатно",
    ctaSecondary_en: "Watch 90-second demo",
    ctaSecondary_uk: "Переглянути 90-секундне демо",
    webGLEnabled: true,
    particleCount: 600,
    globeRotationSpeed: 4,
  },

  "use-case": {
    variant: "use-case",
    headline_en: "Built for analysts who need answers, not noise.",
    headline_uk: "Для аналітиків, яким потрібні відповіді, а не шум.",
    subheadline_en:
      "Structured OSINT workflows, AI-powered summarisation, and evidence trails — all in one workspace.",
    subheadline_uk:
      "Структуровані OSINT-робочі процеси, підсумовування на базі AI та ланцюжки доказів — у єдиному робочому просторі.",
    ctaPrimary_en: "Request analyst access",
    ctaPrimary_uk: "Запросити аналітичний доступ",
    ctaSecondary_en: "See sample report",
    ctaSecondary_uk: "Переглянути зразок звіту",
    webGLEnabled: false,
    particleCount: 0,
    globeRotationSpeed: 0,
    personaTag: "analyst",
  },

  "comparison": {
    variant: "comparison",
    headline_en: "Everything you need. Nothing you don't.",
    headline_uk: "Все, що потрібно. Нічого зайвого.",
    subheadline_en:
      "See how Aegis Lens compares to legacy OSINT tooling on speed, coverage, and AI depth.",
    subheadline_uk:
      "Порівняйте Aegis Lens із застарілими OSINT-інструментами за швидкістю, охопленням та глибиною AI.",
    ctaPrimary_en: "Try Aegis Lens free",
    ctaPrimary_uk: "Спробувати Aegis Lens безплатно",
    ctaSecondary_en: "Full comparison table",
    ctaSecondary_uk: "Повна порівняльна таблиця",
    webGLEnabled: false,
    particleCount: 0,
    globeRotationSpeed: 0,
  },

  "region-snapshot": {
    variant: "region-snapshot",
    headline_en: "Live situation — updated every 60 seconds.",
    headline_uk: "Жива ситуація — оновлюється кожні 60 секунд.",
    subheadline_en:
      "Geolocated incidents, air-raid alerts, and verified open-source intelligence for your area of interest.",
    subheadline_uk:
      "Геолоковані інциденти, сигнали повітряної тривоги та верифікована розвідка для вашого регіону інтересу.",
    ctaPrimary_en: "Open live map",
    ctaPrimary_uk: "Відкрити живу карту",
    ctaSecondary_en: "Export situation report",
    ctaSecondary_uk: "Експортувати звіт про ситуацію",
    webGLEnabled: true,
    particleCount: 200,
    globeRotationSpeed: 0,
  },
};

/**
 * Return the most relevant HeroConfig for a given UTM persona string.
 * Falls back to globe-ticker (primary) for unknown personas.
 */
export function getHeroConfigForPersona(utmPersona: string): HeroConfig {
  const normalised = utmPersona.toLowerCase().trim();

  const personaMap: Record<string, HeroVariant> = {
    analyst: "use-case",
    journalist: "use-case",
    journalist_en: "use-case",
    researcher: "use-case",
    ngo: "use-case",
    gov: "use-case",
    government: "use-case",
    compare: "comparison",
    vs: "comparison",
    region: "region-snapshot",
    regional: "region-snapshot",
    local: "region-snapshot",
  };

  const variant: HeroVariant = personaMap[normalised] ?? "globe-ticker";
  const base = HERO_CONFIGS[variant];

  // Attach the persona tag so downstream CTA logic can read it
  return { ...base, personaTag: utmPersona };
}
