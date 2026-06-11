/**
 * Air-quality cross-reference for fires.
 *
 * Links a fire detection to the nearest air-quality (AQ) observation so the UI
 * can show "smoke from this fire is plausibly degrading air quality here". This
 * is a typed contract over an external AQ source (e.g. OpenAQ, IQAir, or a
 * national network) — the actual AQ fetch is NOT implemented (no AQ API wired up
 * in this repo). We provide the interface + nearest-station matching + a
 * conservative correlation flag.
 *
 * We do NOT assert that the fire CAUSED the AQ reading — only that a high-AQI
 * station sits downwind/near an active fire (a correlation hint, not causation).
 */

import type { FIRMSFirePointNormalized } from "./client";

/** A single air-quality observation from an external network. */
export interface AirQualityObservation {
  stationId: string;
  latitude: number;
  longitude: number;
  /** US EPA-style AQI (0–500), or undefined if only raw PM is available. */
  aqi?: number;
  /** PM2.5 µg/m³ */
  pm25?: number;
  /** ISO-8601 UTC */
  observed_at: string;
}

export type AirQualityBand =
  | "good"
  | "moderate"
  | "unhealthy_sensitive"
  | "unhealthy"
  | "very_unhealthy"
  | "hazardous"
  | "unknown";

export interface FireAirQualityLink {
  /** Nearest AQ station within the search radius, if any. */
  station?: AirQualityObservation;
  distanceKm?: number;
  band: AirQualityBand;
  /**
   * Conservative correlation flag: true only when a nearby station is in an
   * unhealthy-or-worse band AND close in space AND time. Never implies causation.
   */
  plausiblySmokeAffected: boolean;
}

export interface AirQualityOptions {
  /** Search radius (km) for the nearest station. Default 25. */
  searchRadiusKm: number;
  /** Max age difference (hours) between fire and AQ reading. Default 6. */
  maxAgeHours: number;
}

export const DEFAULT_AIR_QUALITY_OPTIONS: AirQualityOptions = {
  searchRadiusKm: 25,
  maxAgeHours: 6,
};

export function aqiBand(aqi?: number): AirQualityBand {
  if (aqi == null) return "unknown";
  if (aqi <= 50) return "good";
  if (aqi <= 100) return "moderate";
  if (aqi <= 150) return "unhealthy_sensitive";
  if (aqi <= 200) return "unhealthy";
  if (aqi <= 300) return "very_unhealthy";
  return "hazardous";
}

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

const UNHEALTHY_BANDS: AirQualityBand[] = [
  "unhealthy",
  "very_unhealthy",
  "hazardous",
];

/**
 * Cross-reference one fire against a set of AQ observations and return the
 * nearest qualifying station plus a conservative smoke-affected flag.
 */
export function crossReferenceAirQuality(
  fire: FIRMSFirePointNormalized,
  observations: AirQualityObservation[],
  options: AirQualityOptions = DEFAULT_AIR_QUALITY_OPTIONS,
): FireAirQualityLink {
  const fireMs = new Date(fire.acquired_at).getTime();
  let best: { obs: AirQualityObservation; km: number } | undefined;
  for (const obs of observations) {
    const ageH = Math.abs(fireMs - new Date(obs.observed_at).getTime()) / 3_600_000;
    if (ageH > options.maxAgeHours) continue;
    const km = haversineKm(fire.latitude, fire.longitude, obs.latitude, obs.longitude);
    if (km > options.searchRadiusKm) continue;
    if (!best || km < best.km) best = { obs, km };
  }

  if (!best) {
    return { band: "unknown", plausiblySmokeAffected: false };
  }
  const band = aqiBand(best.obs.aqi);
  return {
    station: best.obs,
    distanceKm: best.km,
    band,
    plausiblySmokeAffected: UNHEALTHY_BANDS.includes(band) && best.km <= options.searchRadiusKm,
  };
}
