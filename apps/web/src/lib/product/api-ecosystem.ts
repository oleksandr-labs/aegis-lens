/**
 * API Ecosystem — public API tiers and partner programme spec.
 *
 * Phase 4 feature establishing Aegis Lens as a data platform with a
 * tiered public API and a three-tier partner programme.
 *
 * Публічний API + партнерська програма фази 4.
 */

'use server';

// ── API tiers ─────────────────────────────────────────────────────────────────

export type ApiEcosystemTier = 'free-public' | 'developer' | 'partner' | 'enterprise';

export const API_ECOSYSTEM_TIERS: ApiEcosystemTier[] = [
  'free-public', 'developer', 'partner', 'enterprise',
];

// ── Tier limits ───────────────────────────────────────────────────────────────

export interface ApiTierLimits {
  /** Requests per day — Запитів на день */
  requestsPerDay: number | null;
  /** Max events returned per call — Макс. подій за виклик */
  eventsPerCall: number;
  /** Historical data lookback in days — Глибина архіву (дні) */
  historyDays: number;
  /** Access to premium endpoints — Доступ до premium endpoints */
  premiumEndpoints: boolean;
  /** Real-time websocket — WebSocket у реальному часі */
  websocket: boolean;
  /** Price per month in USD (0 = free) — Ціна (USD/міс) */
  priceUsdMonth: number;
  /** SLA uptime % — SLA uptime */
  slaUptimePct: number | null;
}

export const API_ECOSYSTEM_LIMITS: Record<ApiEcosystemTier, ApiTierLimits> = {
  'free-public': {
    requestsPerDay: 1_000,
    eventsPerCall: 100,
    historyDays: 7,
    premiumEndpoints: false,
    websocket: false,
    priceUsdMonth: 0,
    slaUptimePct: null,
  },
  developer: {
    requestsPerDay: 50_000,
    eventsPerCall: 1_000,
    historyDays: 90,
    premiumEndpoints: false,
    websocket: true,
    priceUsdMonth: 99,
    slaUptimePct: 99.5,
  },
  partner: {
    requestsPerDay: 500_000,
    eventsPerCall: 5_000,
    historyDays: 365,
    premiumEndpoints: true,
    websocket: true,
    priceUsdMonth: 999,
    slaUptimePct: 99.9,
  },
  enterprise: {
    requestsPerDay: null,
    eventsPerCall: 10_000,
    historyDays: 1_825,
    premiumEndpoints: true,
    websocket: true,
    priceUsdMonth: 0, // Custom contract
    slaUptimePct: 99.95,
  },
};

// ── Partner programme ─────────────────────────────────────────────────────────

export interface PartnerProgramTier {
  id: string;
  name: string;
  /** Annual revenue commitment in USD — Зобов'язання за рік (USD) */
  annualCommitmentUsd: number;
  /** Benefits — Переваги */
  benefits: string[];
}

export const PARTNER_PROGRAM_TIERS: PartnerProgramTier[] = [
  {
    id: 'silver',
    name: 'Silver Partner',
    annualCommitmentUsd: 10_000,
    benefits: [
      'co-marketing',
      'partner-badge',
      'developer-api-access',
      'dedicated-slack-channel',
    ],
  },
  {
    id: 'gold',
    name: 'Gold Partner',
    annualCommitmentUsd: 50_000,
    benefits: [
      'all-silver-benefits',
      'partner-api-access',
      'joint-case-study',
      'early-access-features',
      'quarterly-roadmap-briefing',
    ],
  },
  {
    id: 'strategic',
    name: 'Strategic Partner',
    annualCommitmentUsd: 200_000,
    benefits: [
      'all-gold-benefits',
      'enterprise-api-access',
      'custom-integration-support',
      'advisory-board-seat',
      'revenue-share',
      'white-label-option',
    ],
  },
];

// ── Ecosystem config ──────────────────────────────────────────────────────────

export interface ApiEcosystemConfig {
  tiers: ApiEcosystemTier[];
  limits: Record<ApiEcosystemTier, ApiTierLimits>;
  partnerProgramTiers: PartnerProgramTier[];
  /** API docs URL — URL документації */
  apiDocsUrl: string;
  /** OpenAPI spec URL — URL специфікації OpenAPI */
  openApiSpecUrl: string;
  /** SDK languages — Мови SDK */
  sdkLanguages: string[];
}

export const API_ECOSYSTEM_CONFIG: ApiEcosystemConfig = {
  tiers: API_ECOSYSTEM_TIERS,
  limits: API_ECOSYSTEM_LIMITS,
  partnerProgramTiers: PARTNER_PROGRAM_TIERS,
  apiDocsUrl: 'https://docs.aegislens.com/api',
  openApiSpecUrl: 'https://api.aegislens.com/v1/openapi.json',
  sdkLanguages: ['typescript', 'python', 'go', 'java'],
};
