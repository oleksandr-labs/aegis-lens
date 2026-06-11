/**
 * Military / restricted-area flight estimation (where lawfully derivable).
 *
 * Heuristic, OSINT-only baseline — NOT an authoritative identification.
 * Every result carries a confidence score and a human-readable reason set,
 * mirroring the keyword-heuristic contract used in
 * `integrations/missiles/src/classifier.ts`.
 *
 * Signals used (all from public ADS-B / OpenSky fields):
 *   - emergency squawk codes 7500 / 7600 / 7700
 *   - published military ICAO hex blocks (see aircraft-db MILITARY_HEX_RANGES)
 *   - military callsign patterns (NATO / national tactical prefixes)
 *   - ADS-B coverage gaps near known restricted zones (handled by airspace.ts)
 */

import type { AircraftState } from "./types";
import { inferMilitary } from "./aircraft-db";

/** ICAO emergency squawk codes. */
export const EMERGENCY_SQUAWKS: Record<string, "hijack" | "radio_failure" | "general"> = {
  "7500": "hijack",
  "7600": "radio_failure",
  "7700": "general",
};

/**
 * Military callsign prefixes (public, widely documented).
 * Matched case-insensitively against the trimmed callsign.
 */
const MILITARY_CALLSIGN_PREFIXES: string[] = [
  // NATO / coalition tactical
  "RCH",   // US Air Mobility Command "Reach"
  "RRR",   // RAF "Ascot"
  "CFC",   // Canadian Forces
  "NATO",  // NATO AWACS
  "FORTE", // RQ-4 Global Hawk
  "HOMER", // US recon
  "REDEYE",
  "PYTHON",
  "DUKE",
  // Ukrainian Air Force tactical (publicly observed)
  "UAF",
  "RADAR",
  // Generic military air-arm tokens
  "AIRFORCE",
  "ARMY",
  "NAVY",
];

export interface MilitaryEstimate {
  isMilitary: boolean;
  confidence: number;
  /** Country guess from hex block, if any. */
  country: string | null;
  /** Human-readable signals that fired (for transparency / audit). */
  reasons: string[];
  /** Squawk-derived emergency condition, if any. */
  emergency: "hijack" | "radio_failure" | "general" | null;
}

/** Detect an emergency condition from the squawk code. */
export function detectEmergency(squawk: string | null): "hijack" | "radio_failure" | "general" | null {
  if (!squawk) return null;
  return EMERGENCY_SQUAWKS[squawk.trim()] ?? null;
}

/** Detect a military callsign pattern. */
export function matchMilitaryCallsign(callsign: string | null): string | null {
  if (!callsign) return null;
  const cs = callsign.trim().toUpperCase();
  for (const prefix of MILITARY_CALLSIGN_PREFIXES) {
    if (cs.startsWith(prefix)) return prefix;
  }
  return null;
}

/**
 * Estimate whether a track is a military flight, combining all public signals.
 * Confidence is additive-but-capped; hex-block membership is the strongest signal.
 */
export function estimateMilitary(state: AircraftState): MilitaryEstimate {
  const reasons: string[] = [];
  let confidence = 0;
  let country: string | null = null;

  const hex = inferMilitary(state.icao24);
  if (hex.is_military) {
    confidence += 0.7;
    country = hex.country;
    reasons.push(`ICAO hex ${state.icao24} in published military block (${hex.country})`);
  }

  const csPrefix = matchMilitaryCallsign(state.callsign);
  if (csPrefix) {
    confidence += 0.45;
    reasons.push(`military callsign prefix "${csPrefix}"`);
  }

  const emergency = detectEmergency(state.squawk);
  if (emergency) {
    // An emergency squawk does not by itself imply military, but it elevates
    // operational interest; record it without forcing the military verdict.
    reasons.push(`emergency squawk ${state.squawk} (${emergency})`);
  }

  // Absence of a callsign on a non-grounded, transponding aircraft is a weak
  // additional signal frequently seen with state / military flights.
  if (!state.callsign && !state.on_ground) {
    confidence += 0.1;
    reasons.push("airborne with suppressed callsign");
  }

  const capped = Math.min(0.97, parseFloat(confidence.toFixed(2)));
  return {
    isMilitary: capped >= 0.5,
    confidence: capped,
    country,
    reasons,
    emergency,
  };
}
