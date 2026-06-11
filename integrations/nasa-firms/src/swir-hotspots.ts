/**
 * Sentinel-2 SWIR-band hot-spot derivation.
 *
 * Sentinel-2 carries short-wave infrared (SWIR) bands — B11 (~1.61 µm) and
 * B12 (~2.19 µm) — that are sensitive to high-temperature combustion. A simple,
 * widely used baseline (Murphy et al. 2016 "HOTMAP") flags a pixel as a hot-spot
 * when the SWIR bands are anomalously bright relative to the near-infrared (NIR,
 * B8) and to a regional background.
 *
 * IMPORTANT: this is a *heuristic radiance threshold model*, NOT a calibrated fire
 * product. It depends on a Sentinel Hub (or equivalent) integration to actually
 * fetch B8/B11/B12 reflectance — that data fetch is NOT implemented here (no
 * Sentinel Hub credentials in this repo). This module provides the typed contract
 * + the per-pixel decision logic so that a Sentinel Hub client can feed it later.
 *
 * Resolution: B11/B12 are 20 m. Sentinel-2 revisit ~5 days (2-sat constellation),
 * so this is good for confirmation / burn extent, NOT near-real-time detection.
 */

export interface Sentinel2PixelReflectance {
  /** Pixel centre latitude */
  latitude: number;
  /** Pixel centre longitude */
  longitude: number;
  /** B8 NIR top-of-atmosphere reflectance (0–1) */
  nir: number;
  /** B11 SWIR-1 (~1.61 µm) reflectance (0–1) */
  swir1: number;
  /** B12 SWIR-2 (~2.19 µm) reflectance (0–1) */
  swir2: number;
  /** Acquisition time, ISO-8601 UTC */
  acquired_at: string;
}

export interface SWIRHotspotThresholds {
  /** Absolute SWIR-2 reflectance floor for a candidate (typ. 0.15). */
  swir2Floor: number;
  /** Minimum SWIR-2 / NIR ratio (combustion is far brighter in SWIR). */
  swir2NirRatio: number;
  /** Minimum SWIR-2 / SWIR-1 ratio (hotter fires skew toward B12). */
  swir2Swir1Ratio: number;
}

/** Conservative defaults adapted from the HOTMAP unmixing heuristic. */
export const DEFAULT_SWIR_THRESHOLDS: SWIRHotspotThresholds = {
  swir2Floor: 0.15,
  swir2NirRatio: 1.4,
  swir2Swir1Ratio: 1.0,
};

export interface SWIRHotspot {
  latitude: number;
  longitude: number;
  acquired_at: string;
  /** 0–1 heuristic strength: how far above threshold the pixel sits. */
  intensity: number;
  /** Heuristic confidence (0–1) — deliberately capped; not a calibrated product. */
  confidence: number;
  source: "sentinel2_swir";
}

/**
 * Returns true if the pixel passes the SWIR hot-spot heuristic.
 * Pure function — no I/O — so it can be unit-tested without Sentinel Hub.
 */
export function isSWIRHotspot(
  px: Sentinel2PixelReflectance,
  thresholds: SWIRHotspotThresholds = DEFAULT_SWIR_THRESHOLDS,
): boolean {
  if (px.swir2 < thresholds.swir2Floor) return false;
  const nir = px.nir > 0 ? px.nir : 1e-6;
  const swir1 = px.swir1 > 0 ? px.swir1 : 1e-6;
  if (px.swir2 / nir < thresholds.swir2NirRatio) return false;
  if (px.swir2 / swir1 < thresholds.swir2Swir1Ratio) return false;
  return true;
}

/**
 * Derive hot-spots from a tile of Sentinel-2 SWIR reflectance pixels.
 * Confidence is intentionally conservative (max ~0.75) because SWIR hot-spots
 * also fire on flares, sun-glint and hot bare soil.
 */
export function deriveSWIRHotspots(
  pixels: Sentinel2PixelReflectance[],
  thresholds: SWIRHotspotThresholds = DEFAULT_SWIR_THRESHOLDS,
): SWIRHotspot[] {
  const out: SWIRHotspot[] = [];
  for (const px of pixels) {
    if (!isSWIRHotspot(px, thresholds)) continue;
    const nir = px.nir > 0 ? px.nir : 1e-6;
    const ratio = px.swir2 / nir;
    // Normalise how far above the ratio threshold we are, clamp to 0–1.
    const intensity = Math.max(0, Math.min((ratio - thresholds.swir2NirRatio) / 3, 1));
    out.push({
      latitude: px.latitude,
      longitude: px.longitude,
      acquired_at: px.acquired_at,
      intensity,
      confidence: Math.min(0.4 + intensity * 0.35, 0.75),
      source: "sentinel2_swir",
    });
  }
  return out;
}
