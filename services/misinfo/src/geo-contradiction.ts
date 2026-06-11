/**
 * Geolocation-contradiction detection (heuristic baseline + typed contract).
 *
 * A post claims an event happened at location X, but visual cues in the media
 * point somewhere else (different road signs, language, terrain, sun azimuth,
 * landmarks). Full chip-level geolocation needs CV; this module consumes
 * structured "visual cues" that an upstream vision/OSINT step extracts, and
 * checks them against the claimed location.
 *
 * Output is a neutral MisinfoSignal — a *contradiction* is evidence for review,
 * not a verdict. We never assert the true location, only that the claim and the
 * cues are inconsistent.
 */

import type { MisinfoSignal } from "./types";

export interface GeoPointLite {
  lat: number;
  lon: number;
}

/** A geolocation cue extracted from media or text (upstream). */
export interface VisualGeoCue {
  kind:
    | "landmark"        // recognised building/monument with a known location
    | "signage_text"    // road/shop sign with a place name or script
    | "language_script" // dominant script in visible text (cyrillic/latin/arabic…)
    | "terrain"         // coastal/mountain/steppe — coarse
    | "sun_position"    // azimuth/elevation → rough latitude/time band
    | "vehicle_plate";  // licence-plate country/region code
  /** Free-form value of the cue (e.g. "Beirut Corniche", "ROMÂNIA", "arabic"). */
  value: string;
  /** Best-estimate location implied by the cue, if any. */
  impliedLocation?: GeoPointLite;
  /** Implied country (ISO 3166-1 alpha-2) if the cue indicates one. */
  impliedCountry?: string;
  /** Cue extraction confidence 0–1. */
  confidence: number;
}

export interface GeoClaim {
  /** Claimed location from the post/event. */
  claimedLocation?: GeoPointLite;
  /** Claimed country (ISO 3166-1 alpha-2). */
  claimedCountry?: string;
}

export interface GeoContradictionOptions {
  /** Distance (km) beyond which an implied location contradicts the claim. */
  contradictionDistanceKm?: number;
  /** Ignore cues below this extraction confidence. */
  minCueConfidence?: number;
}

const GEO_DEFAULTS: Required<GeoContradictionOptions> = {
  contradictionDistanceKm: 100,
  minCueConfidence: 0.5,
};

function haversineKm(a: GeoPointLite, b: GeoPointLite): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * Detect geolocation contradiction between a claim and extracted visual cues.
 * Returns a neutral MisinfoSignal when cues meaningfully contradict the claim.
 */
export function detectGeoContradiction(
  claim: GeoClaim,
  cues: VisualGeoCue[],
  options: GeoContradictionOptions = {},
): MisinfoSignal | null {
  const opts = { ...GEO_DEFAULTS, ...options };
  const usable = cues.filter((c) => c.confidence >= opts.minCueConfidence);
  if (usable.length === 0) return null;

  const reasons: string[] = [];
  const sourceCues: string[] = [];
  let maxCueConfidence = 0;

  // Country mismatch (strongest, cheapest signal).
  if (claim.claimedCountry) {
    for (const cue of usable) {
      if (cue.impliedCountry && cue.impliedCountry !== claim.claimedCountry) {
        reasons.push(
          `${cue.kind} ("${cue.value}") implies country ${cue.impliedCountry}, ` +
            `but the post claims ${claim.claimedCountry}`,
        );
        sourceCues.push(`${cue.kind}:${cue.value}`);
        maxCueConfidence = Math.max(maxCueConfidence, cue.confidence);
      }
    }
  }

  // Distance mismatch against implied locations.
  if (claim.claimedLocation) {
    for (const cue of usable) {
      if (!cue.impliedLocation) continue;
      const dist = haversineKm(claim.claimedLocation, cue.impliedLocation);
      if (dist > opts.contradictionDistanceKm) {
        reasons.push(
          `${cue.kind} ("${cue.value}") implies a location ~${Math.round(dist)} km ` +
            `from the claimed point`,
        );
        sourceCues.push(`${cue.kind}:${cue.value}`);
        maxCueConfidence = Math.max(maxCueConfidence, cue.confidence);
      }
    }
  }

  if (reasons.length === 0) return null;

  // Confidence: scaled by the strongest contradicting cue, capped at 0.8.
  // Multiple independent contradicting cues nudge it up modestly.
  const corroboration = Math.min(1, 1 + 0.15 * (reasons.length - 1));
  const confidence = Math.min(0.8, maxCueConfidence * corroboration);

  return {
    flag: "location_contradiction",
    confidence: parseFloat(confidence.toFixed(2)),
    explanation:
      `Visual cues appear inconsistent with the claimed location: ${reasons.join("; ")}. ` +
      `This flags the claim for verification — it does not establish the true location.`,
    sourceIds: sourceCues.length > 0 ? sourceCues : undefined,
  };
}
