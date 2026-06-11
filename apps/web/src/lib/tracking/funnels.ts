/**
 * Funnel definitions for persona-, locale-, and acquisition-channel-based analysis.
 *
 * Client-safe — no server-only import.
 */

import type {
  AcquisitionChannel,
  FunnelStage,
  LocaleTag,
  PersonaTag,
} from "./types";

// ── Core types ────────────────────────────────────────────────────────────

export interface FunnelDefinition {
  id: string;
  stages: FunnelStage[];
  filters: {
    persona?: PersonaTag[];
    locale?: LocaleTag[];
    channel?: AcquisitionChannel[];
  };
}

// ── Shared stage sequences ────────────────────────────────────────────────

const FULL_FUNNEL: FunnelStage[] = [
  "awareness",
  "consideration",
  "activation",
  "conversion",
  "expansion",
];

const ACQ_FUNNEL: FunnelStage[] = [
  "awareness",
  "consideration",
  "activation",
  "conversion",
];

// ── Persona funnels ───────────────────────────────────────────────────────

export const PERSONA_FUNNELS: FunnelDefinition[] = [
  {
    id: "persona_journalist",
    stages: FULL_FUNNEL,
    filters: { persona: ["journalist"] },
  },
  {
    id: "persona_researcher",
    stages: FULL_FUNNEL,
    filters: { persona: ["researcher"] },
  },
  {
    id: "persona_ngo",
    stages: FULL_FUNNEL,
    filters: { persona: ["ngo"] },
  },
  {
    id: "persona_government",
    stages: FULL_FUNNEL,
    filters: { persona: ["government"] },
  },
  {
    id: "persona_military",
    stages: ["awareness", "activation", "conversion", "expansion"],
    filters: { persona: ["military"] },
  },
  {
    id: "persona_investor",
    stages: ["awareness", "consideration", "conversion", "expansion"],
    filters: { persona: ["investor"] },
  },
  {
    id: "persona_developer",
    stages: ["awareness", "consideration", "activation", "conversion", "expansion"],
    filters: { persona: ["developer"] },
  },
  {
    id: "persona_general",
    stages: FULL_FUNNEL,
    filters: { persona: ["general"] },
  },
];

// ── Locale funnels ────────────────────────────────────────────────────────

export const LOCALE_FUNNELS: FunnelDefinition[] = [
  {
    id: "locale_en",
    stages: FULL_FUNNEL,
    filters: { locale: ["en"] },
  },
  {
    id: "locale_uk",
    stages: FULL_FUNNEL,
    filters: { locale: ["uk"] },
  },
  {
    id: "locale_pl",
    stages: FULL_FUNNEL,
    filters: { locale: ["pl"] },
  },
  {
    id: "locale_de",
    stages: FULL_FUNNEL,
    filters: { locale: ["de"] },
  },
  {
    id: "locale_ro",
    stages: FULL_FUNNEL,
    filters: { locale: ["ro"] },
  },
  {
    id: "locale_fr",
    stages: FULL_FUNNEL,
    filters: { locale: ["fr"] },
  },
  {
    id: "locale_es",
    stages: FULL_FUNNEL,
    filters: { locale: ["es"] },
  },
];

// ── Acquisition channel funnels ───────────────────────────────────────────

export const CHANNEL_FUNNELS: FunnelDefinition[] = [
  {
    id: "channel_organic",
    stages: FULL_FUNNEL,
    filters: { channel: ["organic"] },
  },
  {
    id: "channel_embed_referral",
    stages: ACQ_FUNNEL,
    filters: { channel: ["embed_referral"] },
  },
  {
    id: "channel_press",
    stages: ACQ_FUNNEL,
    filters: { channel: ["press"] },
  },
  {
    id: "channel_direct",
    stages: FULL_FUNNEL,
    filters: { channel: ["direct"] },
  },
  {
    id: "channel_paid",
    stages: ACQ_FUNNEL,
    filters: { channel: ["paid"] },
  },
];

// ── Business conversion funnels ───────────────────────────────────────────

/** Visit → signup → first map interaction */
export const VISIT_TO_ACTIVATE: FunnelDefinition = { id: "visit_to_activate", stages: ["awareness", "consideration", "activation"], filters: {} };

/** First interaction → filter → save → alert */
export const ACTIVATE_TO_ENGAGED: FunnelDefinition = { id: "activate_to_engaged", stages: ["activation", "conversion"], filters: {} };

/** Free → Pro per persona */
export const FREE_TO_PRO_FUNNELS: FunnelDefinition[] = [
  { id: "free_to_pro_journalist", stages: ["activation", "conversion"], filters: { persona: ["journalist"] } },
  { id: "free_to_pro_researcher", stages: ["activation", "conversion"], filters: { persona: ["researcher"] } },
  { id: "free_to_pro_ngo", stages: ["activation", "conversion"], filters: { persona: ["ngo"] } },
  { id: "free_to_pro_government", stages: ["activation", "conversion"], filters: { persona: ["government"] } },
  { id: "free_to_pro_general", stages: ["activation", "conversion"], filters: { persona: ["general"] } },
];

/** Pro → Team upgrade on usage signal */
export const PRO_TO_TEAM: FunnelDefinition = { id: "pro_to_team", stages: ["conversion", "expansion"], filters: {} };

/** Trial → paid per cohort */
export const TRIAL_TO_PAID: FunnelDefinition = { id: "trial_to_paid", stages: ["consideration", "conversion"], filters: {} };

/** Self-serve → enterprise expansion */
export const SELFSERVE_TO_ENTERPRISE: FunnelDefinition = { id: "selfserve_to_enterprise", stages: ["conversion", "expansion"], filters: {} };

/** Embed install → referrer traffic */
export const EMBED_TO_REFERRER: FunnelDefinition = { id: "embed_to_referrer", stages: ["awareness", "activation"], filters: {} };

/** API key created → first call → paid usage */
export const API_ACTIVATION: FunnelDefinition = { id: "api_activation", stages: ["activation", "conversion", "expansion"], filters: {} };

/** All business conversion funnels in one array */
export const CONVERSION_FUNNELS: FunnelDefinition[] = [
  VISIT_TO_ACTIVATE,
  ACTIVATE_TO_ENGAGED,
  ...FREE_TO_PRO_FUNNELS,
  PRO_TO_TEAM,
  TRIAL_TO_PAID,
  SELFSERVE_TO_ENTERPRISE,
  EMBED_TO_REFERRER,
  API_ACTIVATION,
];

/** Weekly funnel review cadence (ops) */
export const FUNNEL_OPS = {
  weeklyReview: true,
  perStepRegressionAlert: true,
  perFunnelExperimentationCandidate: true,
  segmentByPersonaLocaleAcquisition: true,
} as const;
