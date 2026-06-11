/**
 * Confidence Score computation — Bayesian aggregation across sources.
 *
 * A calibrated 0–1 score reflecting how certain we are that an event
 * is real, correctly located, and correctly described.
 *
 * Inputs:
 *   1. Source reputation (per-source reliability 0–1)
 *   2. Source count (more independent sources → higher confidence)
 *   3. Source independence (correlated sources penalized)
 *   4. Media verification (image/video provided and verified)
 *   5. Geolocation precision (lat/lon vs city-level vs country-level)
 *   6. Content checks (placeholder penalties: low-quality text, copy-paste)
 *
 * The formula uses a log-odds update (naive Bayes approximation):
 *   log-odds_posterior = prior_log_odds + Σ(log-odds_evidence_i)
 */

export type GeolocPrecision = "exact" | "city" | "region" | "country" | "unknown";

export interface SourceEvidence {
  /** Source reliability from source registry (0–1). */
  sourceReliability: number;
  /** Does this source have a history of independence from other cited sources? */
  isIndependent: boolean;
  /** Did this source include original media (image/video)? */
  hasOriginalMedia: boolean;
  /** Was media verified (reverse-image passed, exif consistent)? */
  mediaVerified?: boolean;
}

export interface ConfidenceInputs {
  sources: SourceEvidence[];
  geolocPrecision: GeolocPrecision;
  /** Whether the text passes basic quality checks */
  textQualityOk: boolean;
  /** Prior confidence before sources (default 0.3 — "possible but unverified") */
  prior?: number;
}

export interface ConfidenceResult {
  confidence: number; // 0–1, rounded to 2dp
  /** Breakdown of contributions */
  components: {
    sourcesLogOdds: number;
    geolocBonus: number;
    mediaBonus: number;
    qualityPenalty: number;
  };
  /** Human-readable explanation */
  explanation: string;
}

function logOdds(p: number): number {
  const clipped = Math.min(0.999, Math.max(0.001, p));
  return Math.log(clipped / (1 - clipped));
}

function fromLogOdds(lo: number): number {
  return 1 / (1 + Math.exp(-lo));
}

const GEOLOC_BONUS: Record<GeolocPrecision, number> = {
  exact:   0.3,
  city:    0.15,
  region:  0.05,
  country: 0,
  unknown: -0.1,
};

export function computeConfidenceScore(inputs: ConfidenceInputs): ConfidenceResult {
  const prior = inputs.prior ?? 0.3;
  let lo = logOdds(prior);

  // Source evidence accumulation
  let sourcesLogOdds = 0;
  for (const src of inputs.sources) {
    const reputationLo = logOdds(src.sourceReliability);
    // Independent sources add full log-odds; correlated sources add 50%
    const weight = src.isIndependent ? 1.0 : 0.5;
    const contribution = reputationLo * weight;
    lo += contribution;
    sourcesLogOdds += contribution;
  }

  // Geolocation precision bonus
  const geolocBonus = GEOLOC_BONUS[inputs.geolocPrecision];
  lo += geolocBonus;

  // Media verification bonus
  const mediaWithOriginal = inputs.sources.filter((s) => s.hasOriginalMedia);
  const mediaVerified = inputs.sources.filter((s) => s.mediaVerified);
  const mediaBonus =
    mediaVerified.length > 0 ? 0.5 :
    mediaWithOriginal.length > 0 ? 0.2 :
    0;
  lo += mediaBonus;

  // Text quality penalty
  const qualityPenalty = inputs.textQualityOk ? 0 : -0.3;
  lo += qualityPenalty;

  const confidence = parseFloat(Math.min(0.99, Math.max(0.01, fromLogOdds(lo))).toFixed(2));

  const parts: string[] = [];
  if (inputs.sources.length > 0) parts.push(`${inputs.sources.length} source(s)`);
  if (mediaVerified.length > 0) parts.push("media verified");
  parts.push(`location: ${inputs.geolocPrecision}`);
  if (!inputs.textQualityOk) parts.push("quality warning");

  return {
    confidence,
    components: {
      sourcesLogOdds: parseFloat(sourcesLogOdds.toFixed(3)),
      geolocBonus: parseFloat(geolocBonus.toFixed(3)),
      mediaBonus: parseFloat(mediaBonus.toFixed(3)),
      qualityPenalty: parseFloat(qualityPenalty.toFixed(3)),
    },
    explanation: parts.join(", "),
  };
}

/** Quick confidence estimate from source count + average reliability. */
export function quickConfidence(sourceCount: number, avgReliability: number): number {
  const sources: SourceEvidence[] = Array.from({ length: sourceCount }, () => ({
    sourceReliability: avgReliability,
    isIndependent: true,
    hasOriginalMedia: false,
  }));
  return computeConfidenceScore({ sources, geolocPrecision: "city", textQualityOk: true }).confidence;
}
