/**
 * Sentinel-3 SLSTR thermal-band ingestion adapter.
 *
 * SLSTR (Sea and Land Surface Temperature Radiometer) on Sentinel-3 provides
 * thermal-IR channels S7 (3.74 µm), S8 (10.85 µm) and S9 (12.0 µm), plus the
 * dedicated fire channels F1/F2. Nadir resolution is ~1 km for the thermal
 * bands — COARSE. We ingest already-decoded brightness temperatures and
 * normalise them to a typed thermal-band record.
 *
 * The actual product download (NetCDF/SAFE from Copernicus Data Space) is NOT
 * implemented — no Copernicus credentials here. This adapter defines the typed
 * contract and the normalisation, matching the FIRMS client/adapter shape so a
 * Copernicus client can feed it later.
 *
 * Do NOT overclaim precision: 1 km pixels mix many surface types; a "hot" pixel
 * is a sub-pixel anomaly, not a point source.
 */

export type SLSTRChannel = "S7" | "S8" | "S9" | "F1" | "F2";

/** A decoded SLSTR pixel (brightness temperature already computed upstream). */
export interface SLSTRRawPixel {
  latitude: number;
  longitude: number;
  /** Channel whose brightness temperature this record carries. */
  channel: SLSTRChannel;
  /** Brightness temperature in Kelvin. */
  brightnessK: number;
  /** Acquisition time, ISO-8601 UTC. */
  acquired_at: string;
  /** Solar geometry: true = daytime overpass. */
  isDay: boolean;
}

export interface SLSTRThermalRecord {
  latitude: number;
  longitude: number;
  channel: SLSTRChannel;
  brightnessK: number;
  /** Convenience: brightness temperature in °C. */
  brightnessC: number;
  acquired_at: string;
  isDay: boolean;
  /** Nominal nadir pixel size (m) for the thermal bands. */
  resolutionM: 1000;
  source: "sentinel3_slstr";
}

/** Plausible Earth-surface brightness-temperature bounds (K) for QA. */
const MIN_VALID_K = 200; // ~ -73 °C
const MAX_VALID_K = 420; // ~ 147 °C (very hot fire pixel)

export function isValidBrightness(k: number): boolean {
  return Number.isFinite(k) && k >= MIN_VALID_K && k <= MAX_VALID_K;
}

/** Normalise one raw SLSTR pixel into a typed thermal record. */
export function normalizeSLSTRPixel(px: SLSTRRawPixel): SLSTRThermalRecord {
  return {
    latitude: px.latitude,
    longitude: px.longitude,
    channel: px.channel,
    brightnessK: px.brightnessK,
    brightnessC: px.brightnessK - 273.15,
    acquired_at: px.acquired_at,
    isDay: px.isDay,
    resolutionM: 1000,
    source: "sentinel3_slstr",
  };
}

/**
 * Ingest a batch of SLSTR pixels, dropping out-of-range / fill values.
 */
export function ingestSLSTR(pixels: SLSTRRawPixel[]): SLSTRThermalRecord[] {
  const out: SLSTRThermalRecord[] = [];
  for (const px of pixels) {
    if (!isValidBrightness(px.brightnessK)) continue;
    out.push(normalizeSLSTRPixel(px));
  }
  return out;
}
