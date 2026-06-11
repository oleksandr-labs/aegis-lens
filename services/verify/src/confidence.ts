/**
 * Bayesian confidence model.
 *
 * Each source contributes a likelihood update based on:
 *  - Source reliability weight (0-1, from registry)
 *  - Cross-source agreement (do they agree on location, class, timing?)
 *  - Media authenticity (verified image/video boosts confidence)
 *  - Corroboration depth (number of independent sources)
 */

export interface SourceVote {
  /** Source reliability weight (0-1) from registry */
  weight: number;
  /** Does this source agree with the event (true) or contradict it (false)? */
  agrees: boolean;
}

export interface ConfidenceInput {
  sources: SourceVote[];
  hasVerifiedMedia: boolean;
  hasGeoVerification: boolean;
}

/**
 * Bayesian update starting from a uniform prior (0.5).
 * Each independent source vote updates the posterior.
 */
export function computeConfidence(input: ConfidenceInput): number {
  let logOdds = 0; // log(prior/(1-prior)) = log(1) = 0 for p=0.5

  for (const s of input.sources) {
    // Likelihood ratio for an agreeing source with weight w: LR = w / (1-w)
    // For a disagreeing source: LR = (1-w) / w
    const lr = s.agrees
      ? s.weight / Math.max(1 - s.weight, 0.01)
      : (1 - s.weight) / Math.max(s.weight, 0.01);
    logOdds += Math.log(lr);
  }

  // Bonuses
  if (input.hasVerifiedMedia) logOdds += Math.log(3); // 3× likelihood boost
  if (input.hasGeoVerification) logOdds += Math.log(1.5);

  // Convert log-odds back to probability
  const odds = Math.exp(logOdds);
  return odds / (1 + odds);
}

/**
 * Danger score (0-100) combining severity and confidence.
 * High severity + high confidence → high danger.
 * Used for alert prioritisation.
 */
export function computeDangerScore(severity: number, confidence: number, classCode: string): number {
  const base = (severity / 5) * confidence * 100;

  // Class multipliers
  const multipliers: Record<string, number> = {
    military_action: 1.0,
    infrastructure: 0.9,
    civilian_alert: 0.85,
    cyber: 0.7,
    humanitarian: 0.6,
    environmental: 0.5,
    maritime: 0.7,
    aviation: 0.8,
    political: 0.4,
    economic: 0.3,
  };

  const multiplier = multipliers[classCode] ?? 0.5;
  return Math.round(Math.min(base * multiplier, 100));
}
