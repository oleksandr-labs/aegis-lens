/**
 * Trend forecasting — DIRECTIONAL only.
 *
 * Per the TODO and the anti-alarm-fatigue UX rule, we deliberately do NOT emit
 * point predictions ("47 strikes tomorrow") to the UI. We emit a direction and a
 * qualitative magnitude (rising / stable / falling, and how steeply) with an
 * explicit uncertainty caveat. That is the honest, defensible output for an
 * adversarial, bursty conflict signal.
 *
 * Method: a lightweight Holt linear (double-exponential) smoothing over a recent
 * count series. Holt tracks level + trend; we report the SIGN and relative size
 * of the trend term, not the extrapolated value. Robust, dependency-free, and
 * upgradeable to Prophet/temporal-transformer behind the same interface.
 */

export type TrendDirection = "rising" | "stable" | "falling";
export type TrendStrength = "weak" | "moderate" | "strong";

export interface TrendForecast {
  direction: TrendDirection;
  strength: TrendStrength;
  /** Smoothed level (current baseline estimate). */
  level: number;
  /** Trend term (per-step change); sign drives `direction`. NOT a UI number. */
  trendPerStep: number;
  /**
   * Trend relative to level (|trend|/level). Drives `strength`. Unitless.
   */
  relativeTrend: number;
  /** Number of points used. Below `minPoints` → direction forced to "stable". */
  pointsUsed: number;
  /** Always-on honesty caveat for the UI. */
  caveatEn: string;
  caveatUk: string;
}

export interface HoltConfig {
  /** Level smoothing 0<α<1. */
  alpha?: number;
  /** Trend smoothing 0<β<1. */
  beta?: number;
  /** Min points before a non-stable direction is reported. */
  minPoints?: number;
  /** |relativeTrend| below this → "stable" (deadband, avoids alarm fatigue). */
  stableBand?: number;
  /** Thresholds on |relativeTrend| for moderate/strong strength. */
  moderateBand?: number;
  strongBand?: number;
}

const H_DEFAULTS: Required<HoltConfig> = {
  alpha: 0.4,
  beta: 0.2,
  minPoints: 6,
  stableBand: 0.05,
  moderateBand: 0.15,
  strongBand: 0.35,
};

const CAVEAT_EN =
  "Directional estimate only — indicates trend direction, not a predicted count. Conflict signals are bursty and can reverse abruptly.";
const CAVEAT_UK =
  "Лише оцінка напрямку — показує напрям тренду, а не прогнозовану кількість. Сигнали конфлікту є стрибкоподібними й можуть різко змінюватися.";

/**
 * Forecast the trend DIRECTION of a count series (oldest → newest).
 */
export function forecastTrend(series: number[], config: HoltConfig = {}): TrendForecast {
  const opts = { ...H_DEFAULTS, ...config };

  if (series.length < 2) {
    return {
      direction: "stable",
      strength: "weak",
      level: series[0] ?? 0,
      trendPerStep: 0,
      relativeTrend: 0,
      pointsUsed: series.length,
      caveatEn: CAVEAT_EN,
      caveatUk: CAVEAT_UK,
    };
  }

  // Holt linear smoothing.
  let level = series[0];
  let trend = series[1] - series[0];
  for (let i = 1; i < series.length; i++) {
    const prevLevel = level;
    level = opts.alpha * series[i] + (1 - opts.alpha) * (level + trend);
    trend = opts.beta * (level - prevLevel) + (1 - opts.beta) * trend;
  }

  const denom = Math.max(1, Math.abs(level));
  const relativeTrend = Math.abs(trend) / denom;

  let direction: TrendDirection = "stable";
  if (series.length >= opts.minPoints && relativeTrend >= opts.stableBand) {
    direction = trend > 0 ? "rising" : "falling";
  }

  let strength: TrendStrength = "weak";
  if (relativeTrend >= opts.strongBand) strength = "strong";
  else if (relativeTrend >= opts.moderateBand) strength = "moderate";

  return {
    direction,
    strength,
    level: parseFloat(level.toFixed(2)),
    trendPerStep: parseFloat(trend.toFixed(3)),
    relativeTrend: parseFloat(relativeTrend.toFixed(3)),
    pointsUsed: series.length,
    caveatEn: CAVEAT_EN,
    caveatUk: CAVEAT_UK,
  };
}
