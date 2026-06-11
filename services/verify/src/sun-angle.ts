/**
 * Solar position and shadow-direction consistency checks.
 *
 * Computes the expected sun azimuth and elevation for a given lat/lng/datetime,
 * then compares against a shadow direction extracted (or manually annotated)
 * from an image to flag inconsistencies.
 *
 * NOTES:
 * 1. suncalc (EN): suncalc npm library provides solar position with <1° accuracy.
 *    suncalc (UK): npm-бібліотека suncalc обчислює положення Сонця з точністю <1°.
 * 2. Shadow direction (EN): shadow azimuth is manually annotated or CV-estimated from image.
 *    Shadow direction (UK): азимут тіні анотується вручну або визначається CV-моделлю.
 * 3. Automated shadow detection (EN): automated CV shadow-detection model is planned (Phase 3).
 *    Automated shadow detection (UK): автоматична CV-модель виявлення тіней запланована (Фаза 3).
 */

export interface SunAngleData {
  /** ISO-8601 UTC */
  dateTime: string;
  lat: number;
  lng: number;
  /** Degrees clockwise from North (0–360) */
  sunAzimuth: number;
  /** Degrees above horizon (-90 to 90) */
  sunElevation: number;
  /** Shadow falls opposite to sun: (sunAzimuth + 180) % 360 */
  shadowDirection: number;
}

export interface ShadowConsistencyResult {
  imageUrl: string;
  claimedLocation: { lat: number; lng: number };
  /** ISO-8601 claimed capture date/time */
  claimedDate?: string;
  /** Sun azimuth at claimed location/time */
  estimatedSunAzimuth?: number;
  /** Shadow azimuth extracted or annotated from the image */
  shadowAzimuthFromImage?: number;
  /** 0–1 — higher = more consistent */
  consistencyScore: number;
  inconsistent: boolean;
}

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const SOLAR_POSITION_NOTES_EN = [
  "suncalc npm library: computes solar azimuth + elevation with sub-degree accuracy for any lat/lng/datetime.",
  "Shadow direction: manually annotated by analysts or estimated by a CV model from cast-shadow geometry.",
  "Automated shadow detection: a computer-vision model for automated shadow-direction extraction is planned for Phase 3.",
] as const;

export const SOLAR_POSITION_NOTES_UK = [
  "Бібліотека suncalc: обчислює сонячний азимут та висоту з точністю менше градуса для будь-яких координат/часу.",
  "Напрям тіні: анотується аналітиками вручну або визначається CV-моделлю за геометрією тіней.",
  "Автоматичне виявлення тіней: CV-модель для автоматичного визначення азимуту тіней запланована для Фази 3.",
] as const;

// ── Solar position stub ────────────────────────────────────────────────────────

/**
 * Compute approximate sun position using the Spencer formula.
 * For production accuracy use the suncalc npm library.
 */
export function computeSunPosition(lat: number, lng: number, dateTime: string): SunAngleData {
  const dt = new Date(dateTime);
  const dayOfYear =
    Math.floor(
      (dt.getTime() - new Date(dt.getUTCFullYear(), 0, 0).getTime()) / 86_400_000,
    );

  // Hour angle: solar noon at lng=0 is 12:00 UTC
  const utcHours = dt.getUTCHours() + dt.getUTCMinutes() / 60;
  const solarNoon = 12 - lng / 15;
  const hourAngleDeg = (utcHours - solarNoon) * 15;
  const hourAngle = (hourAngleDeg * Math.PI) / 180;

  // Declination (Spencer, 1971)
  const B = ((2 * Math.PI) / 365) * (dayOfYear - 1);
  const declDeg =
    (180 / Math.PI) *
    (0.006918 -
      0.399912 * Math.cos(B) +
      0.070257 * Math.sin(B) -
      0.006758 * Math.cos(2 * B) +
      0.000907 * Math.sin(2 * B));
  const decl = (declDeg * Math.PI) / 180;

  const latRad = (lat * Math.PI) / 180;

  // Elevation
  const sinElevation =
    Math.sin(latRad) * Math.sin(decl) +
    Math.cos(latRad) * Math.cos(decl) * Math.cos(hourAngle);
  const elevation = (Math.asin(Math.max(-1, Math.min(1, sinElevation))) * 180) / Math.PI;

  // Azimuth
  const cosAzimuth =
    (Math.sin(decl) - Math.sin(latRad) * sinElevation) /
    (Math.cos(latRad) * Math.cos(Math.asin(sinElevation)));
  let azimuth = (Math.acos(Math.max(-1, Math.min(1, cosAzimuth))) * 180) / Math.PI;
  if (Math.sin(hourAngle) > 0) azimuth = 360 - azimuth;

  const shadowDirection = (azimuth + 180) % 360;

  return {
    dateTime,
    lat,
    lng,
    sunAzimuth: Math.round(azimuth * 10) / 10,
    sunElevation: Math.round(elevation * 10) / 10,
    shadowDirection: Math.round(shadowDirection * 10) / 10,
  };
}

/**
 * Compute consistency score (0–1) between expected shadow direction and observed shadow.
 * Angular difference is mapped linearly: 0° diff → 1.0, 90°+ diff → 0.0.
 */
export function computeShadowConsistency(
  sun: SunAngleData,
  observedShadow?: number,
): number {
  if (observedShadow === undefined) return 0.5; // no observation — neutral
  if (sun.sunElevation <= 0) return 0.5;       // night / below horizon — can't evaluate

  const diff = Math.abs(sun.shadowDirection - observedShadow);
  const angularDiff = Math.min(diff, 360 - diff); // take the shorter arc
  return Math.max(0, 1 - angularDiff / 90);
}
