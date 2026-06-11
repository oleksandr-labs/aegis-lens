/**
 * Sentinel-1 SAR cross-reference for sighting VERIFICATION.
 *
 * Same correlation pattern as `integrations/ais/src/dark-vessel.ts`: a human
 * OSINT report (the left side) is corroborated by an independent, non-
 * cooperative sensor — here a Sentinel-1 SAR pass over the named BY rail node /
 * airbase (the right side). SAR sees metal and movement through cloud and at
 * night, so a fresh, co-located SAR change/detection near a reported echelon or
 * airbase apron strongly raises confidence that the sighting is real.
 *
 * Production wiring joins the sighting store with a Sentinel-1 detection feed
 * (e.g. Sentinel Hub / a change-detection worker). This module provides the
 * typed correlation logic + confidence schema so the join drops in without
 * reshaping callers. Demo-safe: pure functions + a fixture builder.
 */

import type { HajunSighting } from "./types";

/** A detection / change from a Sentinel-1 SAR pass. */
export interface Sentinel1Detection {
  /** Detection id from the imagery provider. */
  detection_id: string;
  sensor: "sentinel_1";
  latitude: number;
  longitude: number;
  /** UTC acquisition time of the SAR pass. */
  acquired_at: string;
  /**
   * What the SAR change suggests, if the worker derives it:
   *   "vehicles" (clustered hard targets), "aircraft" (apron returns),
   *   "rail_activity" (loaded flatcars), or "generic_change".
   */
  signature: "vehicles" | "aircraft" | "rail_activity" | "generic_change";
  /** Provider-reported detection confidence 0..1. */
  detection_confidence: number;
}

/** A correlation between a sighting and a Sentinel-1 SAR detection. */
export interface SarCorrelation {
  eventId: string;
  detection_id: string | null;
  /** Distance sighting↔SAR contact, km (null if no plausible detection). */
  distance_km: number | null;
  /** |sighting time − SAR acquisition time|, hours. */
  time_delta_h: number | null;
  /** True when the SAR signature is consistent with the reported equipment. */
  signature_consistent: boolean;
  /** Overall corroboration confidence 0..1. */
  corroboration: number;
  verified: boolean;
  reasonsEn: string[];
  reasonsUk: string[];
}

const EARTH_R_KM = 6371;

/** Great-circle distance between two points, kilometres. */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_R_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Whether a SAR signature is consistent with a sighting's equipment class. */
export function signatureMatches(
  sighting: HajunSighting,
  signature: Sentinel1Detection["signature"],
): boolean {
  const cls = sighting.equipment.class;
  switch (signature) {
    case "rail_activity":
      return cls === "rail_echelon" || cls === "fuel_logistics" || cls === "personnel";
    case "aircraft":
      return cls === "aircraft" || cls === "helicopter";
    case "vehicles":
      return cls === "armor" || cls === "sam_system" || cls === "missile_system";
    case "generic_change":
    default:
      return true; // weak, non-specific corroboration
  }
}

/**
 * Correlate one sighting against a pool of Sentinel-1 detections.
 *
 * Heuristic: pick the nearest detection within `maxMatchKm` of the sighting POI
 * acquired within `maxDeltaH` of the report. Confidence rises with proximity,
 * temporal closeness, signature consistency, and the SAR provider confidence.
 */
export function correlateSar(
  sighting: HajunSighting,
  detections: Sentinel1Detection[],
  opts: { maxMatchKm?: number; maxDeltaH?: number; verifyThreshold?: number } = {},
): SarCorrelation {
  const maxMatchKm = opts.maxMatchKm ?? 10;
  const maxDeltaH = opts.maxDeltaH ?? 36;
  const verifyThreshold = opts.verifyThreshold ?? 0.6;

  const reasonsEn: string[] = [];
  const reasonsUk: string[] = [];

  if (!sighting.location) {
    reasonsEn.push("Sighting has no resolved location — cannot SAR-correlate.");
    reasonsUk.push("Спостереження без координат — SAR-кореляція неможлива.");
    return base(sighting.eventId, reasonsEn, reasonsUk);
  }

  const sightMs = new Date(sighting.occurredAt).getTime();
  let best: Sentinel1Detection | null = null;
  let bestKm = Infinity;
  for (const d of detections) {
    const km = haversineKm(sighting.location.lat, sighting.location.lon, d.latitude, d.longitude);
    const dh = Math.abs(sightMs - new Date(d.acquired_at).getTime()) / 3_600_000;
    if (km <= maxMatchKm && dh <= maxDeltaH && km < bestKm) {
      best = d;
      bestKm = km;
    }
  }

  if (!best) {
    reasonsEn.push("No Sentinel-1 detection within match window.");
    reasonsUk.push("Немає виявлень Sentinel-1 у вікні співставлення.");
    return base(sighting.eventId, reasonsEn, reasonsUk);
  }

  const time_delta_h =
    Math.round((Math.abs(sightMs - new Date(best.acquired_at).getTime()) / 3_600_000) * 10) / 10;
  const consistent = signatureMatches(sighting, best.signature);

  let corroboration = 0.3 + best.detection_confidence * 0.3;
  if (bestKm <= 3) {
    corroboration += 0.15;
    reasonsEn.push(`SAR contact ${bestKm.toFixed(1)}km from sighting POI.`);
    reasonsUk.push(`SAR-контакт за ${bestKm.toFixed(1)}км від точки спостереження.`);
  }
  if (time_delta_h <= 12) {
    corroboration += 0.1;
    reasonsEn.push(`SAR pass within ${time_delta_h}h of the report.`);
    reasonsUk.push(`Прохід SAR у межах ${time_delta_h}год від повідомлення.`);
  }
  if (consistent) {
    corroboration += 0.2;
    reasonsEn.push(`SAR signature "${best.signature}" matches reported equipment.`);
    reasonsUk.push(`SAR-сигнатура «${best.signature}» збігається з типом техніки.`);
  } else {
    reasonsEn.push(`SAR signature "${best.signature}" not specific to the report.`);
    reasonsUk.push(`SAR-сигнатура «${best.signature}» не специфічна для повідомлення.`);
  }

  const corr = clamp(corroboration);
  return {
    eventId: sighting.eventId,
    detection_id: best.detection_id,
    distance_km: Math.round(bestKm * 10) / 10,
    time_delta_h,
    signature_consistent: consistent,
    corroboration: corr,
    verified: corr >= verifyThreshold,
    reasonsEn,
    reasonsUk,
  };
}

/** Batch helper. Returns one correlation per sighting. */
export function correlateSarBatch(
  sightings: HajunSighting[],
  detections: Sentinel1Detection[],
  opts: { maxMatchKm?: number; maxDeltaH?: number; verifyThreshold?: number } = {},
): SarCorrelation[] {
  return sightings.map((s) => correlateSar(s, detections, opts));
}

/**
 * Apply correlations back onto sightings, attaching SAR xref ids to verified
 * ones (so the adapter can promote verificationState to "in_review").
 */
export function applySarXref(
  sightings: HajunSighting[],
  correlations: SarCorrelation[],
): HajunSighting[] {
  const byId = new Map(correlations.map((c) => [c.eventId, c]));
  return sightings.map((s) => {
    const c = byId.get(s.eventId);
    if (c && c.verified && c.detection_id) {
      return { ...s, sarXrefIds: [...(s.sarXrefIds ?? []), c.detection_id] };
    }
    return s;
  });
}

function base(eventId: string, reasonsEn: string[], reasonsUk: string[]): SarCorrelation {
  return {
    eventId,
    detection_id: null,
    distance_km: null,
    time_delta_h: null,
    signature_consistent: false,
    corroboration: 0,
    verified: false,
    reasonsEn,
    reasonsUk,
  };
}

function clamp(n: number): number {
  return Math.max(0, Math.min(1, Math.round(n * 100) / 100));
}
