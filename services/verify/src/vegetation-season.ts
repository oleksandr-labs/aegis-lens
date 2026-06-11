/**
 * Vegetation and seasonal consistency check.
 *
 * Compares the detected vegetation state in an image against the expected
 * seasonal state for the claimed month and latitude band.
 * A winter scene in a claimed July image is a strong inconsistency signal.
 *
 * NOTES:
 * 1. NDVI (EN): NDVI satellite baseline can confirm vegetation state at a claimed location.
 *    NDVI (UK): Базова лінія NDVI зі супутника може підтвердити стан рослинності на заявленому місці.
 * 2. Climate zone (EN): expected vegetation is climate-zone-aware (temperate Northern Europe baseline).
 *    Climate zone (UK): очікувана рослинність враховує кліматичну зону (базова лінія — помірна Північна Європа).
 */

export type VegetationState =
  | "winter_bare"      // trees leafless, ground may be snow-covered
  | "spring_green"     // fresh leaves, light green, low canopy density
  | "summer_full"      // full canopy, dense dark green
  | "autumn_turning";  // yellowing / reddening foliage, mixed colours

export interface SeasonalConsistencyResult {
  imageUrl: string;
  /** Vegetation state detected in the image */
  detectedVegetation: VegetationState;
  /** Vegetation state expected for the claimed month + latitude */
  expectedForMonthLat: VegetationState;
  consistent: boolean;
  /** 0–1 */
  consistencyScore: number;
}

// ── Expected vegetation lookup table ─────────────────────────────────────────
// Northern Europe (lat > 40°N) baseline. Rows: month (1–12). Bands: 'high' ≥55°N, 'mid' 40–55°N.

export const EXPECTED_VEGETATION_BY_MONTH: Record<
  number,
  Record<"high" | "mid", VegetationState>
> = {
  1:  { high: "winter_bare",    mid: "winter_bare" },
  2:  { high: "winter_bare",    mid: "winter_bare" },
  3:  { high: "winter_bare",    mid: "spring_green" },
  4:  { high: "spring_green",   mid: "spring_green" },
  5:  { high: "spring_green",   mid: "summer_full" },
  6:  { high: "summer_full",    mid: "summer_full" },
  7:  { high: "summer_full",    mid: "summer_full" },
  8:  { high: "summer_full",    mid: "summer_full" },
  9:  { high: "autumn_turning", mid: "autumn_turning" },
  10: { high: "autumn_turning", mid: "autumn_turning" },
  11: { high: "winter_bare",    mid: "winter_bare" },
  12: { high: "winter_bare",    mid: "winter_bare" },
};

/**
 * Return the expected vegetation state for a given month (1–12) and latitude.
 * Baseline: Northern Europe temperate zone.
 */
export function getExpectedVegetation(monthOfYear: number, lat: number): VegetationState {
  const row = EXPECTED_VEGETATION_BY_MONTH[monthOfYear];
  if (!row) return "summer_full"; // fallback
  const band: "high" | "mid" = lat >= 55 ? "high" : "mid";
  return row[band];
}

/** Vegetation state ordering for distance calculation. */
const VEGETATION_ORDER: VegetationState[] = [
  "winter_bare",
  "spring_green",
  "summer_full",
  "autumn_turning",
];

/**
 * Compute a consistency score (0–1).
 * Exact match → 1.0. Adjacent state → 0.5. Opposite state → 0.0.
 */
export function checkVegetationSeasonConsistency(
  detected: VegetationState,
  expected: VegetationState,
): number {
  if (detected === expected) return 1.0;
  const di = VEGETATION_ORDER.indexOf(detected);
  const ei = VEGETATION_ORDER.indexOf(expected);
  const diff = Math.abs(di - ei);
  // diff 1 → 0.5, diff 2 → 0.25, diff 3 → 0.0
  return Math.max(0, 1 - diff * 0.5);
}

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const VEGETATION_SEASON_NOTES_EN = [
  "NDVI satellite baseline: Sentinel-2 NDVI composites can confirm the actual vegetation state at the claimed location and date.",
  "Climate-zone-aware: the lookup table uses a temperate Northern Europe baseline; tropical / arid zones require separate tables.",
] as const;

export const VEGETATION_SEASON_NOTES_UK = [
  "Базова лінія NDVI: NDVI-композити Sentinel-2 підтверджують фактичний стан рослинності на заявленому місці та даті.",
  "Кліматична зона: таблиця підстановки базується на помірній Північній Європі; тропічні / посушливі зони потребують окремих таблиць.",
] as const;
