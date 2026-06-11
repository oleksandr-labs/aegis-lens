/**
 * TASK 5 — Direction-of-movement vectors at LOW PRECISION.
 *
 * We deliberately reduce any heading to an 8-point compass bucket. We NEVER
 * store or emit exact bearings, speeds, tracks, or precise coordinates — those
 * would be targeting-grade. The only output is a coarse bucket + a coarse
 * confidence band.
 */

import type { BearingBucket, MovementConfidence } from "./types";

const BUCKETS: BearingBucket[] = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

/** Bilingual labels for compass buckets. */
export const BEARING_LABELS: Record<BearingBucket, { en: string; uk: string }> = {
  N: { en: "North", uk: "Північ" },
  NE: { en: "North-East", uk: "Північний схід" },
  E: { en: "East", uk: "Схід" },
  SE: { en: "South-East", uk: "Південний схід" },
  S: { en: "South", uk: "Південь" },
  SW: { en: "South-West", uk: "Південний захід" },
  W: { en: "West", uk: "Захід" },
  NW: { en: "North-West", uk: "Північний захід" },
};

/**
 * Reduce a precise heading (degrees, 0 = North, clockwise) to a coarse 8-point
 * bucket. This is intentionally LOSSY — the exact degree is discarded and never
 * retained anywhere downstream.
 */
export function bucketizeBearing(headingDeg: number): BearingBucket {
  // Normalise to [0, 360).
  const h = ((headingDeg % 360) + 360) % 360;
  // 45° sectors centred on each bucket; +22.5° offset so N spans 337.5–22.5.
  const idx = Math.round(h / 45) % 8;
  return BUCKETS[idx];
}

/**
 * Build a low-precision movement vector from a precise heading + a raw
 * confidence (0–1). The precise heading is consumed and ONLY the bucket is kept.
 */
export function toLowPrecisionVector(
  headingDeg: number,
  rawConfidence: number,
): { bucket: BearingBucket; confidence: MovementConfidence } {
  return {
    bucket: bucketizeBearing(headingDeg),
    confidence: bandConfidence(rawConfidence),
  };
}

/** Coarse confidence band — no exact probability is exposed. */
export function bandConfidence(raw: number): MovementConfidence {
  if (raw >= 0.75) return "high";
  if (raw >= 0.45) return "medium";
  return "low";
}

/**
 * Derive a coarse bucket from two FUZZED centroids (from → to). Because the
 * inputs are already fuzzed, the result is inherently low precision. Returns
 * undefined if the two points are effectively co-located (no usable direction).
 */
export function bearingFromFuzzedPoints(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number },
): BearingBucket | undefined {
  const dLat = to.lat - from.lat;
  const dLon = to.lon - from.lon;
  if (Math.abs(dLat) < 1e-4 && Math.abs(dLon) < 1e-4) return undefined;
  // Compass bearing: atan2(east, north), degrees clockwise from North.
  const deg = (Math.atan2(dLon, dLat) * 180) / Math.PI;
  return bucketizeBearing(deg);
}
