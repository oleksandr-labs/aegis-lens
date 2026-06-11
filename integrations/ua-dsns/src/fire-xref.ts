/**
 * Cross-reference DSNS fire events with the satellite fire layer
 * (NASA FIRMS / Sentinel detections from integrations/nasa-firms).
 *
 * A DSNS "пожежа" report and a FIRMS hotspot describing the SAME fire should be
 * linked, so the map can show both the ground-truth (DSNS) and the satellite
 * detection, and so confidence is boosted when the two independent sources
 * corroborate.
 *
 * Matching is spatio-temporal: a FIRMS detection corroborates a DSNS fire when
 * it lies within `radiusKm` of the geocoded DSNS point AND within `windowHrs`
 * of the report time. The DSNS location uncertainty is added to the radius so
 * coarse (oblast-only) geocodes don't over-match.
 *
 * We depend on nasa-firms only by a minimal structural type, to avoid a hard
 * coupling — any source of {lat, lon, acquired_at} works.
 */

import type { DsnsEmergencyEvent } from "./types";

/** Minimal shape of a satellite fire detection (FIRMS / Sentinel SWIR). */
export interface FireDetection {
  id: string;
  latitude: number;
  longitude: number;
  /** ISO-8601 acquisition time. */
  acquired_at: string;
  /** 0–1 detection confidence. */
  confidence?: number;
  /** Fire radiative power, MW (FIRMS). */
  frp_mw?: number;
}

export interface FireXrefOptions {
  /** Base spatial match radius in km. Default 5. */
  radiusKm?: number;
  /** Temporal match window in hours (± around report time). Default 6. */
  windowHrs?: number;
}

export interface FireXrefMatch {
  detection: FireDetection;
  distanceKm: number;
  deltaHrs: number;
}

const EARTH_R_KM = 6371;

function haversineKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_R_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Find satellite detections corroborating a single DSNS fire event. */
export function findCorroboratingFires(
  event: DsnsEmergencyEvent,
  detections: FireDetection[],
  opts: FireXrefOptions = {},
): FireXrefMatch[] {
  // Only fire / explosion events are meaningfully cross-referenced with hotspots.
  if (event.type !== "fire" && event.type !== "explosion") return [];
  if (!event.location) return [];

  const radiusKm = opts.radiusKm ?? 5;
  const windowHrs = opts.windowHrs ?? 6;
  const uncertaintyKm = (event.location.uncertaintyM ?? 0) / 1000;
  const effRadius = radiusKm + uncertaintyKm;
  const tEvent = Date.parse(event.occurredAt);

  const matches: FireXrefMatch[] = [];
  for (const d of detections) {
    const distanceKm = haversineKm(event.location.lat, event.location.lon, d.latitude, d.longitude);
    if (distanceKm > effRadius) continue;
    const deltaHrs = Math.abs(Date.parse(d.acquired_at) - tEvent) / 3600_000;
    if (deltaHrs > windowHrs) continue;
    matches.push({ detection: d, distanceKm, deltaHrs });
  }
  return matches.sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Annotate DSNS events in place with corroborating fire detection ids and a
 * confidence bump when satellite data agrees. Returns the same array.
 */
export function crossReferenceFires(
  events: DsnsEmergencyEvent[],
  detections: FireDetection[],
  opts: FireXrefOptions = {},
): DsnsEmergencyEvent[] {
  for (const ev of events) {
    const matches = findCorroboratingFires(ev, detections, opts);
    if (matches.length === 0) continue;
    ev.fireXrefIds = matches.map((m) => m.detection.id);
    // Independent satellite corroboration → raise confidence (capped 0.98).
    ev.confidence = Math.min(0.98, ev.confidence + 0.1);
  }
  return events;
}
