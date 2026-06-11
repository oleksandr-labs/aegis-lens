/**
 * Per-region / per-period rollups over public aggregates.
 *
 * Operates ONLY on `PublicAggregate` (the strict, post-gate shape from
 * `aggregate.ts`). Because the input cannot contain per-person data, every
 * rollup here is aggregate-by-construction. Small-count handling: figures are
 * presented as-is (they are already de-identified counts), but rollups never
 * narrow to a single identifiable individual — they sum across people.
 */

import type { CasualtySource, CasualtySide, LocalizedText } from "./types";
import type { PublicAggregate } from "./aggregate";

export interface RegionRollup {
  regionCode?: string;
  regionName?: LocalizedText;
  /** Total across all sides/sources/periods for this region. */
  total: number;
  bySide: Partial<Record<CasualtySide, number>>;
  bySource: Partial<Record<CasualtySource, number>>;
}

export interface PeriodRollup {
  period: string;
  total: number;
  bySide: Partial<Record<CasualtySide, number>>;
  bySource: Partial<Record<CasualtySource, number>>;
}

export interface SideTotals {
  side: CasualtySide;
  total: number;
  label: LocalizedText;
}

const SIDE_LABELS: Record<CasualtySide, LocalizedText> = {
  ua_military: { en: "Ukrainian service members (fallen)", uk: "Полеглі військові України" },
  ua_civilian: { en: "Ukrainian civilians (killed)", uk: "Загиблі цивільні України" },
  ru_military: { en: "Russian military (confirmed deaths)", uk: "Підтверджені втрати армії РФ" },
};

function addInto(map: Partial<Record<string, number>>, key: string, n: number): void {
  map[key] = (map[key] ?? 0) + n;
}

/** Roll up by region. */
export function rollupByRegion(aggs: PublicAggregate[]): RegionRollup[] {
  const out = new Map<string, RegionRollup>();
  for (const a of aggs) {
    const key = a.regionCode ?? "__all__";
    let r = out.get(key);
    if (!r) {
      r = { regionCode: a.regionCode, regionName: a.regionName, total: 0, bySide: {}, bySource: {} };
      out.set(key, r);
    }
    r.total += a.count;
    addInto(r.bySide as Record<string, number>, a.side, a.count);
    addInto(r.bySource as Record<string, number>, a.source, a.count);
    if (!r.regionName && a.regionName) r.regionName = a.regionName;
  }
  return [...out.values()].sort((x, y) => y.total - x.total);
}

/** Roll up by reporting period. */
export function rollupByPeriod(aggs: PublicAggregate[]): PeriodRollup[] {
  const out = new Map<string, PeriodRollup>();
  for (const a of aggs) {
    let r = out.get(a.period);
    if (!r) {
      r = { period: a.period, total: 0, bySide: {}, bySource: {} };
      out.set(a.period, r);
    }
    r.total += a.count;
    addInto(r.bySide as Record<string, number>, a.side, a.count);
    addInto(r.bySource as Record<string, number>, a.source, a.count);
  }
  return [...out.values()].sort((x, y) => x.period.localeCompare(y.period));
}

/** Totals per side, with respectful labels. */
export function totalsBySide(aggs: PublicAggregate[]): SideTotals[] {
  const sums = new Map<CasualtySide, number>();
  for (const a of aggs) sums.set(a.side, (sums.get(a.side) ?? 0) + a.count);
  return [...sums.entries()]
    .map(([side, total]) => ({ side, total, label: SIDE_LABELS[side] }))
    .sort((x, y) => y.total - x.total);
}

/** Grand total across all figures. */
export function grandTotal(aggs: PublicAggregate[]): number {
  return aggs.reduce((s, a) => s + a.count, 0);
}
