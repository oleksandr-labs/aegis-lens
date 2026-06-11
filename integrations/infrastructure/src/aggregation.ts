/**
 * Damage aggregation per region for reports.
 *
 * Rolls a stream of damage + repair events into per-oblast statistics used by the
 * reporting / PDF-export layer: counts by category and severity, status breakdown,
 * population affected, and a repair rate (restored ÷ total damaged).
 *
 * Примітки / NOTE: aggregation operates on civilian infrastructure events only.
 * Callers must exclude functional military assets upstream (see osm-base.ts); this
 * module does not re-introduce them and reports no asset-level tactical detail —
 * only oblast-level civilian damage rollups.
 */

import {
  InfrastructureDamageEvent,
  InfrastructureRepairEvent,
  InfrastructureCategory,
  DamageSeverity,
  InfrastructureStatus,
  RegionDamageStats,
} from "./types";

const ALL_CATEGORIES: InfrastructureCategory[] = [
  "power", "transport", "telecom", "water", "healthcare",
  "education", "residential", "industrial", "government", "cultural",
];
const ALL_SEVERITIES: DamageSeverity[] = ["minor", "major", "destroyed"];
const ALL_STATUSES: InfrastructureStatus[] = ["damaged", "under_repair", "restored", "destroyed"];

/** Extended per-region stats with status breakdown + repair rate. */
export interface RegionDamageReport extends RegionDamageStats {
  byStatus: Record<InfrastructureStatus, number>;
  /** restored ÷ (total damaged events), 0–1. */
  repairRate: number;
  /** Number of repair/restoration events recorded for the region. */
  repairEventCount: number;
}

/** Human-readable oblast names (ISO 3166-2:UA → en/uk). Extend as needed. */
const REGION_NAMES: Record<string, string> = {
  "UA-30": "Kyiv",
  "UA-46": "Lviv Oblast",
  "UA-63": "Kharkiv Oblast",
  "UA-12": "Dnipropetrovsk Oblast",
  "UA-48": "Mykolaiv Oblast",
  "UA-65": "Kherson Oblast",
  "UA-23": "Zaporizhzhia Oblast",
  "UA-14": "Donetsk Oblast",
};

function zeroRecord<K extends string>(keys: K[]): Record<K, number> {
  return keys.reduce((acc, k) => { acc[k] = 0; return acc; }, {} as Record<K, number>);
}

/**
 * Aggregate damage + repair events into per-region reports.
 *
 * @param events  damage events (any region mix)
 * @param repairs optional repair/restoration events, matched to regions via their asset's
 *                damage event regionCode; if a repair's region can't be resolved it is
 *                still counted globally via `assetRegion` lookup.
 * @param assetRegion optional map assetId → regionCode to attribute repairs to regions.
 */
export function aggregateByRegion(
  events: InfrastructureDamageEvent[],
  repairs: InfrastructureRepairEvent[] = [],
  assetRegion: Record<string, string> = {},
): RegionDamageReport[] {
  const byRegion = new Map<string, RegionDamageReport>();

  // Build region → assetId regionCode index from the events themselves too.
  for (const e of events) {
    const region = e.regionCode ?? "UNKNOWN";
    if (e.assetId && e.regionCode) assetRegion[e.assetId] = e.regionCode;

    let r = byRegion.get(region);
    if (!r) {
      r = {
        regionCode: region,
        regionName: REGION_NAMES[region] ?? region,
        totalDamageEvents: 0,
        byCategory: zeroRecord(ALL_CATEGORIES),
        bySeverity: zeroRecord(ALL_SEVERITIES),
        byStatus: zeroRecord(ALL_STATUSES),
        destroyedAssetCount: 0,
        restoredAssetCount: 0,
        populationAffectedTotal: 0,
        repairRate: 0,
        repairEventCount: 0,
        lastUpdatedAt: new Date(0).toISOString(),
      };
      byRegion.set(region, r);
    }

    r.totalDamageEvents += 1;
    r.byCategory[e.category] += 1;
    r.bySeverity[e.severity] += 1;
    r.byStatus[e.status] += 1;
    if (e.status === "destroyed" || e.severity === "destroyed") r.destroyedAssetCount += 1;
    if (e.status === "restored") r.restoredAssetCount += 1;
    r.populationAffectedTotal += e.populationAffected ?? 0;

    const occurred = new Date(e.occurredAt).toISOString();
    if (occurred > r.lastUpdatedAt) r.lastUpdatedAt = occurred;
  }

  // Fold repair events into their region.
  for (const rep of repairs) {
    const region = assetRegion[rep.assetId];
    if (!region) continue;
    const r = byRegion.get(region);
    if (!r) continue;
    r.repairEventCount += 1;
    if (rep.newStatus === "restored") r.restoredAssetCount += 1;
    const occurred = new Date(rep.occurredAt).toISOString();
    if (occurred > r.lastUpdatedAt) r.lastUpdatedAt = occurred;
  }

  // Finalise repair rate.
  for (const r of byRegion.values()) {
    r.repairRate = r.totalDamageEvents > 0
      ? Number((r.restoredAssetCount / r.totalDamageEvents).toFixed(3))
      : 0;
  }

  return [...byRegion.values()].sort((a, b) => b.totalDamageEvents - a.totalDamageEvents);
}

/** Country-wide totals across all regions (for report headers). */
export function aggregateNational(reports: RegionDamageReport[]): {
  totalDamageEvents: number;
  destroyedAssetCount: number;
  restoredAssetCount: number;
  populationAffectedTotal: number;
  byCategory: Record<InfrastructureCategory, number>;
  bySeverity: Record<DamageSeverity, number>;
  nationalRepairRate: number;
} {
  const byCategory = zeroRecord(ALL_CATEGORIES);
  const bySeverity = zeroRecord(ALL_SEVERITIES);
  let total = 0, destroyed = 0, restored = 0, pop = 0;

  for (const r of reports) {
    total += r.totalDamageEvents;
    destroyed += r.destroyedAssetCount;
    restored += r.restoredAssetCount;
    pop += r.populationAffectedTotal;
    for (const c of ALL_CATEGORIES) byCategory[c] += r.byCategory[c];
    for (const s of ALL_SEVERITIES) bySeverity[s] += r.bySeverity[s];
  }

  return {
    totalDamageEvents: total,
    destroyedAssetCount: destroyed,
    restoredAssetCount: restored,
    populationAffectedTotal: pop,
    byCategory,
    bySeverity,
    nationalRepairRate: total > 0 ? Number((restored / total).toFixed(3)) : 0,
  };
}
