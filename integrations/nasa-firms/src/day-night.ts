/**
 * Day/night differential correction for thermal anomaly scoring.
 *
 * During daytime, solar heating raises surface temperatures across large areas,
 * which can mask or exaggerate industrial / conflict-related thermal anomalies.
 * Nighttime thermal readings are more reliable for detecting localised hot spots
 * because solar background is absent.
 *
 * NOTES:
 * 1. Daytime solar heating (EN): daytime solar heating can mask industrial anomalies — apply a penalty to daytime scores.
 *    Daytime solar heating (UK): денний сонячний нагрів може маскувати промислові аномалії — застосовуйте штраф до денних оцінок.
 * 2. Nighttime accuracy (EN): nighttime thermal readings are more accurate for localised anomaly detection.
 *    Nighttime accuracy (UK): нічні теплові вимірювання точніші для виявлення локалізованих аномалій.
 */

export interface DayNightDifferential {
  lat: number;
  lng: number;
  /** ISO-8601 UTC */
  dateTime: string;
  isDaytime: boolean;
  /** Sun elevation in degrees (-90 to 90); negative = below horizon */
  sunElevation: number;
  /**
   * Adjustment factor to apply to a raw thermal anomaly score.
   * > 1.0 = boost (nighttime, more reliable)
   * < 1.0 = penalty (daytime, solar heating masks anomalies)
   */
  thermalAnomalyAdjustment: number;
}

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const DAY_NIGHT_THERMAL_NOTE_EN = [
  "Daytime solar heating: surface temperatures rise broadly during the day, masking localised industrial or conflict-related thermal anomalies; raw scores should be penalised.",
  "Nighttime thermal more accurate: absence of solar background makes nighttime FIRMS/SLSTR detections significantly more reliable for anomaly attribution.",
] as const;

export const DAY_NIGHT_THERMAL_NOTE_UK = [
  "Денний сонячний нагрів: температура поверхні зростає вдень по всій площі, маскуючи локалізовані промислові або конфліктні теплові аномалії; сирі оцінки потрібно штрафувати.",
  "Нічні теплові показники точніші: відсутність сонячного фону робить нічні виявлення FIRMS/SLSTR значно надійнішими для атрибуції аномалій.",
] as const;

// ── Solar elevation stub (reuses formula from sun-angle.ts) ───────────────────

function approximateSunElevation(lat: number, lng: number, dateTime: string): number {
  const dt = new Date(dateTime);
  const dayOfYear = Math.floor(
    (dt.getTime() - new Date(dt.getUTCFullYear(), 0, 0).getTime()) / 86_400_000,
  );
  const B = ((2 * Math.PI) / 365) * (dayOfYear - 1);
  const declDeg =
    (180 / Math.PI) *
    (0.006918 -
      0.399912 * Math.cos(B) +
      0.070257 * Math.sin(B) -
      0.006758 * Math.cos(2 * B) +
      0.000907 * Math.sin(2 * B));
  const decl = (declDeg * Math.PI) / 180;

  const utcHours = dt.getUTCHours() + dt.getUTCMinutes() / 60;
  const solarNoon = 12 - lng / 15;
  const hourAngleDeg = (utcHours - solarNoon) * 15;
  const hourAngle = (hourAngleDeg * Math.PI) / 180;

  const latRad = (lat * Math.PI) / 180;
  const sinElevation =
    Math.sin(latRad) * Math.sin(decl) +
    Math.cos(latRad) * Math.cos(decl) * Math.cos(hourAngle);
  return (Math.asin(Math.max(-1, Math.min(1, sinElevation))) * 180) / Math.PI;
}

/**
 * Compute the day/night differential for a given location and time.
 * Sun elevation > 0 ⟹ daytime; ≤ 0 ⟹ night.
 */
export function computeDayNightDifferential(
  lat: number,
  lng: number,
  dateTime: string,
): DayNightDifferential {
  const sunElevation = approximateSunElevation(lat, lng, dateTime);
  const isDaytime = sunElevation > 0;

  // Adjustment: nighttime → 1.2 boost; daytime scales from 1.0 (at horizon) down
  // to 0.7 when the sun is directly overhead (elevation 90°).
  let thermalAnomalyAdjustment: number;
  if (!isDaytime) {
    thermalAnomalyAdjustment = 1.2;
  } else {
    // Linear penalty: 0° elevation → 1.0, 90° elevation → 0.7
    thermalAnomalyAdjustment = Math.max(0.7, 1.0 - (sunElevation / 90) * 0.3);
  }

  return {
    lat,
    lng,
    dateTime,
    isDaytime,
    sunElevation: Math.round(sunElevation * 10) / 10,
    thermalAnomalyAdjustment: Math.round(thermalAnomalyAdjustment * 100) / 100,
  };
}

/**
 * Apply the day/night adjustment factor to a raw thermal anomaly score.
 * Result is clamped to [0, 1].
 */
export function adjustThermalScore(
  rawScore: number,
  differential: DayNightDifferential,
): number {
  return Math.max(0, Math.min(1, rawScore * differential.thermalAnomalyAdjustment));
}
