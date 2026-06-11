/**
 * Trend pages — multi-year context. (TODO task 10)
 *
 * Builds time-bucketed trend series from normalised dataset events, cross-checks
 * ACLED coverage, and contextualises recent activity against the UCDP historical
 * baseline. Output feeds the trends API route + datasets page. Pure functions —
 * the API route owns I/O and demo-data wiring.
 */

import type {
  DatasetId,
  NormalisedDatasetEvent,
  TrendGranularity,
  TrendPoint,
  TrendSeries,
} from "./types";
import type { GdeltRawEvent, UcdpRawEvent } from "./types";
import { checkCoverage } from "./acled-coverage";
import { buildBaseline, fatalityZScore, type BaselineSummary } from "./ucdp-baseline";

/** Bucket key for an ISO timestamp at the requested granularity. */
function bucketKey(iso: string, g: TrendGranularity): string {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  if (g === "year") return String(y);
  if (g === "month") return `${y}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  // ISO week
  const tmp = new Date(Date.UTC(y, d.getUTCMonth(), d.getUTCDate()));
  const dayNum = (tmp.getUTCDay() + 6) % 7;
  tmp.setUTCDate(tmp.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 4));
  const week =
    1 + Math.round(((tmp.getTime() - firstThursday.getTime()) / 86_400_000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${tmp.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/**
 * Build a single dataset's trend series from normalised events.
 * `avgTone` is populated only when the dataset carries tone (GDELT, via raw rows
 * supplied through `toneByEventId`).
 */
export function buildTrendSeries(
  dataset: DatasetId,
  country: string,
  events: NormalisedDatasetEvent[],
  granularity: TrendGranularity,
  toneByEventId?: Map<string, number>,
): TrendSeries {
  const filtered = events.filter((e) => e.country === country);
  const buckets = new Map<string, { events: number; fatalities: number; toneSum: number; toneN: number }>();

  for (const e of filtered) {
    const key = bucketKey(e.occurredAt, granularity);
    const b = buckets.get(key) ?? { events: 0, fatalities: 0, toneSum: 0, toneN: 0 };
    b.events += 1;
    b.fatalities += e.fatalities ?? 0;
    const tone = toneByEventId?.get(e.sourceEventId);
    if (tone != null) {
      b.toneSum += tone;
      b.toneN += 1;
    }
    buckets.set(key, b);
  }

  const points: TrendPoint[] = Array.from(buckets.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([period, v]) => ({
      period,
      events: v.events,
      fatalities: v.fatalities,
      avgTone: v.toneN ? parseFloat((v.toneSum / v.toneN).toFixed(2)) : undefined,
    }));

  const dates = filtered.map((e) => e.occurredAt).sort();
  return {
    dataset,
    country,
    granularity,
    points,
    from: dates[0]?.slice(0, 10) ?? "",
    to: dates[dates.length - 1]?.slice(0, 10) ?? "",
  };
}

/** Build a tone lookup from GDELT raw rows for `buildTrendSeries`. */
export function toneIndexFromGdelt(rows: GdeltRawEvent[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const r of rows) {
    if (r.AvgTone != null) m.set(`gdelt:${r.GLOBALEVENTID}`, r.AvgTone);
  }
  return m;
}

export interface MultiYearTrendContext {
  country: string;
  granularity: TrendGranularity;
  /** Per-dataset series keyed by dataset id. */
  series: Partial<Record<DatasetId, TrendSeries>>;
  /** UCDP historical baseline used for context. */
  baseline?: BaselineSummary;
  /** Latest-year z-score vs baseline (spike detector). */
  latestYearZScore?: number;
  /** ACLED coverage caveat for the most recent year requested. */
  coverageNote: { en: string; uk: string };
}

export interface BuildContextInput {
  country: string;            // ISO2
  granularity: TrendGranularity;
  acledEvents?: NormalisedDatasetEvent[];
  gdeltEvents?: NormalisedDatasetEvent[];
  gdeltRaw?: GdeltRawEvent[];
  ucdpEvents?: NormalisedDatasetEvent[];
  ucdpRaw?: UcdpRawEvent[];
  /** Baseline window. */
  baselineFromYear?: number;
  baselineToYear?: number;
  /** The year being highlighted (for the spike z-score + coverage note). */
  focusYear?: number;
}

/**
 * Assemble a cross-referenced, multi-year trend context for a country: one
 * series per available dataset + a UCDP baseline + a coverage caveat. This is
 * the primary thing the trends API route returns.
 */
export function buildMultiYearContext(input: BuildContextInput): MultiYearTrendContext {
  const { country, granularity } = input;
  const series: Partial<Record<DatasetId, TrendSeries>> = {};

  if (input.acledEvents) {
    series.acled = buildTrendSeries("acled", country, input.acledEvents, granularity);
  }
  if (input.gdeltEvents) {
    const tone = input.gdeltRaw ? toneIndexFromGdelt(input.gdeltRaw) : undefined;
    series.gdelt = buildTrendSeries("gdelt", country, input.gdeltEvents, granularity, tone);
  }
  if (input.ucdpEvents) {
    series.ucdp = buildTrendSeries("ucdp", country, input.ucdpEvents, granularity);
  }

  let baseline: BaselineSummary | undefined;
  let latestYearZScore: number | undefined;
  if (input.ucdpRaw && input.baselineFromYear && input.baselineToYear) {
    baseline = buildBaseline(input.ucdpRaw, country, input.baselineFromYear, input.baselineToYear);
    if (input.focusYear) {
      const observed = input.ucdpRaw
        .filter((r) => r.year === input.focusYear)
        .reduce((a, r) => a + r.best, 0);
      latestYearZScore = fatalityZScore(observed, baseline);
    }
  }

  const cov = checkCoverage(country, input.focusYear ?? new Date().getUTCFullYear());
  return {
    country,
    granularity,
    series,
    baseline,
    latestYearZScore,
    coverageNote: { en: cov.reasonEn, uk: cov.reasonUk },
  };
}
