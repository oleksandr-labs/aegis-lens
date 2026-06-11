/**
 * Callsign / hex code resolution.
 *
 * - Normalises raw ADS-B callsign strings.
 * - Resolves the ICAO 24-bit hex address to a country of registration using the
 *   published ICAO address-block allocations (public, RTF Annex 10).
 * - Splits an airline-style callsign into a 3-letter ICAO operator designator
 *   plus a flight number.
 *
 * Heuristic / lookup baseline — no external API calls. Mirrors the
 * keyword-table contract used elsewhere in the repo.
 */

export interface CallsignParts {
  /** Raw, trimmed callsign. */
  raw: string;
  /** 3-letter ICAO airline designator if the callsign looks airline-formatted. */
  operatorIcao: string | null;
  /** Flight number portion (digits/suffix) if present. */
  flightNumber: string | null;
  /** True when the callsign is a tail/registration rather than airline format. */
  isRegistrationStyle: boolean;
}

/**
 * ICAO 24-bit address country blocks (subset covering UA region + majors).
 * Each block is [min, max] inclusive of the 24-bit hex value, plus ISO country.
 * Source: ICAO Annex 10 Vol III, public address allocation tables.
 */
const ICAO_COUNTRY_BLOCKS: Array<{ min: number; max: number; country: string }> = [
  { min: 0x508000, max: 0x50ffff, country: "UA" }, // Ukraine
  { min: 0x140000, max: 0x1bffff, country: "RU" }, // Russian Federation
  { min: 0x489000, max: 0x489fff, country: "PL" }, // Poland (sub-block)
  { min: 0x480000, max: 0x487fff, country: "NL" }, // Netherlands
  { min: 0x4ba000, max: 0x4bafff, country: "TR" }, // Turkey
  { min: 0x4d0000, max: 0x4d03ff, country: "MD" }, // Moldova
  { min: 0x500000, max: 0x5003ff, country: "SK" }, // Slovakia
  { min: 0x46c000, max: 0x46ffff, country: "HU" }, // Hungary (region)
  { min: 0x3c0000, max: 0x3fffff, country: "DE" }, // Germany
  { min: 0x400000, max: 0x43ffff, country: "GB" }, // United Kingdom
  { min: 0xa00000, max: 0xafffff, country: "US" }, // United States
];

/** Resolve an ICAO24 hex address to an ISO country of registration. */
export function resolveHexCountry(icao24: string): string | null {
  const n = parseInt(icao24, 16);
  if (Number.isNaN(n)) return null;
  for (const block of ICAO_COUNTRY_BLOCKS) {
    if (n >= block.min && n <= block.max) return block.country;
  }
  return null;
}

/** Normalise a raw callsign: trim, uppercase, strip non-alphanumerics. */
export function normaliseCallsign(callsign: string | null): string | null {
  if (!callsign) return null;
  const cleaned = callsign.replace(/[^A-Za-z0-9-]/g, "").trim().toUpperCase();
  return cleaned.length ? cleaned : null;
}

const AIRLINE_RE = /^([A-Z]{3})(\d{1,4}[A-Z]?)$/;
const REG_RE = /^[A-Z]{1,2}-?[A-Z0-9]{2,5}$/; // e.g. UR-PSA, N12345, D-ABCD

/** Parse a callsign into operator designator + flight number. */
export function parseCallsign(callsign: string | null): CallsignParts | null {
  const raw = normaliseCallsign(callsign);
  if (!raw) return null;

  const airline = AIRLINE_RE.exec(raw);
  if (airline) {
    return {
      raw,
      operatorIcao: airline[1],
      flightNumber: airline[2],
      isRegistrationStyle: false,
    };
  }

  return {
    raw,
    operatorIcao: null,
    flightNumber: null,
    isRegistrationStyle: REG_RE.test(raw),
  };
}
