/**
 * Per-feature Mapbox usage tracking.
 *
 * Mapbox bills several distinct metered features (map loads, vector/raster tiles,
 * Static Images API). To make the monthly billing audit (COMPLIANCE.md) reliable
 * we account usage PER FEATURE in our own counters and compare them to the typed
 * plan allotments (`plan.ts`). This is an in-memory baseline; wire the `record`
 * calls to a metrics sink (StatsD/Prometheus) and persist monthly rollups in prod.
 */

import {
  MAPBOX_PLAN,
  MapboxBilledFeature,
  estimateOverageUsd,
  isOverAlertThreshold,
} from "./plan";

export interface UsageEvent {
  feature: MapboxBilledFeature;
  /** Units consumed by this event (usually 1; tiles can batch). */
  units: number;
  /** Optional tenant for per-org attribution. */
  orgId?: string;
  /** ISO-8601. */
  at: string;
}

export interface FeatureUsageSnapshot {
  feature: MapboxBilledFeature;
  monthUnits: number;
  freeMonthlyUnits: number;
  fractionOfFree: number;
  overAlert: boolean;
  estimatedOverageUsd: number;
}

/** Current billing month bucket, e.g. "2026-06". */
function monthBucket(iso: string): string {
  return iso.slice(0, 7);
}

/** Per-feature, per-month usage accountant. */
export class MapboxUsageTracker {
  /** month -> feature -> units */
  private readonly counts = new Map<string, Map<MapboxBilledFeature, number>>();
  /** month -> feature -> orgId -> units */
  private readonly byOrg = new Map<string, Map<string, number>>();

  record(event: UsageEvent): void {
    const month = monthBucket(event.at);
    const m = this.counts.get(month) ?? new Map<MapboxBilledFeature, number>();
    m.set(event.feature, (m.get(event.feature) ?? 0) + event.units);
    this.counts.set(month, m);

    if (event.orgId) {
      const key = `${month}|${event.feature}`;
      const o = this.byOrg.get(key) ?? new Map<string, number>();
      o.set(event.orgId, (o.get(event.orgId) ?? 0) + event.units);
      this.byOrg.set(key, o);
    }
  }

  /** Units for one feature in a given month (defaults to current UTC month). */
  unitsFor(feature: MapboxBilledFeature, month = monthBucket(new Date().toISOString())): number {
    return this.counts.get(month)?.get(feature) ?? 0;
  }

  /** Snapshot of one feature vs its plan allotment. */
  snapshot(
    feature: MapboxBilledFeature,
    month = monthBucket(new Date().toISOString()),
  ): FeatureUsageSnapshot {
    const monthUnits = this.unitsFor(feature, month);
    const a = MAPBOX_PLAN.allotments[feature];
    return {
      feature,
      monthUnits,
      freeMonthlyUnits: a.freeMonthlyUnits,
      fractionOfFree: a.freeMonthlyUnits === 0 ? 0 : monthUnits / a.freeMonthlyUnits,
      overAlert: isOverAlertThreshold(feature, monthUnits),
      estimatedOverageUsd: estimateOverageUsd(feature, monthUnits),
    };
  }

  /** Snapshots for every in-use billed feature — the monthly-audit report. */
  auditReport(month = monthBucket(new Date().toISOString())): FeatureUsageSnapshot[] {
    return (Object.keys(MAPBOX_PLAN.allotments) as MapboxBilledFeature[])
      .filter((f) => MAPBOX_PLAN.allotments[f].inUse)
      .map((f) => this.snapshot(f, month));
  }

  /** Per-org units for a feature in a month (for tenant cost attribution). */
  orgBreakdown(
    feature: MapboxBilledFeature,
    month = monthBucket(new Date().toISOString()),
  ): Record<string, number> {
    const o = this.byOrg.get(`${month}|${feature}`);
    return o ? Object.fromEntries(o) : {};
  }
}

export const mapboxUsage = new MapboxUsageTracker();
