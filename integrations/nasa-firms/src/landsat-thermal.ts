/**
 * Landsat 8/9 thermal-band (TIRS) brightness-temperature model.
 *
 * Landsat 8/9 carry the Thermal Infrared Sensor (TIRS) with Band 10 (~10.9 µm)
 * and Band 11 (~12.0 µm), delivered at 100 m (resampled to 30 m). USGS Level-1
 * products are quantised digital numbers (DN); converting to at-sensor
 * brightness temperature is a standard two-step model:
 *
 *   1. DN → top-of-atmosphere spectral radiance:
 *        Lλ = ML * DN + AL          (RADIANCE_MULT_BAND_x / RADIANCE_ADD_BAND_x)
 *   2. radiance → at-sensor brightness temperature (K):
 *        T  = K2 / ln(K1 / Lλ + 1)  (K1_CONSTANT_BAND_x / K2_CONSTANT_BAND_x)
 *
 * Those coefficients live in the scene MTL metadata. We implement the math and a
 * typed interface; supplying real MTL coefficients + the raster is the caller's
 * job (no Landsat raster pipeline in this repo).
 *
 * NOTE: this yields AT-SENSOR brightness temperature, NOT land-surface
 * temperature — no atmospheric or emissivity correction is applied. Band 11 also
 * has a known stray-light issue; USGS recommends Band 10 for single-band work.
 * Don't overclaim precision.
 */

export type LandsatThermalBand = "B10" | "B11";

/** Per-band radiometric rescaling + thermal constants from the scene MTL. */
export interface LandsatMTLCoefficients {
  /** RADIANCE_MULT_BAND_x */
  radianceMult: number;
  /** RADIANCE_ADD_BAND_x */
  radianceAdd: number;
  /** K1_CONSTANT_BAND_x */
  k1: number;
  /** K2_CONSTANT_BAND_x */
  k2: number;
}

/** Nominal coefficients for Landsat 8 TIRS (typical MTL values; override per-scene). */
export const LANDSAT8_NOMINAL: Record<LandsatThermalBand, LandsatMTLCoefficients> = {
  B10: { radianceMult: 3.342e-4, radianceAdd: 0.1, k1: 774.8853, k2: 1321.0789 },
  B11: { radianceMult: 3.342e-4, radianceAdd: 0.1, k1: 480.8883, k2: 1201.1442 },
};

export interface LandsatThermalPixel {
  latitude: number;
  longitude: number;
  band: LandsatThermalBand;
  /** Raw quantised digital number from the Level-1 product. */
  dn: number;
  /** Acquisition time, ISO-8601 UTC. */
  acquired_at: string;
}

export interface LandsatBrightnessTemperature {
  latitude: number;
  longitude: number;
  band: LandsatThermalBand;
  /** At-sensor spectral radiance (W·m⁻²·sr⁻¹·µm⁻¹). */
  radiance: number;
  /** At-sensor brightness temperature in Kelvin. */
  brightnessK: number;
  /** Convenience: °C. */
  brightnessC: number;
  acquired_at: string;
  source: "landsat_tirs";
}

/** Step 1: DN → top-of-atmosphere spectral radiance. */
export function dnToRadiance(dn: number, c: LandsatMTLCoefficients): number {
  return c.radianceMult * dn + c.radianceAdd;
}

/** Step 2: radiance → at-sensor brightness temperature (Kelvin). */
export function radianceToBrightnessK(radiance: number, c: LandsatMTLCoefficients): number {
  if (radiance <= 0) return NaN;
  return c.k2 / Math.log(c.k1 / radiance + 1);
}

/**
 * Convert one thermal pixel to brightness temperature.
 * Pass scene-specific coefficients when available; falls back to Landsat-8
 * nominal values otherwise (flag this to users — nominal is approximate).
 */
export function brightnessTemperatureFor(
  px: LandsatThermalPixel,
  coeffs?: LandsatMTLCoefficients,
): LandsatBrightnessTemperature {
  const c = coeffs ?? LANDSAT8_NOMINAL[px.band];
  const radiance = dnToRadiance(px.dn, c);
  const brightnessK = radianceToBrightnessK(radiance, c);
  return {
    latitude: px.latitude,
    longitude: px.longitude,
    band: px.band,
    radiance,
    brightnessK,
    brightnessC: brightnessK - 273.15,
    acquired_at: px.acquired_at,
    source: "landsat_tirs",
  };
}

/** Batch convert, dropping pixels that produce a non-finite temperature. */
export function computeLandsatThermal(
  pixels: LandsatThermalPixel[],
  coeffsByBand?: Partial<Record<LandsatThermalBand, LandsatMTLCoefficients>>,
): LandsatBrightnessTemperature[] {
  const out: LandsatBrightnessTemperature[] = [];
  for (const px of pixels) {
    const bt = brightnessTemperatureFor(px, coeffsByBand?.[px.band]);
    if (Number.isFinite(bt.brightnessK)) out.push(bt);
  }
  return out;
}
