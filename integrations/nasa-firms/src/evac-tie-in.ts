/**
 * Civilian-alert tie-in for evacuation zones.
 *
 * When a fire is both LARGE (high FRP or persistent) AND close to a populated
 * place, this module emits an "evac-advisory" payload that the civilian-alert
 * subsystem can consume. This is intentionally an ADVISORY contract — it does
 * NOT order evacuations; it surfaces candidates for a human dispatcher to review.
 *
 * No population raster is bundled here, so the caller passes a list of populated
 * places (name + location + population). Matching is nearest-place within a
 * radius scaled by fire size.
 */

import type { FIRMSFirePointNormalized } from "./client";

export interface PopulatedPlace {
  name: string;
  latitude: number;
  longitude: number;
  population: number;
}

export type EvacSeverity = "watch" | "advisory" | "urgent";

export interface EvacAdvisory {
  fireLatitude: number;
  fireLongitude: number;
  acquired_at: string;
  frp_mw: number;
  place: PopulatedPlace;
  distanceKm: number;
  severity: EvacSeverity;
  /** Bilingual, ready for the civilian-alert layer. */
  message: { en: string; uk: string };
}

export interface EvacTieInOptions {
  /** FRP (MW) above which a fire is "large". Default 50. */
  largeFrpMw: number;
  /** Base radius (km) to search for populated places. Default 5. */
  baseRadiusKm: number;
  /** Population above which a place is "populated". Default 500. */
  minPopulation: number;
}

export const DEFAULT_EVAC_TIE_IN_OPTIONS: EvacTieInOptions = {
  largeFrpMw: 50,
  baseRadiusKm: 5,
  minPopulation: 500,
};

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function severityFor(distanceKm: number, frp: number, radiusKm: number): EvacSeverity {
  if (distanceKm <= radiusKm * 0.4 || frp >= 150) return "urgent";
  if (distanceKm <= radiusKm * 0.7 || frp >= 80) return "advisory";
  return "watch";
}

/**
 * Evaluate one fire against populated places. Returns an advisory only if the
 * fire is large enough AND a qualifying place sits within the (size-scaled)
 * radius; otherwise returns undefined.
 */
export function evaluateEvacTieIn(
  fire: FIRMSFirePointNormalized,
  places: PopulatedPlace[],
  options: EvacTieInOptions = DEFAULT_EVAC_TIE_IN_OPTIONS,
): EvacAdvisory | undefined {
  if (fire.frp_mw < options.largeFrpMw) return undefined;

  // Larger fires search a wider radius (up to ~3x the base).
  const radiusKm = options.baseRadiusKm * Math.min(1 + fire.frp_mw / 150, 3);

  let best: { place: PopulatedPlace; km: number } | undefined;
  for (const place of places) {
    if (place.population < options.minPopulation) continue;
    const km = haversineKm(fire.latitude, fire.longitude, place.latitude, place.longitude);
    if (km > radiusKm) continue;
    if (!best || km < best.km) best = { place, km };
  }
  if (!best) return undefined;

  const severity = severityFor(best.km, fire.frp_mw, radiusKm);
  return {
    fireLatitude: fire.latitude,
    fireLongitude: fire.longitude,
    acquired_at: fire.acquired_at,
    frp_mw: fire.frp_mw,
    place: best.place,
    distanceKm: best.km,
    severity,
    message: {
      en: `Large fire (${fire.frp_mw.toFixed(0)} MW FRP) ${best.km.toFixed(1)} km from ${best.place.name}. Evac ${severity} — advisory only, verify on the ground.`,
      uk: `Велика пожежа (${fire.frp_mw.toFixed(0)} МВт FRP) за ${best.km.toFixed(1)} км від н.п. ${best.place.name}. Евакуація: ${severity} — лише рекомендація, потрібна перевірка на місці.`,
    },
  };
}

/** Batch helper: advisories for many fires, sorted by severity then distance. */
export function deriveEvacAdvisories(
  fires: FIRMSFirePointNormalized[],
  places: PopulatedPlace[],
  options: EvacTieInOptions = DEFAULT_EVAC_TIE_IN_OPTIONS,
): EvacAdvisory[] {
  const order: Record<EvacSeverity, number> = { urgent: 0, advisory: 1, watch: 2 };
  const out: EvacAdvisory[] = [];
  for (const f of fires) {
    const a = evaluateEvacTieIn(f, places, options);
    if (a) out.push(a);
  }
  out.sort((a, b) => order[a.severity] - order[b.severity] || a.distanceKm - b.distanceKm);
  return out;
}
