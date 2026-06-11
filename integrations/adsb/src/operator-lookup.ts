/**
 * Operator + aircraft-type lookup.
 *
 * Two heuristic baselines:
 *   1. ICAO operator designator (from a parsed callsign) → airline name/country.
 *   2. ICAO type code → manufacturer/model/category (size class for icon scaling).
 *
 * In production these tables are backed by the OpenSky aircraft DB CSV and the
 * ICAO airline-designator register; here we ship a representative in-repo table
 * covering the UA region plus common operators, following the heuristic-table
 * contract used across the codebase.
 */

import type { AircraftTypeInfo } from "./aviation-types";
import { parseCallsign } from "./callsign-resolver";

export interface OperatorInfo {
  icao: string;
  name: string;
  country: string;
}

/** ICAO airline designator → operator. Representative subset. */
const OPERATOR_TABLE: Record<string, OperatorInfo> = {
  AUI: { icao: "AUI", name: "Ukraine International Airlines", country: "UA" },
  UKN: { icao: "UKN", name: "Ukraine National Airlines", country: "UA" },
  WND: { icao: "WND", name: "Windrose Airlines", country: "UA" },
  SDR: { icao: "SDR", name: "SkyUp Airlines", country: "UA" },
  AFL: { icao: "AFL", name: "Aeroflot", country: "RU" },
  THY: { icao: "THY", name: "Turkish Airlines", country: "TR" },
  LOT: { icao: "LOT", name: "LOT Polish Airlines", country: "PL" },
  WZZ: { icao: "WZZ", name: "Wizz Air", country: "HU" },
  RYR: { icao: "RYR", name: "Ryanair", country: "IE" },
  DLH: { icao: "DLH", name: "Lufthansa", country: "DE" },
  BAW: { icao: "BAW", name: "British Airways", country: "GB" },
  ABW: { icao: "ABW", name: "AirBridgeCargo", country: "RU" },
  GTI: { icao: "GTI", name: "Atlas Air", country: "US" },
};

/** ICAO type code → aircraft type info. Representative subset. */
const TYPE_TABLE: Record<string, AircraftTypeInfo> = {
  A320: { typeCode: "A320", manufacturer: "Airbus", model: "A320", category: "passenger", sizeClass: "medium" },
  A321: { typeCode: "A321", manufacturer: "Airbus", model: "A321", category: "passenger", sizeClass: "medium" },
  A359: { typeCode: "A359", manufacturer: "Airbus", model: "A350-900", category: "passenger", sizeClass: "heavy" },
  B738: { typeCode: "B738", manufacturer: "Boeing", model: "737-800", category: "passenger", sizeClass: "medium" },
  B77W: { typeCode: "B77W", manufacturer: "Boeing", model: "777-300ER", category: "passenger", sizeClass: "heavy" },
  B744: { typeCode: "B744", manufacturer: "Boeing", model: "747-400", category: "cargo", sizeClass: "heavy" },
  A124: { typeCode: "A124", manufacturer: "Antonov", model: "An-124 Ruslan", category: "cargo", sizeClass: "heavy" },
  AN26: { typeCode: "AN26", manufacturer: "Antonov", model: "An-26", category: "cargo", sizeClass: "medium" },
  C30J: { typeCode: "C30J", manufacturer: "Lockheed", model: "C-130J Hercules", category: "military", sizeClass: "heavy" },
  RQ4: { typeCode: "RQ4", manufacturer: "Northrop Grumman", model: "RQ-4 Global Hawk", category: "drone", sizeClass: "medium" },
  E3TF: { typeCode: "E3TF", manufacturer: "Boeing", model: "E-3 Sentry AWACS", category: "military", sizeClass: "heavy" },
  H60: { typeCode: "H60", manufacturer: "Sikorsky", model: "UH-60 Black Hawk", category: "helicopter", sizeClass: "rotor" },
};

/** Resolve an ICAO operator designator to an operator record. */
export function lookupOperator(operatorIcao: string | null): OperatorInfo | null {
  if (!operatorIcao) return null;
  return OPERATOR_TABLE[operatorIcao.toUpperCase()] ?? null;
}

/** Resolve an operator directly from a raw callsign. */
export function lookupOperatorFromCallsign(callsign: string | null): OperatorInfo | null {
  const parts = parseCallsign(callsign);
  return lookupOperator(parts?.operatorIcao ?? null);
}

/** Resolve an ICAO type code to aircraft type info. */
export function lookupType(typeCode: string | null): AircraftTypeInfo | null {
  if (!typeCode) return null;
  const tc = typeCode.toUpperCase();
  if (TYPE_TABLE[tc]) return TYPE_TABLE[tc];
  // Prefix fallback (e.g. "B738" partial, "H60M" → "H60").
  for (const key of Object.keys(TYPE_TABLE)) {
    if (tc.startsWith(key)) return TYPE_TABLE[key];
  }
  return null;
}
