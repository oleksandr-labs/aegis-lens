/**
 * Burn-scar mapping via multi-day persistence aggregation.
 *
 * A single FIRMS detection is transient. A burn scar is inferred when the SAME
 * location shows fire activity across MULTIPLE days. We snap detections to a
 * coarse grid (default ~0.01° ≈ 1.1 km) and count how many distinct UTC days
 * each cell was active. Cells active on >= `minDistinctDays` are reported as
 * burn-scar cells with an estimated area.
 *
 * This is a persistence heuristic, not a reflectance-based scar product (which
 * would need Sentinel-2 NBR differencing — see swir-hotspots.ts for the optical
 * dependency note). It is robust and cheap, and good enough to outline where
 * sustained burning occurred.
 */

import type { FIRMSFirePointNormalized } from "./client";

export interface BurnScarCell {
  /** Cell centre */
  latitude: number;
  longitude: number;
  /** Number of distinct UTC days with at least one detection. */
  distinctDays: number;
  /** Total detections aggregated into the cell. */
  detectionCount: number;
  /** First and last detection (ISO-8601 UTC). */
  firstSeen: string;
  lastSeen: string;
  /** Rough area estimate (km²) = active cells × cell footprint. Always 1 cell here. */
  approxAreaKm2: number;
}

export interface BurnScarOptions {
  /** Grid resolution in degrees. Default 0.01 (~1.1 km). */
  gridDeg: number;
  /** Minimum distinct days to count a cell as a scar. Default 2. */
  minDistinctDays: number;
}

export const DEFAULT_BURN_SCAR_OPTIONS: BurnScarOptions = {
  gridDeg: 0.01,
  minDistinctDays: 2,
};

function utcDay(iso: string): string {
  return iso.slice(0, 10); // YYYY-MM-DD
}

/** Approximate area of one grid cell in km² at a given latitude. */
function cellAreaKm2(gridDeg: number, latitude: number): number {
  const kmPerDegLat = 111.32;
  const kmPerDegLng = 111.32 * Math.cos((latitude * Math.PI) / 180);
  return gridDeg * kmPerDegLat * (gridDeg * kmPerDegLng);
}

/**
 * Aggregate a multi-day batch of detections into persistent burn-scar cells.
 */
export function mapBurnScars(
  detections: FIRMSFirePointNormalized[],
  options: BurnScarOptions = DEFAULT_BURN_SCAR_OPTIONS,
): BurnScarCell[] {
  const grid = options.gridDeg;
  interface Acc {
    lat: number;
    lng: number;
    days: Set<string>;
    count: number;
    first: string;
    last: string;
  }
  const cells = new Map<string, Acc>();

  for (const d of detections) {
    const gi = Math.floor(d.latitude / grid);
    const gj = Math.floor(d.longitude / grid);
    const key = `${gi}:${gj}`;
    const centreLat = (gi + 0.5) * grid;
    const centreLng = (gj + 0.5) * grid;
    let acc = cells.get(key);
    if (!acc) {
      acc = {
        lat: centreLat,
        lng: centreLng,
        days: new Set(),
        count: 0,
        first: d.acquired_at,
        last: d.acquired_at,
      };
      cells.set(key, acc);
    }
    acc.days.add(utcDay(d.acquired_at));
    acc.count += 1;
    if (d.acquired_at < acc.first) acc.first = d.acquired_at;
    if (d.acquired_at > acc.last) acc.last = d.acquired_at;
  }

  const out: BurnScarCell[] = [];
  for (const acc of cells.values()) {
    if (acc.days.size < options.minDistinctDays) continue;
    out.push({
      latitude: acc.lat,
      longitude: acc.lng,
      distinctDays: acc.days.size,
      detectionCount: acc.count,
      firstSeen: acc.first,
      lastSeen: acc.last,
      approxAreaKm2: cellAreaKm2(grid, acc.lat),
    });
  }
  // Largest / most persistent first.
  out.sort((a, b) => b.distinctDays - a.distinctDays || b.detectionCount - a.detectionCount);
  return out;
}
