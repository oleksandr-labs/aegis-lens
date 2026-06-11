/**
 * Dark-vessel detection.
 *
 * A "dark vessel" is a ship that has switched off (or spoofed) its AIS
 * transponder. We cannot prove this from AIS alone, so the codeable contract
 * here is a correlation heuristic between:
 *   1. an AIS gap (no position report for longer than expected), and
 *   2. an independent radar/optical detection — typically a SAR (synthetic
 *      aperture radar) satellite pass (Sentinel-1, ICEYE, Capella) that sees a
 *      hull where no AIS contact exists.
 *
 * Production wiring would join the AIS track store with a SAR detection feed.
 * This module provides the typed correlation logic + a confidence schema so the
 * join can be dropped in without reshaping callers.
 */

import type { VesselPosition, AisStatus } from "./types";

/** A vessel detection from a non-cooperative sensor (SAR / radar / EO). */
export interface SarDetection {
  /** Detection id from the imagery provider */
  detection_id: string;
  /** Sensor that produced it */
  sensor: "sentinel_1" | "iceye" | "capella" | "radar_coastal" | "optical";
  latitude: number;
  longitude: number;
  /** Estimated hull length in metres, if the provider derives it */
  length_m: number | null;
  /** UTC acquisition time */
  acquired_at: string;
  /** Provider-reported detection confidence 0..1 */
  detection_confidence: number;
}

/** A correlation between a SAR detection and a (suspected) AIS-dark vessel. */
export interface DarkVesselCorrelation {
  detection_id: string;
  /** MMSI of the best AIS-track match, or null if no plausible track */
  matched_mmsi: string | null;
  /** Distance from the SAR contact to the last known AIS position, in km */
  gap_distance_km: number | null;
  /** Seconds since the matched vessel's last AIS message */
  ais_gap_s: number | null;
  /** Derived AIS status */
  ais_status: AisStatus;
  /** True when the contact has no plausible AIS track at all */
  unattributed: boolean;
  /** Overall confidence that this is a deliberately dark vessel, 0..1 */
  dark_confidence: number;
  reasonsEn: string[];
  reasonsUk: string[];
}

/** A vessel's last-known AIS state, the left side of the join. */
export interface AisTrackSnapshot {
  mmsi: string;
  last: VesselPosition;
  /** Expected transmit interval (s); gaps beyond this are suspicious */
  expected_interval_s: number;
}

const EARTH_R_KM = 6371;

/** Great-circle distance between two points, kilometres. */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_R_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Classify AIS status from the gap between now and the last message. */
export function deriveAisStatus(
  ais_gap_s: number | null,
  expected_interval_s: number,
): AisStatus {
  if (ais_gap_s === null) return "dark";
  if (ais_gap_s <= expected_interval_s * 4) return "transmitting";
  if (ais_gap_s <= expected_interval_s * 30) return "intermittent";
  return "dark";
}

/**
 * Correlate one SAR detection against a pool of AIS track snapshots.
 *
 * Heuristic: the detection is matched to the nearest plausible track whose last
 * AIS position is within `maxMatchKm` of the contact AND whose AIS gap exceeds a
 * few transmit intervals. If a vessel was transmitting normally near the contact
 * it is NOT dark — its AIS already explains the radar return.
 */
export function correlateDarkVessel(
  detection: SarDetection,
  tracks: AisTrackSnapshot[],
  opts: { now?: string; maxMatchKm?: number } = {},
): DarkVesselCorrelation {
  const nowMs = new Date(opts.now ?? new Date().toISOString()).getTime();
  const maxMatchKm = opts.maxMatchKm ?? 25;

  let best: AisTrackSnapshot | null = null;
  let bestKm = Infinity;
  for (const t of tracks) {
    const km = haversineKm(
      detection.latitude,
      detection.longitude,
      t.last.latitude,
      t.last.longitude,
    );
    if (km < bestKm) {
      bestKm = km;
      best = t;
    }
  }

  const reasonsEn: string[] = [];
  const reasonsUk: string[] = [];

  // No plausible track within range → fully unattributed contact.
  if (!best || bestKm > maxMatchKm) {
    reasonsEn.push("SAR contact with no AIS track within match radius.");
    reasonsUk.push("Радарний контакт без AIS-треку в радіусі співставлення.");
    return {
      detection_id: detection.detection_id,
      matched_mmsi: null,
      gap_distance_km: best ? Math.round(bestKm * 10) / 10 : null,
      ais_gap_s: null,
      ais_status: "dark",
      unattributed: true,
      dark_confidence: clamp(0.6 + detection.detection_confidence * 0.35),
      reasonsEn,
      reasonsUk,
    };
  }

  const lastMs = new Date(best.last.timestamp).getTime();
  const ais_gap_s = Math.max(0, Math.round((nowMs - lastMs) / 1000));
  const ais_status = deriveAisStatus(ais_gap_s, best.expected_interval_s);

  let confidence = detection.detection_confidence * 0.5;
  if (ais_status === "dark") {
    confidence += 0.4;
    reasonsEn.push(
      `AIS silent for ${ais_gap_s}s (expected every ${best.expected_interval_s}s).`,
    );
    reasonsUk.push(
      `AIS мовчить ${ais_gap_s}с (очікувано кожні ${best.expected_interval_s}с).`,
    );
  } else if (ais_status === "intermittent") {
    confidence += 0.2;
    reasonsEn.push("AIS transmitting intermittently near the SAR contact.");
    reasonsUk.push("AIS передає з перебоями поблизу радарного контакту.");
  } else {
    reasonsEn.push("AIS active near contact — likely explained, not dark.");
    reasonsUk.push("AIS активний поблизу контакту — ймовірно не «темне» судно.");
  }

  if (bestKm > 8) {
    // contact drifted far from last AIS fix → consistent with a switched-off run
    confidence += 0.1;
    reasonsEn.push(`Contact ${bestKm.toFixed(1)}km from last AIS fix.`);
    reasonsUk.push(`Контакт за ${bestKm.toFixed(1)}км від останньої AIS-позиції.`);
  }

  return {
    detection_id: detection.detection_id,
    matched_mmsi: best.mmsi,
    gap_distance_km: Math.round(bestKm * 10) / 10,
    ais_gap_s,
    ais_status,
    unattributed: false,
    dark_confidence: clamp(confidence),
    reasonsEn,
    reasonsUk,
  };
}

/** Batch helper: correlate many SAR detections against the track pool. */
export function correlateDarkVessels(
  detections: SarDetection[],
  tracks: AisTrackSnapshot[],
  opts: { now?: string; maxMatchKm?: number } = {},
): DarkVesselCorrelation[] {
  return detections.map((d) => correlateDarkVessel(d, tracks, opts));
}

function clamp(n: number): number {
  return Math.max(0, Math.min(1, Math.round(n * 100) / 100));
}
