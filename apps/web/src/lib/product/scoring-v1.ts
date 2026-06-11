/**
 * Scoring v1 — confidence score and danger score computation contracts.
 *
 * Confidence (0–1) measures how likely the event is real and accurately placed.
 * Danger (0–100) measures the severity / threat level for civilians and assets.
 *
 * Confidence (0–1): достовірність події.
 * Danger (0–100): рівень загрози для цивільних та об'єктів.
 */

'use server';

// ── Version ───────────────────────────────────────────────────────────────────

export const SCORING_VERSION = '1.0' as const;

// ── Score ranges ──────────────────────────────────────────────────────────────

export const CONFIDENCE_SCORE_RANGE = [0, 1] as const;
export const DANGER_SCORE_RANGE     = [0, 100] as const;

// ── Confidence factors ────────────────────────────────────────────────────────

/**
 * The five factors that contribute to the composite confidence score.
 *
 * П'ять факторів, що формують комплексний показник достовірності.
 */
export interface ConfidenceFactors {
  /** Number of independent sources corroborating the event (0–1 normalised) */
  sourceCorroboration: number;
  /** Source reliability score (historical accuracy) */
  sourceReliability: number;
  /** Geolocation precision (exact coord > region > country) */
  geoPrecision: number;
  /** Media verification outcome (0=no media, 0.5=unverified, 1=verified) */
  mediaVerification: number;
  /** Temporal consistency with surrounding events */
  temporalConsistency: number;
}

export const CONFIDENCE_FACTOR_WEIGHTS: ConfidenceFactors = {
  sourceCorroboration: 0.30,
  sourceReliability:   0.25,
  geoPrecision:        0.20,
  mediaVerification:   0.15,
  temporalConsistency: 0.10,
};

// ── Danger factors ────────────────────────────────────────────────────────────

/**
 * The six factors that drive the danger score.
 *
 * Шість факторів, що визначають оцінку небезпеки.
 */
export interface DangerFactors {
  /** Event class severity (airstrike > troop-movement) */
  eventClassSeverity: number;
  /** Proximity to civilian population centers (km, inversely scaled) */
  civilianProximityKm: number;
  /** Casualty count normalised to 0–1 */
  casualtyNormalized: number;
  /** Infrastructure criticality (power/water/hospital = high) */
  infrastructureCriticality: number;
  /** Escalation trend (part of broader offensive) */
  escalationTrend: number;
  /** Confidence score multiplier (low confidence dampens danger) */
  confidenceMultiplier: number;
}

export const DANGER_FACTOR_WEIGHTS: Record<keyof DangerFactors, number> = {
  eventClassSeverity:       0.30,
  civilianProximityKm:      0.20,
  casualtyNormalized:       0.20,
  infrastructureCriticality: 0.15,
  escalationTrend:          0.10,
  confidenceMultiplier:     0.05,
};

// ── Danger bands ──────────────────────────────────────────────────────────────

export type DangerBand = 'low' | 'moderate' | 'high' | 'critical';

export const DANGER_BANDS: Array<{ band: DangerBand; min: number; max: number }> = [
  { band: 'low',      min: 0,  max: 25  },
  { band: 'moderate', min: 25, max: 50  },
  { band: 'high',     min: 50, max: 75  },
  { band: 'critical', min: 75, max: 100 },
];

export function getDangerBand(score: number): DangerBand {
  for (const { band, min, max } of DANGER_BANDS) {
    if (score >= min && score < max) return band;
  }
  return 'critical';
}

// ── Notes ─────────────────────────────────────────────────────────────────────

export const ScoringNote_EN =
  'Scoring v1 uses static weights. v2 will apply ML-calibrated weights trained on ' +
  'analyst feedback. Both confidence and danger are stored on every event row.';

export const ScoringNote_UK =
  'Скоринг v1 використовує статичні ваги. v2 застосовуватиме ваги, ' +
  'відкалібровані на зворотному зв'язку аналітиків. ' +
  'Обидві оцінки зберігаються в кожному рядку події.';
