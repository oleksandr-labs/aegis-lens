import type { Locale } from "@aegis/i18n-config";

/**
 * Minimal seed — replaced by DB-backed lookup once data layer lands.
 * Only countries we publish region pages for right now.
 */
export type RegionSeed = {
  iso2: string;
  name: Partial<Record<Locale, string>> & { en: string };
  /** Per-locale 1-paragraph context. */
  description: Partial<Record<Locale, string>> & { en: string };
  /** Capital (for placeholder display). */
  capital: string;
};

export const REGION_SEED: Record<string, RegionSeed> = {
  ua: {
    iso2: "ua",
    name: { en: "Ukraine", uk: "Україна" },
    description: {
      en: "Anchor coverage region. Active conflict; full event taxonomy.",
      uk: "Якірний регіон покриття. Активний конфлікт; повна таксономія подій.",
    },
    capital: "Kyiv",
  },
  pl: {
    iso2: "pl",
    name: { en: "Poland", uk: "Польща" },
    description: {
      en: "NATO frontline; refugee corridors; defense-industry intel.",
      uk: "Фронтова лінія НАТО; коридори біженців; розвідка ОПК.",
    },
    capital: "Warsaw",
  },
  de: {
    iso2: "de",
    name: { en: "Germany", uk: "Німеччина" },
    description: {
      en: "Largest EU economy; deep defense industry and press market.",
      uk: "Найбільша економіка ЄС; розвинений ОПК та преса.",
    },
    capital: "Berlin",
  },
};

export function listRegions(): RegionSeed[] {
  return Object.values(REGION_SEED);
}

export function getRegion(iso2: string): RegionSeed | null {
  return REGION_SEED[iso2.toLowerCase()] ?? null;
}
