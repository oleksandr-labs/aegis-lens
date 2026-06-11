/**
 * Historical outage statistics.
 *
 * Aggregates a history of per-region outage records into civilian-useful
 * metrics: total OFF hours, average daily OFF hours, longest single outage,
 * scheduled-vs-emergency split, and a 0–100 "hardship index" per region.
 * Pure functions, no I/O. Localized formatting (uk/ru/en).
 */

import type { OblastCode, OutageKind, Locale } from "./types";
import { getProvider } from "./oblenergo-registry";

/** One historical outage interval for a region/group. */
export interface OutageRecord {
  regionCode: OblastCode;
  group?: string;
  kind: OutageKind;
  /** Outage start (ISO 8601). */
  startedAt: string;
  /** Outage end (ISO 8601), or undefined if still ongoing. */
  endedAt?: string;
}

export interface RegionOutageStats {
  regionCode: OblastCode;
  providerNameEn: string;
  providerNameUk: string;
  /** Number of outage intervals in the sample. */
  count: number;
  scheduledCount: number;
  emergencyCount: number;
  /** Total OFF time across measured intervals (hours). */
  totalOffHours: number;
  /** Longest single outage (hours). */
  longestOffHours: number;
  /** Average outage length (hours). */
  avgOffHours: number;
  /** Average OFF hours per day over the observed span. */
  avgDailyOffHours: number;
  /** Observed span in days (≥ 1). */
  spanDays: number;
  /** 0–100 hardship index (more/longer/emergency = higher). */
  hardshipIndex: number;
}

function durationHours(rec: OutageRecord, nowMs: number): number | null {
  const start = Date.parse(rec.startedAt);
  if (!Number.isFinite(start)) return null;
  const end = rec.endedAt ? Date.parse(rec.endedAt) : nowMs;
  if (!Number.isFinite(end) || end < start) return null;
  return (end - start) / 3600_000;
}

function computeSpanDays(records: OutageRecord[], nowMs: number): number {
  let minStart = Infinity;
  let maxEnd = -Infinity;
  for (const r of records) {
    const s = Date.parse(r.startedAt);
    if (Number.isFinite(s)) minStart = Math.min(minStart, s);
    const e = r.endedAt ? Date.parse(r.endedAt) : nowMs;
    if (Number.isFinite(e)) maxEnd = Math.max(maxEnd, e);
  }
  if (!Number.isFinite(minStart) || !Number.isFinite(maxEnd)) return 1;
  return Math.max(1, Math.round(((maxEnd - minStart) / 86_400_000) * 100) / 100);
}

/** Aggregate stats for a single region's outage history. */
export function computeRegionStats(
  regionCode: OblastCode,
  records: OutageRecord[],
  now: Date = new Date(),
): RegionOutageStats {
  const nowMs = now.getTime();
  const provider = getProvider(regionCode);
  const durations = records
    .map((r) => durationHours(r, nowMs))
    .filter((d): d is number => d != null);

  const total = durations.reduce((s, d) => s + d, 0);
  const longest = durations.length ? Math.max(...durations) : 0;
  const spanDays = computeSpanDays(records, nowMs);
  const scheduledCount = records.filter((r) => r.kind === "scheduled" || r.kind === "stabilization").length;
  const emergencyCount = records.filter((r) => r.kind === "emergency").length;

  // Hardship index: blends total OFF burden + emergency share + outage frequency.
  const dailyOff = total / spanDays;
  const offBurden = Math.min(1, dailyOff / 12);                    // 12h/day OFF → max
  const emergencyShare = records.length ? emergencyCount / records.length : 0;
  const frequency = Math.min(1, (records.length / spanDays) / 4);  // 4/day → max
  const hardshipIndex = Math.round((0.5 * offBurden + 0.3 * emergencyShare + 0.2 * frequency) * 100);

  return {
    regionCode,
    providerNameEn: provider?.name.en ?? regionCode,
    providerNameUk: provider?.name.uk ?? regionCode,
    count: records.length,
    scheduledCount,
    emergencyCount,
    totalOffHours: parseFloat(total.toFixed(1)),
    longestOffHours: parseFloat(longest.toFixed(1)),
    avgOffHours: durations.length ? parseFloat((total / durations.length).toFixed(1)) : 0,
    avgDailyOffHours: parseFloat(dailyOff.toFixed(1)),
    spanDays,
    hardshipIndex,
  };
}

/** Aggregate across many regions; groups input by region code. */
export function computeStatsByRegion(
  records: OutageRecord[],
  now: Date = new Date(),
): Record<string, RegionOutageStats> {
  const grouped = new Map<OblastCode, OutageRecord[]>();
  for (const r of records) {
    const arr = grouped.get(r.regionCode);
    if (arr) arr.push(r);
    else grouped.set(r.regionCode, [r]);
  }
  const out: Record<string, RegionOutageStats> = {};
  for (const [code, list] of grouped) out[code] = computeRegionStats(code, list, now);
  return out;
}

/** "Xг Yхв" / "Xh Ym" formatter for an hours value. */
export function formatHours(hours: number, locale: Locale = "uk"): string {
  const totalMin = Math.round(hours * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const u = locale === "en" ? { h: "h", m: "m" } : locale === "ru" ? { h: "ч", m: "мин" } : { h: "год", m: "хв" };
  if (h > 0) return `${h}${u.h} ${m}${u.m}`;
  return `${m}${u.m}`;
}

/** Demo outage history for the API route / widget when no archive is supplied. */
export function getDemoHistory(now: Date = new Date()): OutageRecord[] {
  const h = (n: number) => new Date(now.getTime() - n * 3600_000).toISOString();
  return [
    { regionCode: "UA-63", group: "1", kind: "scheduled", startedAt: h(28), endedAt: h(24) },
    { regionCode: "UA-63", group: "1", kind: "emergency", startedAt: h(10), endedAt: h(4) },
    { regionCode: "UA-30", group: "1.1", kind: "scheduled", startedAt: h(20), endedAt: h(16) },
    { regionCode: "UA-30", group: "1.1", kind: "scheduled", startedAt: h(8), endedAt: h(4) },
    { regionCode: "UA-12", group: "3.1", kind: "stabilization", startedAt: h(30), endedAt: h(26) },
    { regionCode: "UA-12", group: "3.1", kind: "emergency", startedAt: h(6) },
  ];
}
