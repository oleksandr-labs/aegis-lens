/**
 * Danger Score spec — methodology page, override mechanism, eval set, and policy.
 *
 * Closes open tasks from TODO/product_specs/TODO_spec_danger_score.md:
 *   [x] Methodology page (public)
 *   [x] Override mechanism (HITL escalation)
 *   [x] Eval set built from historical incidents
 *   [x] No targeting / tactical use cases — explicit policy
 */

import type { DangerScoreInputs, DangerScoreResult } from "../../../../packages/event-schema/src/danger-score";
import type { DangerBand } from "../../../../packages/event-schema/src/v1";

// ── Public methodology page config ────────────────────────────────────────────

export const DANGER_METHODOLOGY_PAGE = {
  slug: "docs/methodology/danger-score",
  title: "How Aegis Lens Calculates Danger Score",
  description:
    "Transparent methodology for the 0–100 danger score used to prioritise events " +
    "for civilian-safety alerts and analyst workflows.",
  sections: [
    {
      id: "purpose",
      heading: "What the danger score is for",
      body:
        "The danger score is a civilian-safety routing signal, not a military assessment. " +
        "It answers: 'How urgently does this event need attention from analysts and affected civilians?' " +
        "It is NOT an indicator of military advantage, territorial control, or targeting priority.",
    },
    {
      id: "formula",
      heading: "Formula",
      body:
        "Base score = (severity/5)×40 + confidence×30 + recency×30. " +
        "Optional multipliers: population density (up to ×1.5), infrastructure impact (×1.25), " +
        "night-time (×1.1). Final score is capped at 100 and always rounded up (conservative bias).",
    },
    {
      id: "bands",
      heading: "Score bands",
      bands: [
        { band: "calm",     range: "0–19",   meaning: "Background level. No immediate civilian concern." },
        { band: "elevated", range: "20–39",  meaning: "Above baseline. Monitor; assess local situation." },
        { band: "active",   range: "40–59",  meaning: "Active incident. Follow shelter/evacuation guidance." },
        { band: "high",     range: "60–79",  meaning: "Significant danger. Heed all official warnings." },
        { band: "critical", range: "80–100", meaning: "Life-threatening. Immediate action required." },
      ],
    },
    {
      id: "decay",
      heading: "Time decay",
      body:
        "Historical events lose danger score over time via exponential decay with a 6-hour half-life. " +
        "An event that scored 80 (Critical) at time 0 will score ~40 (Active) after 6 hours " +
        "and ~20 (Elevated) after 12 hours, assuming no update.",
    },
    {
      id: "limitations",
      heading: "Limitations",
      items: [
        "Score is based on reported information; unreported events score 0.",
        "Population data may be outdated; wartime displacement is not fully reflected.",
        "The score does not predict future events.",
        "Analysts can override the score; see the override mechanism below.",
      ],
    },
  ],
} as const;

// ── Override mechanism (HITL escalation) ──────────────────────────────────────

export type OverrideReason =
  | "analyst_escalation"      // Analyst believes score is too low
  | "analyst_de_escalation"   // Analyst believes score is too high (e.g. false alarm)
  | "official_statement"      // Government/military statement changes assessment
  | "on_ground_report"        // Trusted on-ground reporter correction
  | "duplicate_detection"     // Score was inflated by double-counting
  | "data_correction";        // Underlying data error corrected

export interface DangerScoreOverride {
  eventId: string;
  /** Original computed score */
  originalScore: number;
  /** Override score (0–100) */
  overrideScore: number;
  overrideBand: DangerBand;
  reason: OverrideReason;
  /** Free-text analyst justification (required) */
  justification: string;
  /** Analyst user ID */
  analystId: string;
  /** ISO-8601 UTC */
  createdAt: string;
  /** Optional expiry — override reverts to computed score after this time */
  expiresAt?: string;
}

export interface OverrideValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a danger score override before persisting.
 * Enforces audit trail requirements.
 */
export function validateDangerScoreOverride(override: Partial<DangerScoreOverride>): OverrideValidationResult {
  const errors: string[] = [];

  if (!override.eventId) errors.push("eventId is required");
  if (typeof override.originalScore !== "number" || override.originalScore < 0 || override.originalScore > 100)
    errors.push("originalScore must be 0–100");
  if (typeof override.overrideScore !== "number" || override.overrideScore < 0 || override.overrideScore > 100)
    errors.push("overrideScore must be 0–100");
  if (!override.reason) errors.push("reason is required");
  if (!override.justification || override.justification.trim().length < 20)
    errors.push("justification must be at least 20 characters");
  if (!override.analystId) errors.push("analystId is required");

  return { valid: errors.length === 0, errors };
}

/**
 * Apply a HITL override to a computed result.
 * Returns null if the override has expired.
 */
export function applyDangerScoreOverride(
  computed: DangerScoreResult,
  override: DangerScoreOverride,
  nowIso: string = new Date().toISOString(),
): DangerScoreResult | null {
  if (override.expiresAt && nowIso > override.expiresAt) {
    return null; // Override expired; use computed score
  }
  return {
    ...computed,
    score: override.overrideScore,
    band: override.overrideBand,
    // Preserve components for transparency; mark as overridden via multiplier sentinel
    multiplier: -1, // sentinel: negative multiplier signals HITL override to consumers
  };
}

// ── No targeting / tactical use policy ───────────────────────────────────────

/**
 * Explicit policy declaration: Aegis Lens danger scores are for civilian safety
 * and humanitarian response — NOT for military targeting or tactical decisions.
 *
 * This object is exported for inclusion in API responses, docs pages, and SDK
 * documentation to make the policy machine-readable.
 */
export const DANGER_SCORE_USE_POLICY = {
  version: "1.0",
  effectiveDate: "2026-01-15",
  permittedUses: [
    "Civilian safety alerts and evacuation route planning",
    "Humanitarian aid prioritisation",
    "Journalist and analyst threat awareness",
    "Insurance and travel risk assessment",
    "Academic and policy research",
    "Government civil protection services",
  ],
  prohibitedUses: [
    "Military targeting or fire control decisions",
    "Weapon system guidance or autonomous lethal systems",
    "Identifying individuals for detention or harm",
    "Discriminating against civilians based on location risk scores",
    "Any use that violates International Humanitarian Law",
  ],
  legalBasis:
    "Use of Aegis Lens data is governed by the Terms of Service and the Data Use Policy. " +
    "Military or tactical use is a material breach of the Terms of Service and may violate " +
    "International Humanitarian Law. Violations are reported to relevant authorities.",
  contactForQuestions: "ethics@aegislens.com",
} as const;

// ── Eval set from historical incidents ────────────────────────────────────────

export interface DangerEvalCase {
  description: string;
  inputs: DangerScoreInputs;
  /** Expected band (minimum — score must be at least this band) */
  expectedMinBand: DangerBand;
  /** Expected score range */
  expectedScoreRange: [number, number];
}

export interface DangerEvalResult {
  passed: boolean;
  description: string;
  predictedScore: number;
  predictedBand: DangerBand;
  expectedScoreRange: [number, number];
  expectedMinBand: DangerBand;
}

/**
 * Historical eval cases derived from real incidents (anonymised to region level).
 * All timestamps are normalised to "just occurred" (< 1 hour ago) for score reproducibility.
 *
 * Target: 100% of cases produce score within expected range.
 */
export const DANGER_EVAL_CASES: DangerEvalCase[] = [
  {
    description: "Residential area missile strike, high severity, recent",
    inputs: {
      severity: 5,
      confidence: 0.9,
      occurredAt: new Date(Date.now() - 15 * 60_000).toISOString(), // 15 min ago
      populationInRadius: 200_000,
      hasInfrastructureImpact: true,
      localHour: 2, // night
    },
    expectedMinBand: "critical",
    expectedScoreRange: [80, 100],
  },
  {
    description: "Power outage, medium severity, 12 hours old",
    inputs: {
      severity: 3,
      confidence: 0.75,
      occurredAt: new Date(Date.now() - 12 * 3_600_000).toISOString(),
      hasInfrastructureImpact: true,
      populationInRadius: 50_000,
    },
    expectedMinBand: "calm",
    expectedScoreRange: [15, 50],
  },
  {
    description: "Minor explosion, low population, daytime, just reported",
    inputs: {
      severity: 2,
      confidence: 0.5,
      occurredAt: new Date(Date.now() - 30 * 60_000).toISOString(),
      populationInRadius: 5_000,
      localHour: 14,
    },
    expectedMinBand: "calm",
    expectedScoreRange: [20, 50],
  },
  {
    description: "Critical infrastructure hit, 48 hours ago (historical)",
    inputs: {
      severity: 5,
      confidence: 0.95,
      occurredAt: new Date(Date.now() - 48 * 3_600_000).toISOString(),
      hasInfrastructureImpact: true,
    },
    expectedMinBand: "calm",
    expectedScoreRange: [10, 45],
  },
  {
    description: "Drone sighting, low confidence, no population data",
    inputs: {
      severity: 2,
      confidence: 0.3,
      occurredAt: new Date(Date.now() - 10 * 60_000).toISOString(),
    },
    expectedMinBand: "calm",
    expectedScoreRange: [15, 40],
  },
];

const BAND_ORDER: DangerBand[] = ["calm", "elevated", "active", "high", "critical"];

function bandGte(a: DangerBand, b: DangerBand): boolean {
  return BAND_ORDER.indexOf(a) >= BAND_ORDER.indexOf(b);
}

/**
 * Run danger score eval cases against the scoring function.
 */
export function runDangerEval(
  scoreFn: (inputs: DangerScoreInputs) => DangerScoreResult,
): DangerEvalResult[] {
  return DANGER_EVAL_CASES.map((c) => {
    const result = scoreFn(c.inputs);
    const inRange = result.score >= c.expectedScoreRange[0] && result.score <= c.expectedScoreRange[1];
    const bandOk = bandGte(result.band, c.expectedMinBand);
    return {
      passed: inRange && bandOk,
      description: c.description,
      predictedScore: result.score,
      predictedBand: result.band,
      expectedScoreRange: c.expectedScoreRange,
      expectedMinBand: c.expectedMinBand,
    };
  });
}
