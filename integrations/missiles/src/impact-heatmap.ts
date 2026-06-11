/**
 * Historical heatmap of missile impact zones.
 *
 * Aggregates confirmed impact events onto a regular lat/lon grid and emits both
 * a typed cell array and a GeoJSON FeatureCollection of weighted points the map
 * can render as a heatmap layer. Weighting is by severity so high-yield strikes
 * dominate the surface.
 */

import { MissileEvent } from "./types";

export interface HeatmapCell {
  /** Grid cell centre. */
  lat: number;
  lon: number;
  /** Number of impacts in this cell. */
  count: number;
  /** Sum of severities (heatmap weight). */
  weight: number;
  /** Distinct event ids in this cell. */
  eventIds: string[];
}

export interface HeatmapGeoJson {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: { type: "Point"; coordinates: [number, number] };
    properties: { count: number; weight: number };
  }>;
}

export interface HeatmapResult {
  /** Grid resolution in degrees. */
  cellSizeDeg: number;
  cells: HeatmapCell[];
  geojson: HeatmapGeoJson;
  totalImpacts: number;
  maxWeight: number;
}

/**
 * Aggregate impacts into a grid heatmap.
 * Only events with substatus "impact" and a location are counted.
 */
export function buildImpactHeatmap(
  events: MissileEvent[],
  cellSizeDeg = 0.25,
): HeatmapResult {
  const grid = new Map<string, HeatmapCell>();
  let totalImpacts = 0;

  for (const ev of events) {
    if (ev.substatus !== "impact") continue;
    if (ev.lat == null || ev.lon == null) continue;
    totalImpacts++;

    const cellLat = Math.floor(ev.lat / cellSizeDeg) * cellSizeDeg + cellSizeDeg / 2;
    const cellLon = Math.floor(ev.lon / cellSizeDeg) * cellSizeDeg + cellSizeDeg / 2;
    const key = `${cellLat.toFixed(4)}:${cellLon.toFixed(4)}`;

    const cell = grid.get(key) ?? {
      lat: cellLat,
      lon: cellLon,
      count: 0,
      weight: 0,
      eventIds: [],
    };
    cell.count++;
    cell.weight += ev.severity;
    cell.eventIds.push(ev.eventId);
    grid.set(key, cell);
  }

  const cells = [...grid.values()];
  const maxWeight = cells.reduce((m, c) => Math.max(m, c.weight), 0);

  return {
    cellSizeDeg,
    cells,
    totalImpacts,
    maxWeight,
    geojson: {
      type: "FeatureCollection",
      features: cells.map((c) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [c.lon, c.lat] },
        properties: { count: c.count, weight: c.weight },
      })),
    },
  };
}
