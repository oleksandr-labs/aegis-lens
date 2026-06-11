/**
 * UCDP historical baseline for trends. (TODO task 9)
 *
 * UCDP's strength is long, consistent annual time-series (back to 1989 for GED).
 * Trend pages compare *current* activity (ACLED/GDELT, recent) against a UCDP
 * historical baseline so spikes are contextualised ("vs. the 2015–2021 mean").
 *
 * This computes per-year fatality/event baselines and a z-score helper.
 */

import type { UcdpRawEvent } from "./types";

export interface YearlyBaseline {
  year: number;
  events: number;
  fatalities: number;
}

export interface BaselineSummary {
  country: string;
  /** Inclusive year range used for the baseline window. */
  fromYear: number;
  toYear: number;
  yearly: YearlyBaseline[];
  meanFatalitiesPerYear: number;
  stdevFatalitiesPerYear: number;
  meanEventsPerYear: number;
}

/** UCDP country names → ISO2 (shared subset; mirror of ucdp-import). */
const UCDP_COUNTRY_ISO2: Record<string, string> = {
  Ukraine: "UA", Russia: "RU", Syria: "SY", Israel: "IL",
  Sudan: "SD", Ethiopia: "ET", Myanmar: "MM", Somalia: "SO",
  Mali: "ML", Nigeria: "NG", Yemen: "YE", Afghanistan: "AF", Iraq: "IQ",
};

/**
 * Build a per-country annual baseline over a year window.
 * `country` is ISO2; rows are filtered to that country.
 */
export function buildBaseline(
  rows: UcdpRawEvent[],
  country: string,
  fromYear: number,
  toYear: number,
): BaselineSummary {
  const byYear = new Map<number, YearlyBaseline>();
  for (let y = fromYear; y <= toYear; y++) {
    byYear.set(y, { year: y, events: 0, fatalities: 0 });
  }

  for (const r of rows) {
    if ((UCDP_COUNTRY_ISO2[r.country] ?? "ZZ") !== country) continue;
    if (r.year < fromYear || r.year > toYear) continue;
    const b = byYear.get(r.year)!;
    b.events += 1;
    b.fatalities += r.best;
  }

  const yearly = Array.from(byYear.values()).sort((a, b) => a.year - b.year);
  const fatals = yearly.map((y) => y.fatalities);
  const events = yearly.map((y) => y.events);
  const meanF = mean(fatals);
  const meanE = mean(events);

  return {
    country,
    fromYear,
    toYear,
    yearly,
    meanFatalitiesPerYear: round(meanF),
    stdevFatalitiesPerYear: round(stdev(fatals, meanF)),
    meanEventsPerYear: round(meanE),
  };
}

/**
 * z-score of an observed annual fatality count vs the baseline.
 * > 2 ≈ a statistically notable spike worth flagging on a trend page.
 */
export function fatalityZScore(observed: number, baseline: BaselineSummary): number {
  if (baseline.stdevFatalitiesPerYear === 0) return 0;
  return round((observed - baseline.meanFatalitiesPerYear) / baseline.stdevFatalitiesPerYear);
}

function mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}
function stdev(xs: number[], m: number): number {
  if (xs.length < 2) return 0;
  const v = xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(v);
}
function round(n: number): number {
  return parseFloat(n.toFixed(2));
}
