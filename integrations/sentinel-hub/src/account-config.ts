/**
 * Task 1 & 2 — Account / subscription configuration (codeable contract).
 *
 * The two TODO tasks "Copernicus Data Space Ecosystem account" and "Sentinel Hub
 * commercial subscription (Phase 1+)" cannot be *performed* in code (they require
 * a registered account + a paid contract). The deliverable per the sprint brief is
 * the typed config + a COMPLIANCE.md that encode the account/tier facts so the rest
 * of the platform can gate behaviour correctly.
 *
 * See `COMPLIANCE.md` for the licensing / attribution / quota facts behind these
 * numbers. The processing-unit (PU) accounting that consumes the selected tier
 * lives in `cost-monitor.ts`.
 */

import type { I18nText } from "./types";

/**
 * Where the OAuth2 credentials originate. Copernicus Data Space Ecosystem (CDSE)
 * and the legacy/commercial Sentinel Hub services share the same Process API
 * contract but live on different hosts and have different quota regimes.
 */
export type SentinelHubDeployment = "cdse" | "sh_commercial";

/** OAuth2 / host endpoints per deployment. Read secrets from env — never hardcode. */
export const DEPLOYMENT_HOSTS: Record<
  SentinelHubDeployment,
  { baseUrl: string; tokenUrl: string; label: I18nText }
> = {
  cdse: {
    // Copernicus Data Space Ecosystem (free, open Sentinel-1/2).
    baseUrl: "https://sh.dataspace.copernicus.eu",
    tokenUrl: "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token",
    label: {
      en: "Copernicus Data Space Ecosystem (free tier)",
      uk: "Copernicus Data Space Ecosystem (безкоштовний рівень)",
    },
  },
  sh_commercial: {
    // Sinergise / Planet-operated commercial Sentinel Hub.
    baseUrl: "https://services.sentinel-hub.com",
    tokenUrl: "https://services.sentinel-hub.com/oauth/token",
    label: {
      en: "Sentinel Hub (commercial subscription)",
      uk: "Sentinel Hub (комерційна підписка)",
    },
  },
};

/**
 * Subscription tiers. PU/min and PU/month figures are the *budgeting contract*
 * the platform plans against — confirm exact current numbers against the live
 * pricing page before procurement (see COMPLIANCE.md "Verify before purchase").
 */
export type SubscriptionTier =
  | "cdse_free"        // CDSE free account
  | "sh_exploration"   // Sentinel Hub Exploration
  | "sh_basic"         // Sentinel Hub Basic
  | "sh_enterprise_s"  // Enterprise S
  | "sh_enterprise_l"; // Enterprise L

export interface TierConfig {
  tier: SubscriptionTier;
  deployment: SentinelHubDeployment;
  label: I18nText;
  /** Rate cap: processing units per minute (throttling guard). */
  puPerMinute: number;
  /** Soft monthly PU allowance the budget alerts are computed against. */
  puPerMonth: number;
  /** Max concurrent Process API requests permitted by the tier. */
  maxConcurrentRequests: number;
  /** Whether commercial third-party providers (Planet/BlackSky/Capella) are even contractually permitted. */
  allowsCommercialProviders: boolean;
  /** Notes (procurement / contractual). */
  note: I18nText;
}

/**
 * Tier matrix. These are the planning defaults; treat as a *contract*, not a
 * source of truth for billing — billing is metered live in `cost-monitor.ts`.
 */
export const TIER_CONFIGS: Record<SubscriptionTier, TierConfig> = {
  cdse_free: {
    tier: "cdse_free",
    deployment: "cdse",
    label: { en: "CDSE Free", uk: "CDSE безкоштовний" },
    puPerMinute: 100,
    puPerMonth: 30_000,
    maxConcurrentRequests: 5,
    allowsCommercialProviders: false,
    note: {
      en: "Free Sentinel-1/2 only. Severely rate-limited — not for production refresh fleets.",
      uk: "Лише безкоштовні Sentinel-1/2. Жорсткі ліміти — не для продакшн-оновлень.",
    },
  },
  sh_exploration: {
    tier: "sh_exploration",
    deployment: "sh_commercial",
    label: { en: "SH Exploration", uk: "SH Exploration" },
    puPerMinute: 300,
    puPerMonth: 30_000,
    maxConcurrentRequests: 10,
    allowsCommercialProviders: false,
    note: {
      en: "Entry commercial tier — evaluation / low-volume AOIs.",
      uk: "Початковий комерційний рівень — оцінка / малий обсяг AOI.",
    },
  },
  sh_basic: {
    tier: "sh_basic",
    deployment: "sh_commercial",
    label: { en: "SH Basic", uk: "SH Basic" },
    puPerMinute: 300,
    puPerMonth: 300_000,
    maxConcurrentRequests: 20,
    allowsCommercialProviders: false,
    note: {
      en: "Production baseline for the AOI refresh fleet (free Sentinel data).",
      uk: "Базовий продакшн-рівень для оновлення AOI (безкоштовні дані Sentinel).",
    },
  },
  sh_enterprise_s: {
    tier: "sh_enterprise_s",
    deployment: "sh_commercial",
    label: { en: "SH Enterprise S", uk: "SH Enterprise S" },
    puPerMinute: 1_000,
    puPerMonth: 3_000_000,
    maxConcurrentRequests: 50,
    allowsCommercialProviders: true,
    note: {
      en: "Enterprise — unlocks third-party commercial providers (BYOC / Planet).",
      uk: "Enterprise — відкриває сторонніх комерційних постачальників (BYOC / Planet).",
    },
  },
  sh_enterprise_l: {
    tier: "sh_enterprise_l",
    deployment: "sh_commercial",
    label: { en: "SH Enterprise L", uk: "SH Enterprise L" },
    puPerMinute: 2_000,
    puPerMonth: 10_000_000,
    maxConcurrentRequests: 100,
    allowsCommercialProviders: true,
    note: {
      en: "High-volume enterprise — multi-region daily SAR + optical refresh.",
      uk: "Високообсяговий enterprise — щоденне SAR + оптика по багатьох регіонах.",
    },
  },
};

/** The full resolved account configuration the runtime uses. */
export interface AccountConfig {
  deployment: SentinelHubDeployment;
  tier: SubscriptionTier;
  baseUrl: string;
  tokenUrl: string;
  /** Env var NAME (not value) the OAuth clientId is read from. */
  clientIdEnv: string;
  /** Env var NAME (not value) the OAuth clientSecret is read from. */
  clientSecretEnv: string;
}

/** Default to the free CDSE account when nothing is configured. */
export const DEFAULT_ACCOUNT_CONFIG: AccountConfig = {
  deployment: "cdse",
  tier: "cdse_free",
  baseUrl: DEPLOYMENT_HOSTS.cdse.baseUrl,
  tokenUrl: DEPLOYMENT_HOSTS.cdse.tokenUrl,
  clientIdEnv: "SH_CLIENT_ID",
  clientSecretEnv: "SH_CLIENT_SECRET",
};

/**
 * Resolve an AccountConfig from a chosen tier, filling host/token URLs from the
 * deployment matrix. Pure — does not read env or perform network I/O.
 */
export function resolveAccountConfig(
  tier: SubscriptionTier,
  envNames: { clientIdEnv?: string; clientSecretEnv?: string } = {},
): AccountConfig {
  const tc = TIER_CONFIGS[tier];
  const host = DEPLOYMENT_HOSTS[tc.deployment];
  return {
    deployment: tc.deployment,
    tier,
    baseUrl: host.baseUrl,
    tokenUrl: host.tokenUrl,
    clientIdEnv: envNames.clientIdEnv ?? "SH_CLIENT_ID",
    clientSecretEnv: envNames.clientSecretEnv ?? "SH_CLIENT_SECRET",
  };
}

/** True when the tier contractually permits tasking commercial providers. */
export function tierAllowsCommercial(tier: SubscriptionTier): boolean {
  return TIER_CONFIGS[tier].allowsCommercialProviders;
}
