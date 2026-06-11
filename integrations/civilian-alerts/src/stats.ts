/**
 * Alert-duration statistics — per-region duration aggregation.
 *
 * Task: "Alert-duration statistics" (TODO_civilian_alerts.md).
 *
 * Aggregates a set of historical CivilianAlerts (typically from archive.ts)
 * into per-oblast duration metrics: average / median / longest duration,
 * total count, and average alerts-per-day. Pure functions, no I/O.
 *
 * Only alerts with a known `durationSec` (i.e. cleared) feed the duration
 * stats; ongoing alerts still count toward `count` and `perDay`.
 */

import type { AlertType, CivilianAlert, OblastCode } from "./types";
import { OBLASTS } from "./types";

export interface DurationStats {
  oblastCode: OblastCode;
  oblastNameUk: string;
  oblastNameEn: string;
  /** Total alerts in the sample (including ongoing). */
  count: number;
  /** Alerts that have a measured duration. */
  measuredCount: number;
  avgDurationSec: number;
  medianDurationSec: number;
  longestDurationSec: number;
  shortestDurationSec: number;
  /** Sum of all measured durations. */
  totalDurationSec: number;
  /** Average number of alerts per day over the observed span. */
  perDay: number;
  /** Observed time span in days (>= 1 to avoid divide-by-zero). */
  spanDays: number;
  /** Breakdown of counts by alert type. */
  byType: Partial<Record<AlertType, number>>;
}

function median(sorted: number[]): number {
  const n = sorted.length;
  if (n === 0) return 0;
  const mid = Math.floor(n / 2);
  return n % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
}

/** Compute span in days between earliest start and latest end/now. */
function computeSpanDays(alerts: CivilianAlert[]): number {
  if (alerts.length === 0) return 1;
  let minStart = Infinity;
  let maxEnd = -Infinity;
  for (const a of alerts) {
    const start = Date.parse(a.startedAt);
    if (Number.isFinite(start)) minStart = Math.min(minStart, start);
    const end = a.endedAt ? Date.parse(a.endedAt) : start;
    if (Number.isFinite(end)) maxEnd = Math.max(maxEnd, end);
  }
  if (!Number.isFinite(minStart) || !Number.isFinite(maxEnd)) return 1;
  const days = (maxEnd - minStart) / 86_400_000;
  return Math.max(1, Math.round(days * 100) / 100);
}

/** Aggregate duration stats for a single oblast's alert sample. */
export function computeDurationStats(
  oblastCode: OblastCode,
  alerts: CivilianAlert[],
): DurationStats {
  const info = OBLASTS[oblastCode];
  const durations = alerts
    .map((a) => a.durationSec)
    .filter((d): d is number => typeof d === "number" && d >= 0)
    .sort((a, b) => a - b);

  const total = durations.reduce((s, d) => s + d, 0);
  const measuredCount = durations.length;

  const byType: Partial<Record<AlertType, number>> = {};
  for (const a of alerts) {
    byType[a.type] = (byType[a.type] ?? 0) + 1;
  }

  const spanDays = computeSpanDays(alerts);

  return {
    oblastCode,
    oblastNameUk: info?.nameUk ?? oblastCode,
    oblastNameEn: info?.nameEn ?? oblastCode,
    count: alerts.length,
    measuredCount,
    avgDurationSec: measuredCount ? Math.round(total / measuredCount) : 0,
    medianDurationSec: median(durations),
    longestDurationSec: durations.length ? durations[durations.length - 1] : 0,
    shortestDurationSec: durations.length ? durations[0] : 0,
    totalDurationSec: total,
    perDay: Math.round((alerts.length / spanDays) * 100) / 100,
    spanDays,
    byType,
  };
}

/**
 * Aggregate across many oblasts at once. Groups the input by oblast and
 * returns one DurationStats per oblast present in the sample.
 */
export function computeStatsByOblast(
  alerts: CivilianAlert[],
): Record<string, DurationStats> {
  const grouped = new Map<OblastCode, CivilianAlert[]>();
  for (const a of alerts) {
    const arr = grouped.get(a.oblastCode);
    if (arr) arr.push(a);
    else grouped.set(a.oblastCode, [a]);
  }
  const out: Record<string, DurationStats> = {};
  for (const [code, list] of grouped) {
    out[code] = computeDurationStats(code, list);
  }
  return out;
}

/** Human-friendly "Xг Yхв" / "Xh Ym" formatter for a duration in seconds. */
export function formatDuration(
  sec: number,
  locale: "uk" | "ru" | "en" = "uk",
): string {
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  const u =
    locale === "en"
      ? { h: "h", m: "m" }
      : locale === "ru"
        ? { h: "ч", m: "мин" }
        : { h: "год", m: "хв" };
  if (h > 0) return `${h}${u.h} ${m}${u.m}`;
  return `${m}${u.m}`;
}
