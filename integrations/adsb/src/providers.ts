/**
 * ADS-B provider / tier configuration.
 *
 * The aviation layer can be fed by more than one ADS-B source. Each provider
 * exposes several access tiers with materially different licensing, rate limits
 * and (critically) commercial-billing obligations. This module encodes those
 * facts as a typed, conservative config so the ingest layer can pick a tier and
 * the COMPLIANCE/billing posture is explicit in code rather than tribal
 * knowledge. See `COMPLIANCE.md` for the prose/license version.
 *
 * No secrets here — credentials come from `process.env` at the client layer.
 */

export type AdsbProviderId = "opensky" | "adsbexchange";

/** Commercial-billing posture of a tier. */
export type BillingModel =
  | "free"            // no payment, attribution / fair-use only
  | "free_research"   // free but gated behind an institutional research agreement
  | "subscription"    // recurring paid plan
  | "metered";        // pay-per-credit / pay-per-call

export interface ProviderTier {
  id: string;
  /** Human label, en + uk. */
  label: { en: string; uk: string };
  billing: BillingModel;
  /** True when this tier may be used in production without a paid contract. */
  productionAllowed: boolean;
  /** True when a signed agreement (research/commercial) must be in place first. */
  requiresAgreement: boolean;
  /** Minimum polite polling interval in ms (rate-limit floor). null = streaming. */
  minPollIntervalMs: number | null;
  /** Daily request/credit budget where the provider publishes one. */
  dailyBudget: number | null;
  /** Whether raw positions may be re-published / cached for redistribution. */
  redistribution: "forbidden" | "attribution" | "per_contract";
  /** Short note on what unlocks the tier. */
  notes: { en: string; uk: string };
}

export interface AdsbProvider {
  id: AdsbProviderId;
  name: string;
  baseUrl: string;
  termsUrl: string;
  tiers: ProviderTier[];
  /** env var names the client reads for this provider (never the values). */
  envKeys: string[];
}

/**
 * OpenSky Network.
 * Free anonymous + authenticated tiers exist for non-commercial / research use;
 * production / commercial use requires a separate commercial agreement.
 * Docs: https://openskynetwork.github.io/opensky-api/
 */
export const OPENSKY_PROVIDER: AdsbProvider = {
  id: "opensky",
  name: "OpenSky Network",
  baseUrl: "https://opensky-network.org/api",
  termsUrl: "https://opensky-network.org/about/terms-of-use",
  envKeys: ["OPENSKY_USERNAME", "OPENSKY_PASSWORD", "OPENSKY_CLIENT_ID", "OPENSKY_CLIENT_SECRET"],
  tiers: [
    {
      id: "anonymous",
      label: { en: "Anonymous (fair-use)", uk: "Анонімний (чесне користування)" },
      billing: "free",
      productionAllowed: false,
      requiresAgreement: false,
      minPollIntervalMs: 10_000,
      dailyBudget: 400,
      redistribution: "attribution",
      notes: {
        en: "400 credits/day, 10s polling floor. Non-commercial only — attribute OpenSky.",
        uk: "400 кредитів/добу, мінімум 10с між запитами. Лише некомерційне — з атрибуцією OpenSky.",
      },
    },
    {
      id: "research",
      label: { en: "Registered research", uk: "Зареєстрований дослідницький" },
      billing: "free_research",
      productionAllowed: false,
      requiresAgreement: true,
      minPollIntervalMs: 5_000,
      dailyBudget: 4_000,
      redistribution: "attribution",
      notes: {
        en: "Free for verified academic/research use; higher credit budget. Needs an account + non-commercial declaration.",
        uk: "Безкоштовно для перевіреного академічного/дослідницького використання; більший ліміт кредитів. Потрібен акаунт + декларація про некомерційність.",
      },
    },
    {
      id: "commercial",
      label: { en: "Commercial agreement", uk: "Комерційна угода" },
      billing: "subscription",
      productionAllowed: true,
      requiresAgreement: true,
      minPollIntervalMs: 1_000,
      dailyBudget: null,
      redistribution: "per_contract",
      notes: {
        en: "Required for any production / commercial deployment. Negotiated limits + redistribution terms.",
        uk: "Обов'язково для будь-якого продакшн / комерційного розгортання. Узгоджені ліміти + умови розповсюдження.",
      },
    },
  ],
};

/**
 * ADS-B Exchange.
 * Unfiltered ADS-B feed. The data is sourced via RapidAPI under a paid
 * subscription; production use REQUIRES a commercial plan (no free production
 * tier). Feeders who contribute may receive complimentary access under separate
 * terms, but that is not assumed here.
 * Docs: https://www.adsbexchange.com/data/
 */
export const ADSBEXCHANGE_PROVIDER: AdsbProvider = {
  id: "adsbexchange",
  name: "ADS-B Exchange",
  baseUrl: "https://adsbexchange-com1.p.rapidapi.com/v2",
  termsUrl: "https://www.adsbexchange.com/legal-and-privacy/",
  envKeys: ["ADSBEXCHANGE_RAPIDAPI_KEY", "ADSBEXCHANGE_RAPIDAPI_HOST"],
  tiers: [
    {
      id: "rapidapi_basic",
      label: { en: "RapidAPI Basic (paid)", uk: "RapidAPI Basic (платний)" },
      billing: "metered",
      productionAllowed: true,
      requiresAgreement: true,
      minPollIntervalMs: 1_000,
      dailyBudget: null,
      redistribution: "forbidden",
      notes: {
        en: "Metered per-call billing via RapidAPI. No redistribution of raw positions. Required for production.",
        uk: "Похвилинна тарифікація через RapidAPI. Без розповсюдження сирих позицій. Обов'язково для продакшну.",
      },
    },
    {
      id: "enterprise",
      label: { en: "Enterprise subscription", uk: "Корпоративна підписка" },
      billing: "subscription",
      productionAllowed: true,
      requiresAgreement: true,
      minPollIntervalMs: 1_000,
      dailyBudget: null,
      redistribution: "per_contract",
      notes: {
        en: "Direct commercial subscription with negotiated volume + redistribution terms.",
        uk: "Пряма комерційна підписка з узгодженим обсягом + умовами розповсюдження.",
      },
    },
  ],
};

export const ADSB_PROVIDERS: Record<AdsbProviderId, AdsbProvider> = {
  opensky: OPENSKY_PROVIDER,
  adsbexchange: ADSBEXCHANGE_PROVIDER,
};

export function getProvider(id: AdsbProviderId): AdsbProvider {
  return ADSB_PROVIDERS[id];
}

export function getTier(id: AdsbProviderId, tierId: string): ProviderTier | null {
  return ADSB_PROVIDERS[id].tiers.find((t) => t.id === tierId) ?? null;
}

/** Guard: throw if a chosen tier is not allowed for production deployment. */
export function assertProductionTier(id: AdsbProviderId, tierId: string): ProviderTier {
  const tier = getTier(id, tierId);
  if (!tier) throw new Error(`Unknown ADS-B tier ${id}/${tierId}`);
  if (!tier.productionAllowed) {
    throw new Error(
      `ADS-B tier ${id}/${tierId} is not licensed for production — a commercial/research agreement is required (see COMPLIANCE.md).`,
    );
  }
  return tier;
}
