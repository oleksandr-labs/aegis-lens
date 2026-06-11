import type { ParsedCoord, LatLng } from "./types";

// ── Decimal degrees ───────────────────────────────────────────────────────────
// e.g. "48.1234, 37.5678" or "48.1234 37.5678"
const DECIMAL_RE = /^(-?\d{1,3}\.?\d*)[,\s]+(-?\d{1,3}\.?\d*)$/;

// ── DMS ──────────────────────────────────────────────────────────────────────
// e.g. "48°30'15.5\"N 37°45'00.0\"E"
const DMS_RE =
  /^(\d{1,3})[°\s](\d{1,2})['\s](\d{1,2}(?:\.\d+)?)["\s]?([NS])[,\s]+(\d{1,3})[°\s](\d{1,2})['\s](\d{1,2}(?:\.\d+)?)["\s]?([EW])$/i;

// ── UTM ───────────────────────────────────────────────────────────────────────
// e.g. "37T 600000 5330000"
const UTM_RE = /^(\d{1,2})([C-HJ-NP-X])\s+(\d{5,7})\s+(\d{6,7})$/i;

// ── MGRS ─────────────────────────────────────────────────────────────────────
// e.g. "37TDG 1234 5678" or "37TDG1234556789"
const MGRS_RE = /^(\d{1,2}[C-HJ-NP-X][A-HJ-NP-Z]{2})(\d{2,5})(\d{2,5})$/i;

function dmsToDecimal(deg: number, min: number, sec: number, dir: string): number {
  const decimal = deg + min / 60 + sec / 3600;
  return dir.toUpperCase() === "S" || dir.toUpperCase() === "W" ? -decimal : decimal;
}

/**
 * Parse UTM easting/northing to WGS-84.
 * Uses the simplified formula for zone origins; accurate to ~1m.
 */
function utmToLatLng(zone: number, band: string, easting: number, northing: number): LatLng {
  const a = 6378137.0;
  const f = 1 / 298.257223563;
  const b = a * (1 - f);
  const e2 = (a * a - b * b) / (a * a);
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  const k0 = 0.9996;

  const x = easting - 500000;
  const isSouthHemisphere = "CDEFGHJKLM".includes(band.toUpperCase());
  const y = isSouthHemisphere ? northing - 10000000 : northing;

  const lon0 = ((zone - 1) * 6 - 180 + 3) * (Math.PI / 180);
  const M = y / k0;
  const mu = M / (a * (1 - e2 / 4 - (3 * e2 ** 2) / 64 - (5 * e2 ** 3) / 256));

  const phi1 =
    mu +
    ((3 * e1) / 2 - (27 * e1 ** 3) / 32) * Math.sin(2 * mu) +
    ((21 * e1 ** 2) / 16 - (55 * e1 ** 4) / 32) * Math.sin(4 * mu) +
    ((151 * e1 ** 3) / 96) * Math.sin(6 * mu);

  const N1 = a / Math.sqrt(1 - e2 * Math.sin(phi1) ** 2);
  const T1 = Math.tan(phi1) ** 2;
  const C1 = (e2 / (1 - e2)) * Math.cos(phi1) ** 2;
  const R1 = (a * (1 - e2)) / (1 - e2 * Math.sin(phi1) ** 2) ** 1.5;
  const D = x / (N1 * k0);

  const lat =
    phi1 -
    ((N1 * Math.tan(phi1)) / R1) *
      (D ** 2 / 2 -
        ((5 + 3 * T1 + 10 * C1 - 4 * C1 ** 2 - 9 * (e2 / (1 - e2))) * D ** 4) / 24 +
        ((61 + 90 * T1 + 298 * C1 + 45 * T1 ** 2 - 252 * (e2 / (1 - e2)) - 3 * C1 ** 2) * D ** 6) / 720);

  const lng =
    lon0 +
    (D -
      ((1 + 2 * T1 + C1) * D ** 3) / 6 +
      ((5 - 2 * C1 + 28 * T1 - 3 * C1 ** 2 + 8 * (e2 / (1 - e2)) + 24 * T1 ** 2) * D ** 5) / 120) /
      Math.cos(phi1);

  return {
    lat: (lat * 180) / Math.PI,
    lng: (lng * 180) / Math.PI,
  };
}

/**
 * Parse a coordinate string in any supported format.
 * Returns null if the string cannot be parsed.
 */
export function parseCoordinate(input: string): ParsedCoord | null {
  const s = input.trim();

  // Decimal degrees
  const dec = DECIMAL_RE.exec(s);
  if (dec) {
    const lat = parseFloat(dec[1]);
    const lng = parseFloat(dec[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { point: { lat, lng }, format: "decimal", raw: s };
    }
  }

  // DMS
  const dms = DMS_RE.exec(s);
  if (dms) {
    const lat = dmsToDecimal(+dms[1], +dms[2], +dms[3], dms[4]);
    const lng = dmsToDecimal(+dms[5], +dms[6], +dms[7], dms[8]);
    return { point: { lat, lng }, format: "dms", raw: s };
  }

  // UTM
  const utm = UTM_RE.exec(s);
  if (utm) {
    const point = utmToLatLng(+utm[1], utm[2], +utm[3], +utm[4]);
    return { point, format: "utm", raw: s };
  }

  // MGRS — strip spaces, pad to 10-digit precision
  const mgrsClean = s.replace(/\s/g, "");
  const mgrs = MGRS_RE.exec(mgrsClean);
  if (mgrs) {
    const gzdSq = mgrs[1];
    const zone = parseInt(gzdSq.slice(0, 2), 10);
    const band = gzdSq[2];
    const digits = mgrs[2].length;
    const mult = Math.pow(10, 5 - digits);
    const easting = parseInt(mgrs[2], 10) * mult;
    const northing = parseInt(mgrs[3], 10) * mult;
    const point = utmToLatLng(zone, band, easting + 500000, northing);
    return { point, format: "mgrs", raw: s };
  }

  return null;
}
