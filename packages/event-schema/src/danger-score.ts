/**
 * Danger Score computation.
 *
 * Range: 0–100, with labeled bands:
 *   Calm (0–19) | Elevated (20–39) | Active (40–59) | High (60–79) | Critical (80–100)
 *
 * Formula inputs:
 *   - severity (1–5):           weight 40%
 *   - confidence (0–1):         weight 30%
 *   - recency (time-decay):     weight 30%
 *
 * Additional multipliers (optional):
 *   - population in radius      up to ×1.5
 *   - infrastructure impact     up to ×1.25
 *   - time-of-day (night)       up to ×1.1
 *
 * Conservative bias: final score is always rounded up.
 */

import { DangerBand, getDangerBand } from "./v1";

export interface DangerScoreInputs {
  /** 1–5 */
  severity: number;
  /** 0–1 */
  confidence: number;
  /** ISO-8601 UTC when event occurred */
  occurredAt: string;
  /** Population within 10km radius (optional) */
  populationInRadius?: number;
  /** Does the event link to infrastructure damage? */
  hasInfrastructureImpact?: boolean;
  /** Local hour of day at event location (0–23) */
  localHour?: number;
}

export interface DangerScoreResult {
  score: number;        // 0–100, rounded up
  band: DangerBand;
  components: {
    severityComponent: number;   // 0–40
    confidenceComponent: number; // 0–30
    recencyComponent: number;    // 0–30
  };
  multiplier: number;  // ≥1.0
}

/** Time-decay half-life: events lose recency score over time. */
const RECENCY_HALF_LIFE_HOURS = 6;

export function computeDangerScore(inputs: DangerScoreInputs): DangerScoreResult {
  const { severity, confidence, occurredAt } = inputs;

  // Severity component (0–40)
  const severityComponent = (Math.min(5, Math.max(1, severity)) / 5) * 40;

  // Confidence component (0–30)
  const confidenceComponent = Math.min(1, Math.max(0, confidence)) * 30;

  // Recency component (0–30) — decays with half-life of 6 hours
  const ageHours = (Date.now() - new Date(occurredAt).getTime()) / 3_600_000;
  const recencyFactor = Math.max(0, Math.pow(0.5, ageHours / RECENCY_HALF_LIFE_HOURS));
  const recencyComponent = recencyFactor * 30;

  const base = severityComponent + confidenceComponent + recencyComponent;

  // Optional multipliers
  let multiplier = 1.0;

  if (inputs.populationInRadius !== undefined && inputs.populationInRadius > 0) {
    // Logarithmic scale: 10k → ×1.1, 100k → ×1.25, 1M → ×1.5
    const popFactor = Math.min(1.5, 1 + Math.log10(inputs.populationInRadius / 10_000) * 0.1);
    multiplier = Math.max(multiplier, popFactor);
  }

  if (inputs.hasInfrastructureImpact) {
    multiplier = Math.max(multiplier, 1.25);
  }

  if (inputs.localHour !== undefined) {
    // Night events (22–06) are harder to respond to
    const isNight = inputs.localHour >= 22 || inputs.localHour <= 6;
    if (isNight) multiplier = Math.max(multiplier, 1.1);
  }

  const score = Math.min(100, Math.ceil(base * multiplier));

  return {
    score,
    band: getDangerBand(score),
    components: {
      severityComponent: parseFloat(severityComponent.toFixed(1)),
      confidenceComponent: parseFloat(confidenceComponent.toFixed(1)),
      recencyComponent: parseFloat(recencyComponent.toFixed(1)),
    },
    multiplier: parseFloat(multiplier.toFixed(2)),
  };
}

/** Simplified danger score (legacy — used when only severity + confidence are known). */
export function computeSimpleDangerScore(severity: number, confidence: number): number {
  return Math.min(100, Math.ceil((severity / 5) * 40 + confidence * 30));
}
