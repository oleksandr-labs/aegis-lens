/**
 * Temporal-contradiction detection (heuristic baseline + typed contract).
 *
 * A post claims an event happened at time T, but evidence points elsewhere:
 *   - Media EXIF/container timestamp far from the claimed time.
 *   - Sun position in the imagery inconsistent with claimed local time
 *     (e.g. long shadows / bright midday sun vs a "night strike" claim).
 *   - Weather / season cues (snow in a July claim).
 *   - The same media demonstrably circulated before the claimed time
 *     (see media-recycling.ts; this module handles the *time* axis only).
 *
 * Sun-position math here is an approximation (NOAA-style solar elevation) good
 * enough to catch gross day/night contradictions; it is NOT a forensic geo-time
 * solver. Output is a neutral MisinfoSignal for review, never a verdict.
 */

import type { MisinfoSignal } from "./types";

export interface TemporalClaim {
  /** Claimed event time, ISO-8601 (with offset if known). */
  claimedAt: string;
  /** Approx location, needed for sun-position checks. */
  lat?: number;
  lon?: number;
}

export interface TemporalEvidence {
  /** Media capture timestamp from EXIF/container metadata, ISO-8601. */
  metadataCapturedAt?: string;
  /**
   * Observed daylight state in the imagery, if a vision step classified it.
   * "day" | "night" | "twilight".
   */
  observedDaylight?: "day" | "night" | "twilight";
  /** Optional season cue from imagery, e.g. snow cover where season conflicts. */
  observedSeason?: "winter" | "spring" | "summer" | "autumn";
}

export interface TemporalContradictionOptions {
  /** Metadata-vs-claim gap (hours) that counts as a contradiction. */
  metadataGapHours?: number;
}

const T_DEFAULTS: Required<TemporalContradictionOptions> = {
  metadataGapHours: 12,
};

const RAD = Math.PI / 180;

/**
 * Solar elevation angle (degrees) for a given UTC instant and location.
 * Low-accuracy NOAA approximation — sufficient for day/night classification.
 */
export function solarElevationDeg(date: Date, lat: number, lon: number): number {
  const dayMs = 86_400_000;
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start) / dayMs);
  const hourUTC =
    date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;

  // Fractional year (radians)
  const gamma = ((2 * Math.PI) / 365) * (dayOfYear - 1 + (hourUTC - 12) / 24);
  // Equation of time (minutes)
  const eqTime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));
  // Solar declination (radians)
  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  const timeOffset = eqTime + 4 * lon; // minutes
  const trueSolarTime = (hourUTC * 60 + timeOffset) % 1440;
  const hourAngle = trueSolarTime / 4 - 180; // degrees

  const latRad = lat * RAD;
  const haRad = hourAngle * RAD;
  const cosZenith =
    Math.sin(latRad) * Math.sin(decl) +
    Math.cos(latRad) * Math.cos(decl) * Math.cos(haRad);
  const zenith = Math.acos(Math.max(-1, Math.min(1, cosZenith)));
  return 90 - zenith / RAD;
}

/** Map a solar elevation to a coarse daylight state. */
export function daylightFromElevation(elevDeg: number): "day" | "night" | "twilight" {
  if (elevDeg > 6) return "day";
  if (elevDeg < -6) return "night";
  return "twilight";
}

export function detectTemporalContradiction(
  claim: TemporalClaim,
  evidence: TemporalEvidence,
  options: TemporalContradictionOptions = {},
): MisinfoSignal | null {
  const opts = { ...T_DEFAULTS, ...options };
  const claimedMs = Date.parse(claim.claimedAt);
  if (Number.isNaN(claimedMs)) return null;

  const reasons: string[] = [];
  let confidence = 0;

  // 1. Metadata timestamp gap.
  if (evidence.metadataCapturedAt) {
    const metaMs = Date.parse(evidence.metadataCapturedAt);
    if (!Number.isNaN(metaMs)) {
      const gapHours = Math.abs(metaMs - claimedMs) / 3_600_000;
      if (gapHours >= opts.metadataGapHours) {
        reasons.push(
          `media metadata timestamp differs from the claimed time by ~${Math.round(gapHours)}h ` +
            `(metadata can be edited or stripped — treat as a lead)`,
        );
        // scale: 12h→0.45 up to ~0.75 for very large gaps
        confidence = Math.max(confidence, Math.min(0.75, 0.45 + Math.log10(gapHours / opts.metadataGapHours + 1) * 0.3));
      }
    }
  }

  // 2. Sun-position / daylight contradiction.
  if (
    evidence.observedDaylight &&
    claim.lat !== undefined &&
    claim.lon !== undefined
  ) {
    const elev = solarElevationDeg(new Date(claimedMs), claim.lat, claim.lon);
    const expected = daylightFromElevation(elev);
    const observed = evidence.observedDaylight;
    // Only a hard day-vs-night mismatch is a contradiction; twilight is tolerated.
    const isHardMismatch =
      (expected === "day" && observed === "night") ||
      (expected === "night" && observed === "day");
    if (isHardMismatch) {
      reasons.push(
        `imagery appears to be ${observed}, but the claimed time/location implies ` +
          `${expected} (solar elevation ≈ ${elev.toFixed(0)}°)`,
      );
      confidence = Math.max(confidence, 0.65);
    }
  }

  if (reasons.length === 0) return null;

  // Multiple independent reasons nudge confidence up, capped at 0.8.
  if (reasons.length > 1) confidence = Math.min(0.8, confidence + 0.1);

  return {
    flag: "temporal_contradiction",
    confidence: parseFloat(confidence.toFixed(2)),
    explanation:
      `Timing appears inconsistent with the claim: ${reasons.join("; ")}. ` +
      `Surfaced for verification only; metadata and lighting are indicative, not conclusive.`,
  };
}
