/**
 * Cross-correlate reported grid outages with VIIRS night-lights anomalies.
 *
 * The power-outages package already detects darkness anomalies from VIIRS DNB
 * radiance (viirs-nightlights.ts). This module *correlates* an operator-reported
 * outage for a region with an independent night-lights darkness signal to raise
 * (or lower) confidence and flag possible under-/over-reporting:
 *
 *   - report + VIIRS dark   → corroborated  (confidence ↑)
 *   - report, VIIRS bright  → contradicted  (possible over-report / small area)
 *   - no report, VIIRS dark → unreported    (possible blackout not yet announced)
 *
 * Pure functions; VIIRS samples are supplied by the caller (from the
 * power-outages VIIRS pipeline). Night-lights only fix clear-sky nights.
 */

import type { OblastCode } from "./types";

/** Minimal night-lights verdict per region (subset of the VIIRS anomaly). */
export interface NightlightsVerdict {
  regionCode: OblastCode;
  /** True if radiance dropped anomalously below baseline. */
  dark: boolean;
  /** Fractional radiance drop vs. baseline, 0–1. */
  dropFraction: number;
  /** Detector confidence, 0–1. */
  confidence: number;
  /** Whether the night was clear enough to trust. */
  usable: boolean;
}

export type CorrelationVerdict = "corroborated" | "contradicted" | "unreported" | "inconclusive";

export interface ViirsCorrelation {
  regionCode: OblastCode;
  verdict: CorrelationVerdict;
  /** Adjustment to apply to the reported outage confidence, −0.3..+0.2. */
  confidenceDelta: number;
  /** Independent VIIRS coverage estimate, if dark. */
  viirsCoverage?: number;
  noteEn: string;
  noteUk: string;
  noteRu: string;
}

export interface ReportedOutage {
  regionCode: OblastCode;
  /** True if an operator outage is currently reported for the region. */
  reported: boolean;
  /** Reported coverage 0–1, if known. */
  reportedCoverage?: number;
}

/** Correlate one region's reported outage against its VIIRS verdict. */
export function correlateRegion(
  report: ReportedOutage,
  viirs: NightlightsVerdict | undefined,
): ViirsCorrelation {
  const base = (en: string, uk: string, ru: string, verdict: CorrelationVerdict, delta: number, cov?: number): ViirsCorrelation => ({
    regionCode: report.regionCode,
    verdict,
    confidenceDelta: parseFloat(delta.toFixed(2)),
    viirsCoverage: cov,
    noteEn: en,
    noteUk: uk,
    noteRu: ru,
  });

  if (!viirs || !viirs.usable) {
    return base(
      "Night-lights inconclusive (cloud cover or no clear baseline).",
      "Нічні вогні неінформативні (хмарність або немає чистого базису).",
      "Ночные огни неинформативны (облачность или нет чистого базиса).",
      "inconclusive",
      0,
    );
  }

  if (report.reported && viirs.dark) {
    const delta = 0.15 * viirs.confidence + 0.05;
    return base(
      "Reported outage corroborated by VIIRS darkness.",
      "Повідомлене відключення підтверджено затемненням VIIRS.",
      "Сообщённое отключение подтверждено затемнением VIIRS.",
      "corroborated",
      delta,
      viirs.dropFraction,
    );
  }

  if (report.reported && !viirs.dark) {
    return base(
      "Outage reported but night-lights show normal radiance (small/localised, or recovered).",
      "Відключення повідомлено, але нічні вогні в нормі (локальне або вже відновлено).",
      "Отключение сообщено, но ночные огни в норме (локальное или уже восстановлено).",
      "contradicted",
      -0.2,
    );
  }

  if (!report.reported && viirs.dark) {
    return base(
      "VIIRS shows darkness with no operator report — possible unannounced blackout.",
      "VIIRS показує затемнення без повідомлення оператора — можливе неоголошене знеструмлення.",
      "VIIRS показывает затемнение без сообщения оператора — возможное необъявленное отключение.",
      "unreported",
      0.1,
      viirs.dropFraction,
    );
  }

  return base(
    "No outage reported and night-lights normal.",
    "Відключень не повідомлено, нічні вогні в нормі.",
    "Отключений не сообщено, ночные огни в норме.",
    "inconclusive",
    0,
  );
}

/** Correlate a batch, keyed by region code. */
export function correlateAll(
  reports: ReportedOutage[],
  verdicts: NightlightsVerdict[],
): ViirsCorrelation[] {
  const byRegion = new Map<OblastCode, NightlightsVerdict>();
  for (const v of verdicts) byRegion.set(v.regionCode, v);
  return reports.map((r) => correlateRegion(r, byRegion.get(r.regionCode)));
}
