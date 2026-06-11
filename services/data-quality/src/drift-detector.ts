/**
 * Distribution drift detector: compare current field distributions
 * against a baseline snapshot using chi-squared statistic.
 *
 * Also detects "source went silent" vs expected cadence.
 */

import type { DistributionSnapshot, SLOViolation } from "./types";

/** Chi-squared statistic for goodness-of-fit */
function chiSquared(
  observed: Record<string, number>,
  expected: Record<string, number>,
): number {
  const totalObs = Object.values(observed).reduce((s, v) => s + v, 0);
  const totalExp = Object.values(expected).reduce((s, v) => s + v, 0);
  if (totalObs === 0 || totalExp === 0) return 0;

  const allKeys = new Set([...Object.keys(observed), ...Object.keys(expected)]);
  let chi2 = 0;

  for (const key of allKeys) {
    const obs = ((observed[key] ?? 0) / totalObs) * totalObs;
    const exp = ((expected[key] ?? 0) / totalExp) * totalObs;
    if (exp > 0) {
      chi2 += Math.pow(obs - exp, 2) / exp;
    }
  }

  return chi2;
}

/** Critical chi-squared value at p=0.05 for df=10 (approximate) */
const CHI2_THRESHOLD = 18.31;

export function detectDistributionDrift(
  current: DistributionSnapshot,
  baseline: DistributionSnapshot,
): SLOViolation | null {
  const chi2 = chiSquared(current.distribution, baseline.distribution);

  if (chi2 > CHI2_THRESHOLD * 2) {
    return {
      sourceId: current.sourceId,
      kind: "distribution_drift",
      severity: "critical",
      message: `Field "${current.field}" distribution shifted significantly (χ²=${chi2.toFixed(1)})`,
      measuredValue: chi2,
      threshold: CHI2_THRESHOLD,
      detectedAt: current.capturedAt,
    };
  }

  if (chi2 > CHI2_THRESHOLD) {
    return {
      sourceId: current.sourceId,
      kind: "distribution_drift",
      severity: "warning",
      message: `Field "${current.field}" distribution drift detected (χ²=${chi2.toFixed(1)})`,
      measuredValue: chi2,
      threshold: CHI2_THRESHOLD,
      detectedAt: current.capturedAt,
    };
  }

  return null;
}

/**
 * Detect if a source has gone unexpectedly silent.
 * Returns true when the source's cadence was regular but has now stopped.
 */
export function detectSilence(
  recentIntervalMinutes: number[],
  currentGapMinutes: number,
): { isSilent: boolean; expectedIntervalMinutes: number } {
  if (recentIntervalMinutes.length < 3) {
    return { isSilent: false, expectedIntervalMinutes: 0 };
  }

  const sorted = [...recentIntervalMinutes].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const mad = sorted
    .map((v) => Math.abs(v - median))
    .sort((a, b) => a - b)[Math.floor(sorted.length / 2)];

  // If current gap is more than median + 5 * MAD, source went silent
  const silenceThreshold = median + 5 * mad;
  return {
    isSilent: currentGapMinutes > silenceThreshold,
    expectedIntervalMinutes: median,
  };
}
