/**
 * Forecasted-outage model (clearly labeled prediction).
 *
 * Produces SHORT-HORIZON forecasts of likely power outages from two signals:
 *   1. Published Ukrenergo-style rotation schedules (deterministic, high-trust).
 *   2. A heuristic recurrence model over recent OutageEvents (a region that has
 *      been repeatedly emergency-shedding is likely to continue).
 *
 * EVERY forecast item carries `isPrediction: true` plus an en/uk disclaimer so
 * the UI can render it distinctly (dashed/hatched, "AI prediction — not an
 * observation"), consistent with the layer registry's is_prediction convention.
 *
 * This is a transparent heuristic baseline (the codeable contract), NOT a
 * trained ML forecaster — mirroring missiles/classifier.ts.
 */

import type { OutageEvent, OutageCause } from "./types";

/** Bilingual disclaimer that MUST accompany every forecast item. */
export const FORECAST_DISCLAIMER: { en: string; uk: string } = {
  en: "Prediction — not an observation. Forecasted outage likelihood from schedules and recent patterns; actual supply may differ.",
  uk: "Прогноз — не спостереження. Ймовірність відключення за графіками та нещодавніми патернами; фактичне постачання може відрізнятися.",
};

export interface OutageForecast {
  /** Always true — this is a model output, not a measurement. */
  isPrediction: true;
  regionCode: string;
  regionName: string;
  /** Start of the forecast window (ISO 8601, UTC). */
  windowStart: string;
  /** End of the forecast window (ISO 8601, UTC). */
  windowEnd: string;
  /** Probability of an outage in the window, 0–1. */
  probability: number;
  /** Most likely cause driving the forecast. */
  likelyCause: OutageCause;
  /** Expected coverage if it occurs, 0–1. */
  expectedCoverage: number;
  summaryEn: string;
  summaryUk: string;
  disclaimer: { en: string; uk: string };
}

export interface ScheduledForecastWindow {
  regionCode: string;
  regionName: string;
  /** Hours-from-now the scheduled window opens. */
  startsInHours: number;
  durationHours: number;
  /** Fraction of region in the scheduled rotation group(s). */
  coverage: number;
}

const causeEn: Record<OutageCause, string> = {
  damage: "infrastructure damage",
  scheduled: "scheduled rotation",
  weather: "severe weather",
  unknown: "recurring instability",
};
const causeUk: Record<OutageCause, string> = {
  damage: "пошкодження інфраструктури",
  scheduled: "планової ротації",
  weather: "несприятливої погоди",
  unknown: "повторюваної нестабільності",
};

/**
 * Forecast from a published rotation schedule. Scheduled windows are
 * deterministic, so probability is high but still flagged as a prediction
 * (the schedule can be cancelled / shifted by the operator).
 */
export function forecastFromSchedule(windows: ScheduledForecastWindow[]): OutageForecast[] {
  const now = Date.now();
  return windows.map((w) => {
    const start = new Date(now + w.startsInHours * 3600_000);
    const end = new Date(now + (w.startsInHours + w.durationHours) * 3600_000);
    const probability = 0.85; // published but not guaranteed
    const pct = Math.round(w.coverage * 100);
    const hrs = w.durationHours;
    return {
      isPrediction: true as const,
      regionCode: w.regionCode,
      regionName: w.regionName,
      windowStart: start.toISOString(),
      windowEnd: end.toISOString(),
      probability,
      likelyCause: "scheduled",
      expectedCoverage: w.coverage,
      summaryEn: `${w.regionName} oblast: forecasted scheduled outage in ~${w.startsInHours}h for ~${hrs}h (~${pct}% affected).`,
      summaryUk: `${w.regionName} область: прогнозоване планове відключення через ~${w.startsInHours} год на ~${hrs} год (~${pct}% постраждає).`,
      disclaimer: FORECAST_DISCLAIMER,
    };
  });
}

/**
 * Heuristic recurrence forecast: a region with several recent active/emergency
 * outages is likely to keep shedding. Probability rises with recent frequency
 * and average confidence; capped below the schedule-based certainty.
 *
 * @param recent  recent OutageEvents (any window the caller chooses, e.g. 72h)
 * @param horizonHours forecast horizon (default 6h)
 */
export function forecastFromRecurrence(
  recent: OutageEvent[],
  horizonHours = 6,
): OutageForecast[] {
  const byRegion = new Map<string, OutageEvent[]>();
  for (const e of recent) {
    if (e.cause === "scheduled") continue; // schedules handled deterministically
    const arr = byRegion.get(e.regionCode) ?? [];
    arr.push(e);
    byRegion.set(e.regionCode, arr);
  }

  const now = Date.now();
  const forecasts: OutageForecast[] = [];

  for (const [regionCode, events] of byRegion) {
    if (events.length < 2) continue; // need a pattern, not a one-off

    const avgConf = events.reduce((s, e) => s + e.confidence, 0) / events.length;
    const avgCov = events.reduce((s, e) => s + e.coverage, 0) / events.length;
    // Frequency factor saturates: 2 events → 0.5, 3 → 0.66, 4+ → ~0.75.
    const freqFactor = 1 - 1 / events.length;
    const probability = parseFloat(Math.min(0.8, 0.5 * freqFactor + 0.5 * avgConf).toFixed(2));
    if (probability < 0.4) continue;

    const likelyCause = events[0].cause;
    const regionName = events[0].regionName;
    const pct = Math.round(avgCov * 100);

    forecasts.push({
      isPrediction: true,
      regionCode,
      regionName,
      windowStart: new Date(now).toISOString(),
      windowEnd: new Date(now + horizonHours * 3600_000).toISOString(),
      probability,
      likelyCause,
      expectedCoverage: parseFloat(avgCov.toFixed(2)),
      summaryEn: `${regionName} oblast: ${Math.round(probability * 100)}% chance of further outage within ${horizonHours}h due to ${causeEn[likelyCause]} (~${pct}% expected).`,
      summaryUk: `${regionName} область: ${Math.round(probability * 100)}% ймовірності подальшого відключення протягом ${horizonHours} год через ${causeUk[likelyCause]} (~${pct}% очікувано).`,
      disclaimer: FORECAST_DISCLAIMER,
    });
  }

  return forecasts.sort((a, b) => b.probability - a.probability);
}
