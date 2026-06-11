/**
 * Loss-trend time-series aggregation per side (Task 9).
 *
 * Aggregates Oryx entries into time-bucketed loss counts (per side, optionally
 * per category), suitable for a loss-trend chart. Also powers the region × time
 * aggregation consumed by the equipment-loss map layer (Task 7).
 *
 * Entries with no/approximate dates are still counted: approximate dates are
 * already pinned to a representative day by the parser.
 */

import type { OryxEntry, OryxSide, OryxLossStatus, OryxEquipmentCategory } from "./types";

export type TrendBucket = "day" | "week" | "month";

export interface TrendPoint {
  /** Bucket key, ISO date (start of bucket). */
  date: string;
  /** Loss count in this bucket. */
  count: number;
  /** Per-status split within the bucket. */
  byStatus: Record<OryxLossStatus, number>;
}

export interface SideTrend {
  side: OryxSide;
  bucket: TrendBucket;
  points: TrendPoint[];
  total: number;
}

function emptyStatus(): Record<OryxLossStatus, number> {
  return { destroyed: 0, damaged: 0, abandoned: 0, captured: 0 };
}

/** Truncate an ISO date to the start of its bucket. */
export function bucketKey(isoDate: string, bucket: TrendBucket): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return isoDate;
  if (bucket === "month") {
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
  }
  if (bucket === "week") {
    // ISO week start (Monday).
    const day = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - day);
  }
  return d.toISOString().slice(0, 10);
}

export interface TrendOptions {
  bucket?: TrendBucket;
  /** Restrict to a single equipment category. */
  category?: OryxEquipmentCategory;
}

/** Build a per-side loss trend across the dataset. */
export function buildSideTrends(entries: OryxEntry[], opts: TrendOptions = {}): SideTrend[] {
  const bucket = opts.bucket ?? "month";
  const sides: OryxSide[] = ["ukraine", "russia"];

  return sides.map((side) => {
    const buckets = new Map<string, TrendPoint>();
    let total = 0;
    for (const e of entries) {
      if (e.side !== side) continue;
      if (opts.category && e.category !== opts.category) continue;
      if (!e.date) continue;
      const key = bucketKey(e.date, bucket);
      const point = buckets.get(key) ?? { date: key, count: 0, byStatus: emptyStatus() };
      point.count++;
      point.byStatus[e.status]++;
      buckets.set(key, point);
      total++;
    }
    const points = [...buckets.values()].sort((a, b) => a.date.localeCompare(b.date));
    return { side, bucket, points, total };
  });
}

// ── Region × time aggregation (for the equipment_losses layer, Task 7) ────────

export interface RegionTimeCell {
  regionCode: string;
  /** Bucket date. */
  date: string;
  side: OryxSide;
  count: number;
}

/**
 * Aggregate losses by region × time × side. Entries lacking a regionCode are
 * grouped under "UNK". This is the layer's underlying data product.
 */
export function aggregateByRegionTime(entries: OryxEntry[], bucket: TrendBucket = "month"): RegionTimeCell[] {
  const cells = new Map<string, RegionTimeCell>();
  for (const e of entries) {
    if (!e.date) continue;
    const region = e.regionCode ?? "UNK";
    const date = bucketKey(e.date, bucket);
    const key = `${region}|${date}|${e.side}`;
    const cell = cells.get(key) ?? { regionCode: region, date, side: e.side, count: 0 };
    cell.count++;
    cells.set(key, cell);
  }
  return [...cells.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/** Compact totals-by-region map (current cumulative), for layer fill intensity. */
export function totalsByRegion(entries: OryxEntry[]): Record<string, { ukraine: number; russia: number }> {
  const out: Record<string, { ukraine: number; russia: number }> = {};
  for (const e of entries) {
    const region = e.regionCode ?? "UNK";
    out[region] ??= { ukraine: 0, russia: 0 };
    out[region][e.side]++;
  }
  return out;
}
