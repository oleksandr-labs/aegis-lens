/**
 * Privacy: redaction policy for private-individual aircraft tracking.
 *
 * Even though ADS-B is public, responsible OSINT practice (and several legal
 * regimes) requires not amplifying the tracking of private individuals. This
 * module implements a configurable redaction policy that:
 *
 *   - blocks/redacts aircraft on the FAA LADD (Limiting Aircraft Data Displayed)
 *     and PIA (Privacy ICAO Address) program ranges,
 *   - redacts general-aviation "private" category aircraft by default,
 *   - always retains state / military / commercial / emergency flights, which
 *     are of legitimate public-interest for this product.
 *
 * Redaction strips identifying fields (registration, callsign, owner, operator)
 * while optionally retaining a coarse position for situational awareness.
 */

import type { AviationTrack } from "./aviation-types";
import { detectEmergency } from "./mil-estimation";

export interface PrivacyPolicy {
  /** Redact aircraft of category "private". */
  redactPrivateCategory: boolean;
  /** Redact aircraft in the PIA anonymous-address program range. */
  redactPIA: boolean;
  /** ICAO24 hex addresses explicitly opted out (FAA LADD list). */
  laddBlocklist: Set<string>;
  /** Keep a coarse (rounded) position on redacted tracks instead of dropping it. */
  retainCoarsePosition: boolean;
  /** Decimal places to round coarse positions to (≈1.1 km at 2 dp). */
  coarsePrecision: number;
}

export const DEFAULT_PRIVACY_POLICY: PrivacyPolicy = {
  redactPrivateCategory: true,
  redactPIA: true,
  laddBlocklist: new Set<string>(),
  retainCoarsePosition: true,
  coarsePrecision: 2,
};

/**
 * FAA PIA (Privacy ICAO Address) program block.
 * PIA temporary addresses are drawn from a published US range.
 * Source: FAA PIA program documentation (public).
 */
const PIA_RANGE = { min: 0xa00000, max: 0xa00fff };

export function isPIA(icao24: string): boolean {
  const n = parseInt(icao24, 16);
  if (Number.isNaN(n)) return false;
  return n >= PIA_RANGE.min && n <= PIA_RANGE.max;
}

/** Decide whether a track must be redacted under the given policy. */
export function shouldRedact(track: AviationTrack, policy: PrivacyPolicy = DEFAULT_PRIVACY_POLICY): boolean {
  // Public-interest categories are never redacted.
  if (track.category === "military" || track.category === "cargo") return false;
  if (track.militaryEstimate?.value) return false;
  if (detectEmergency(track.squawk)) return false;

  if (policy.laddBlocklist.has(track.icao24.toLowerCase())) return true;
  if (policy.redactPIA && isPIA(track.icao24)) return true;
  if (policy.redactPrivateCategory && track.category === "private") return true;
  return false;
}

function roundTo(value: number, dp: number): number {
  const f = Math.pow(10, dp);
  return Math.round(value * f) / f;
}

/**
 * Apply the privacy policy to a track, returning a (possibly redacted) copy.
 * Identifying fields are stripped; bilingual title is replaced with a neutral
 * "Private aircraft (redacted)" label.
 */
export function applyPrivacy(track: AviationTrack, policy: PrivacyPolicy = DEFAULT_PRIVACY_POLICY): AviationTrack {
  if (!shouldRedact(track, policy)) return track;

  const position = policy.retainCoarsePosition
    ? {
        ...track.position,
        lat: roundTo(track.position.lat, policy.coarsePrecision),
        lon: roundTo(track.position.lon, policy.coarsePrecision),
      }
    : { ...track.position, lat: NaN, lon: NaN };

  return {
    ...track,
    callsign: null,
    registration: null,
    typeCode: null,
    model: null,
    operator: null,
    countryOfRegistration: null,
    squawk: null,
    position,
    redacted: true,
    title: {
      en: "Private aircraft (redacted)",
      uk: "Приватне судно (приховано)",
    },
  };
}

/** Convenience: redact an array of tracks in place-safe (returns new array). */
export function applyPrivacyToAll(tracks: AviationTrack[], policy: PrivacyPolicy = DEFAULT_PRIVACY_POLICY): AviationTrack[] {
  return tracks.map((t) => applyPrivacy(t, policy));
}
