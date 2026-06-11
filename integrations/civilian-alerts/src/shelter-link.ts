/**
 * Cross-link to the shelters layer — nearest-shelter linkage for an active alert.
 *
 * Task: "Cross-link to shelters layer" (TODO_civilian_alerts.md).
 *
 * When an oblast goes under alert this module finds the nearest shelter
 * points so the civilian UI can show "find shelter" actions. It references the
 * `shelters` layer by id (see layers/src/registry.ts) and consumes a minimal
 * shelter-point shape the host supplies from that layer's data.
 */

import type { CivilianAlert, OblastCode } from "./types";
import { OBLASTS } from "./types";

/** The layer this module cross-links to (must match registry.ts id). */
export const SHELTERS_LAYER_ID = "shelters" as const;

/** Minimal shelter point shape sourced from the `shelters` layer. */
export interface ShelterPoint {
  shelterId: string;
  /** [lon, lat] */
  location: [number, number];
  nameUk?: string;
  nameEn?: string;
  /** "shelter" | "aid_point" etc. — matches shelters layer legend. */
  kind?: string;
  /** Whether the shelter is currently usable/open. */
  open?: boolean;
  capacity?: number;
}

export interface NearestShelter {
  shelter: ShelterPoint;
  /** Great-circle distance from the reference point, in metres. */
  distanceM: number;
}

export interface ShelterLink {
  /** The layer being linked to. */
  layerId: typeof SHELTERS_LAYER_ID;
  oblastCode: OblastCode;
  /** Reference point used for the search ([lon, lat]). */
  from: [number, number];
  alertId: string;
  shelters: NearestShelter[];
}

const EARTH_RADIUS_M = 6_371_000;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Haversine great-circle distance in metres between two [lon, lat] points. */
export function haversineM(a: [number, number], b: [number, number]): number {
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export interface NearestShelterOptions {
  /** Max number of shelters to return. Default 3. */
  limit?: number;
  /** Only include shelters within this radius (metres). Default unlimited. */
  maxDistanceM?: number;
  /** Only consider shelters flagged open. Default false (include all). */
  openOnly?: boolean;
}

/** Find the N nearest shelters to a reference point. */
export function findNearestShelters(
  from: [number, number],
  shelters: ShelterPoint[],
  opts: NearestShelterOptions = {},
): NearestShelter[] {
  const limit = opts.limit ?? 3;
  const ranked: NearestShelter[] = [];
  for (const s of shelters) {
    if (opts.openOnly && s.open === false) continue;
    const distanceM = haversineM(from, s.location);
    if (opts.maxDistanceM !== undefined && distanceM > opts.maxDistanceM) continue;
    ranked.push({ shelter: s, distanceM });
  }
  ranked.sort((a, b) => a.distanceM - b.distanceM);
  return ranked.slice(0, limit);
}

/**
 * Build a shelter cross-link for an active alert. Uses an explicit `from`
 * point when provided (e.g. the user's location), otherwise falls back to the
 * oblast centre so there is always a usable reference.
 */
export function linkSheltersForAlert(
  alert: CivilianAlert,
  shelters: ShelterPoint[],
  from?: [number, number],
  opts?: NearestShelterOptions,
): ShelterLink {
  const info = OBLASTS[alert.oblastCode];
  const origin = from ?? info?.center ?? [31.0, 49.0];
  return {
    layerId: SHELTERS_LAYER_ID,
    oblastCode: alert.oblastCode,
    from: origin,
    alertId: alert.alertId,
    shelters: findNearestShelters(origin, shelters, opts),
  };
}
