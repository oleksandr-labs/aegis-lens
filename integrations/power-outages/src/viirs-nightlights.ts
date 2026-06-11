/**
 * VIIRS night-lights anomaly detection.
 *
 * The Suomi-NPP / NOAA-20 VIIRS Day/Night Band (DNB) measures upwelling night
 * radiance. NASA's Black Marble (VNP46A) products give nightly nadir-normalised
 * radiance per grid cell. A sustained drop in radiance vs. a rolling baseline is
 * a strong proxy for loss of grid power in a region.
 *
 * Real pipeline (not obtainable here without the imagery archive):
 *   1. Aggregate DNB radiance per oblast nightly (cloud-masked).
 *   2. Maintain a trailing baseline (e.g. median of prior N clear nights).
 *   3. Flag cells where radiance dropped > threshold below baseline.
 *
 * This module ships the codeable contract: a typed radiance sample, a baseline
 * model, and a deterministic z-score / fractional-drop anomaly detector that
 * emits OutageSignals — mirroring the heuristic style of missiles/classifier.ts.
 */

import type { OutageSignal } from "./types";

/** Nightly aggregated VIIRS DNB radiance for one region. */
export interface RadianceSample {
  regionCode: string;
  /** Observation date (YYYY-MM-DD, local night). */
  date: string;
  /** Cloud-masked mean radiance, nW·cm⁻²·sr⁻¹. */
  radiance: number;
  /** Fraction of region with usable (cloud-free) pixels, 0–1. */
  cloudFreeFraction: number;
}

/** Per-region radiance baseline derived from recent clear nights. */
export interface RadianceBaseline {
  regionCode: string;
  /** Median radiance over the baseline window. */
  median: number;
  /** Median absolute deviation (robust spread). */
  mad: number;
  /** Number of nights contributing to the baseline. */
  nights: number;
}

export interface NightlightsConfig {
  /** Min cloud-free fraction for a sample to be trusted (default 0.5). */
  minCloudFreeFraction: number;
  /** Fractional drop vs. baseline median to flag an anomaly (default 0.35 = 35%). */
  dropThreshold: number;
  /** Robust z-score magnitude (drops only) to flag (default 3). */
  zThreshold: number;
  /** Baseline window length in nights (default 14). */
  baselineNights: number;
}

export const DEFAULT_NIGHTLIGHTS_CONFIG: NightlightsConfig = {
  minCloudFreeFraction: 0.5,
  dropThreshold: 0.35,
  zThreshold: 3,
  baselineNights: 14,
};

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Build a robust baseline (median + MAD) from a region's recent clear-night
 * radiance history. Only cloud-free-enough samples contribute.
 */
export function buildBaseline(
  regionCode: string,
  history: RadianceSample[],
  config: NightlightsConfig = DEFAULT_NIGHTLIGHTS_CONFIG,
): RadianceBaseline {
  const clear = history
    .filter((s) => s.regionCode === regionCode && s.cloudFreeFraction >= config.minCloudFreeFraction)
    .slice(-config.baselineNights);
  const radiances = clear.map((s) => s.radiance);
  const med = median(radiances);
  const mad = median(radiances.map((r) => Math.abs(r - med)));
  return { regionCode, median: med, mad, nights: radiances.length };
}

export interface NightlightsAnomaly {
  regionCode: string;
  date: string;
  baselineMedian: number;
  observedRadiance: number;
  /** Fractional drop vs. baseline, 0–1 (clamped). */
  dropFraction: number;
  /** Robust z-score (negative = darker than baseline). */
  zScore: number;
  /** Detector confidence 0–1. */
  confidence: number;
}

/**
 * Detect a darkness anomaly for a single observation against a baseline.
 * Returns null if the sample is too cloudy, the baseline is too thin, or the
 * drop is below threshold.
 */
export function detectAnomaly(
  sample: RadianceSample,
  baseline: RadianceBaseline,
  config: NightlightsConfig = DEFAULT_NIGHTLIGHTS_CONFIG,
): NightlightsAnomaly | null {
  if (sample.cloudFreeFraction < config.minCloudFreeFraction) return null;
  if (baseline.nights < 3 || baseline.median <= 0) return null;

  const dropFraction = Math.max(0, Math.min(1, (baseline.median - sample.radiance) / baseline.median));
  // Robust z-score using MAD (scaled to ~std via 1.4826). Guard tiny MAD.
  const scale = baseline.mad > 0 ? baseline.mad * 1.4826 : baseline.median * 0.1 || 1;
  const zScore = (sample.radiance - baseline.median) / scale;

  const dropTriggered = dropFraction >= config.dropThreshold;
  const zTriggered = zScore <= -config.zThreshold;
  if (!dropTriggered && !zTriggered) return null;

  // Confidence blends drop magnitude, z-magnitude and cloud-free coverage.
  const dropConf = Math.min(1, dropFraction / 0.8);
  const zConf = Math.min(1, Math.abs(zScore) / 6);
  const confidence = parseFloat(
    Math.min(1, (0.6 * dropConf + 0.4 * zConf) * sample.cloudFreeFraction + 0.1).toFixed(2),
  );

  return {
    regionCode: sample.regionCode,
    date: sample.date,
    baselineMedian: parseFloat(baseline.median.toFixed(2)),
    observedRadiance: parseFloat(sample.radiance.toFixed(2)),
    dropFraction: parseFloat(dropFraction.toFixed(2)),
    zScore: parseFloat(zScore.toFixed(2)),
    confidence,
  };
}

/**
 * End-to-end: given the latest samples + full history, emit OutageSignals for
 * regions whose night radiance dropped anomalously below baseline.
 */
export function detectNightlightOutages(
  latest: RadianceSample[],
  history: RadianceSample[],
  config: NightlightsConfig = DEFAULT_NIGHTLIGHTS_CONFIG,
): OutageSignal[] {
  const signals: OutageSignal[] = [];
  for (const sample of latest) {
    const baseline = buildBaseline(sample.regionCode, history, config);
    const anomaly = detectAnomaly(sample, baseline, config);
    if (!anomaly) continue;
    signals.push({
      source: "viirs_nightlights",
      regionCode: anomaly.regionCode,
      confidence: anomaly.confidence,
      detectedAt: new Date(`${anomaly.date}T00:00:00Z`).toISOString(),
      cause: "unknown", // night-lights show that lights are off, not why
      estimatedCoverage: anomaly.dropFraction,
      rawData: {
        feed: "viirs_nightlights",
        baselineMedian: anomaly.baselineMedian,
        observedRadiance: anomaly.observedRadiance,
        zScore: anomaly.zScore,
      },
    });
  }
  return signals;
}
