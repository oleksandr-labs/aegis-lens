/**
 * Conflict-related vs wildfire fire classifier.
 *
 * Mirrors the keyword/heuristic pattern of integrations/missiles/src/classifier.ts:
 * there is NO trained model here. We combine cheap geospatial + temporal signals
 * into a category + confidence. The output is explicitly a HEURISTIC and the
 * "conflict" label is held to a deliberately high bar (see Примітки in
 * TODO_fires.md — "Easy to overstate causality — be conservative on
 * 'conflict-caused' labeling").
 *
 * Categories:
 *   conflict      — fire plausibly caused by military activity
 *   industrial    — fire at/near a known industrial site (steelworks, refinery)
 *   agricultural  — seasonal field burning
 *   wildfire      — default natural / undetermined vegetation fire
 */

import type { FIRMSFirePointNormalized } from "./client";

export type FireCategory = "conflict" | "wildfire" | "industrial" | "agricultural";

/** A military event near a fire, used only as a proximity signal. */
export interface MilitaryEventRef {
  latitude: number;
  longitude: number;
  /** ISO-8601 UTC */
  occurred_at: string;
}

/** Bounding boxes of known land uses (west, south, east, north). */
export interface LandUseContext {
  industrial?: Array<[number, number, number, number]>;
  agricultural?: Array<[number, number, number, number]>;
}

export interface FireClassifierInput {
  fire: FIRMSFirePointNormalized;
  /** Recent military events to test proximity against. */
  militaryEvents?: MilitaryEventRef[];
  landUse?: LandUseContext;
}

export interface FireClassification {
  category: FireCategory;
  /** 0–1 */
  confidence: number;
  /** Plain-language reasons for auditability. */
  reasons: string[];
}

export interface FireClassifierConfig {
  /** Max distance (km) from a military event to consider it related. */
  conflictRadiusKm: number;
  /** Max time gap (hours) between a military event and the detection. */
  conflictWindowHours: number;
  /** Months (1–12) treated as agricultural-burning season in Ukraine. */
  agriculturalMonths: number[];
}

/** CONSERVATIVE defaults — tight radius/window, so "conflict" rarely fires. */
export const DEFAULT_FIRE_CLASSIFIER_CONFIG: FireClassifierConfig = {
  conflictRadiusKm: 5,
  conflictWindowHours: 12,
  // Late-summer / autumn stubble burning + early-spring grass burning.
  agriculturalMonths: [3, 4, 8, 9, 10],
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

function inAnyBBox(
  lat: number,
  lng: number,
  boxes: Array<[number, number, number, number]> = [],
): boolean {
  return boxes.some(
    ([west, south, east, north]) => lng >= west && lng <= east && lat >= south && lat <= north,
  );
}

/**
 * Classify a single fire detection. The conflict path requires BOTH spatial and
 * temporal proximity to a military event, and even then confidence is capped at
 * 0.7 — we never assert conflict causation with high certainty from satellite
 * thermal data alone.
 */
export function classifyFire(
  input: FireClassifierInput,
  config: FireClassifierConfig = DEFAULT_FIRE_CLASSIFIER_CONFIG,
): FireClassification {
  const { fire, militaryEvents = [], landUse } = input;
  const reasons: string[] = [];

  // Industrial: location inside a known industrial bbox.
  if (inAnyBBox(fire.latitude, fire.longitude, landUse?.industrial)) {
    reasons.push("Inside known industrial site footprint.");
    return { category: "industrial", confidence: 0.6, reasons };
  }

  // Conflict: requires spatial AND temporal coincidence with a military event.
  const fireMs = new Date(fire.acquired_at).getTime();
  let nearest: { km: number; hours: number } | undefined;
  for (const ev of militaryEvents) {
    const km = haversineKm(fire.latitude, fire.longitude, ev.latitude, ev.longitude);
    if (km > config.conflictRadiusKm) continue;
    const hours = Math.abs(fireMs - new Date(ev.occurred_at).getTime()) / 3_600_000;
    if (hours > config.conflictWindowHours) continue;
    if (!nearest || km < nearest.km) nearest = { km, hours };
  }
  if (nearest) {
    reasons.push(
      `Military event within ${nearest.km.toFixed(1)} km and ${nearest.hours.toFixed(1)} h.`,
    );
    // Confidence scales with how tight the coincidence is, capped at 0.7.
    const spatial = 1 - nearest.km / config.conflictRadiusKm;
    const temporal = 1 - nearest.hours / config.conflictWindowHours;
    const confidence = Math.min(0.4 + 0.3 * ((spatial + temporal) / 2), 0.7);
    return { category: "conflict", confidence, reasons };
  }

  // Agricultural: seasonal field-burning window + (optionally) farmland bbox.
  const month = new Date(fire.acquired_at).getUTCMonth() + 1;
  const inAgriSeason = config.agriculturalMonths.includes(month);
  const inFarmland = inAnyBBox(fire.latitude, fire.longitude, landUse?.agricultural);
  if (inFarmland && inAgriSeason) {
    reasons.push("Farmland footprint during agricultural-burning season.");
    return { category: "agricultural", confidence: 0.55, reasons };
  }
  if (inAgriSeason && fire.frp_mw < 30) {
    reasons.push("Low-FRP detection during agricultural-burning season.");
    return { category: "agricultural", confidence: 0.4, reasons };
  }

  // Default: undetermined vegetation fire.
  reasons.push("No conflict/industrial/agricultural signal — defaulting to wildfire.");
  return { category: "wildfire", confidence: 0.5, reasons };
}
