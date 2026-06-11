/**
 * Sun angle / shadow analysis utilities.
 *
 * Given an image with visible shadows, estimate the sun's position
 * and cross-reference with solar ephemeris to constrain the capture
 * date, time, and location.
 *
 * Full implementation requires:
 *   1. Shadow direction extraction (CV model)
 *   2. Solar ephemeris lookup (e.g. SunCalc / NOAA)
 *   3. Geographic search over candidate locations
 */

export interface SunPosition {
  azimuth: number;   // degrees from north, clockwise
  elevation: number; // degrees above horizon
}

/** Compute sun position for a given location and UTC datetime. */
export function computeSunPosition(lat: number, lon: number, utcDate: Date): SunPosition {
  // Simplified solar position algorithm (Meeus, Astronomical Algorithms)
  // For production use SunCalc npm package or NOAA Solar Calculator

  const J2000 = 2451545.0;
  const jd = utcToJulianDay(utcDate);
  const n = jd - J2000;

  // Mean longitude and anomaly
  const L = (280.46 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * (Math.PI / 180);

  // Ecliptic longitude
  const lambda = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * (Math.PI / 180);

  // Obliquity
  const epsilon = 23.439 * (Math.PI / 180);

  // Right ascension and declination
  const sinDec = Math.sin(epsilon) * Math.sin(lambda);
  const dec = Math.asin(sinDec);

  // Hour angle
  const lstDeg = (100.4606 + 0.9856474 * n + lon + (utcDate.getUTCHours() + utcDate.getUTCMinutes() / 60) * 15) % 360;
  const ha = (lstDeg - (Math.atan2(Math.cos(epsilon) * Math.sin(lambda), Math.cos(lambda)) * 180 / Math.PI)) * (Math.PI / 180);

  const latRad = lat * (Math.PI / 180);

  // Altitude
  const sinAlt = Math.sin(latRad) * Math.sin(dec) + Math.cos(latRad) * Math.cos(dec) * Math.cos(ha);
  const elevation = Math.asin(sinAlt) * (180 / Math.PI);

  // Azimuth
  const cosAz = (Math.sin(dec) - Math.sin(latRad) * sinAlt) / (Math.cos(latRad) * Math.cos(Math.asin(sinAlt)));
  let azimuth = Math.acos(Math.min(1, Math.max(-1, cosAz))) * (180 / Math.PI);
  if (Math.sin(ha) > 0) azimuth = 360 - azimuth;

  return { azimuth, elevation };
}

function utcToJulianDay(d: Date): number {
  const Y = d.getUTCFullYear();
  const M = d.getUTCMonth() + 1;
  const D = d.getUTCDate() + (d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600) / 24;
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + D + B - 1524.5;
}

/**
 * Given a measured shadow azimuth (direction shadows point) and an image date,
 * find candidate locations where the sun would have been in the opposite direction.
 *
 * Returns up to `maxCandidates` lat/lon pairs with confidence scores.
 */
export function findCandidateLocations(
  shadowAzimuthDeg: number,
  date: Date,
  targetElevation: number,
  maxCandidates = 5,
  latRange: [number, number] = [44, 53], // Ukraine bounds
  lonRange: [number, number] = [22, 40],
  gridStepDeg = 0.5,
): Array<{ lat: number; lon: number; confidence: number }> {
  // Sun azimuth = shadow azimuth + 180 (shadows point away from sun)
  const sunAzimuth = (shadowAzimuthDeg + 180) % 360;

  const candidates: Array<{ lat: number; lon: number; confidence: number }> = [];

  for (let lat = latRange[0]; lat <= latRange[1]; lat += gridStepDeg) {
    for (let lon = lonRange[0]; lon <= lonRange[1]; lon += gridStepDeg) {
      const pos = computeSunPosition(lat, lon, date);
      const azError = Math.abs(((pos.azimuth - sunAzimuth + 180) % 360) - 180);
      const elevError = Math.abs(pos.elevation - targetElevation);
      if (azError < 10 && elevError < 5) {
        const confidence = 1 - (azError / 10 + elevError / 5) / 2;
        candidates.push({ lat: parseFloat(lat.toFixed(2)), lon: parseFloat(lon.toFixed(2)), confidence: parseFloat(confidence.toFixed(2)) });
      }
    }
  }

  return candidates
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, maxCandidates);
}
