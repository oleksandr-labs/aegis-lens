/**
 * Reusable evalscripts for Sentinel Hub.
 * Each function returns a complete evalscript string.
 */

/** True color RGB from Sentinel-2 */
export const EVALSCRIPT_S2_TRUE_COLOR = `
//VERSION=3
function setup() {
  return { input: ["B04","B03","B02","dataMask"], output: { bands: 4 } };
}
function evaluatePixel(s) {
  return [3.5*s.B04, 3.5*s.B03, 3.5*s.B02, s.dataMask];
}`.trim();

/** NDVI (vegetation health) */
export const EVALSCRIPT_S2_NDVI = `
//VERSION=3
function setup() {
  return { input: ["B04","B08","dataMask"], output: { bands: 2, sampleType: "FLOAT32" } };
}
function evaluatePixel(s) {
  const ndvi = (s.B08 - s.B04) / (s.B08 + s.B04);
  return [ndvi, s.dataMask];
}`.trim();

/** NBR (Normalized Burn Ratio) for fire/burn-scar detection */
export const EVALSCRIPT_S2_NBR = `
//VERSION=3
function setup() {
  return { input: ["B08","B12","dataMask"], output: { bands: 2, sampleType: "FLOAT32" } };
}
function evaluatePixel(s) {
  const nbr = (s.B08 - s.B12) / (s.B08 + s.B12);
  return [nbr, s.dataMask];
}`.trim();

/** SWIR composite for active fire hotspot detection */
export const EVALSCRIPT_S2_FIRE_HOTSPOT = `
//VERSION=3
function setup() {
  return { input: ["B12","B11","B04","dataMask"], output: { bands: 4 } };
}
function evaluatePixel(s) {
  return [2.5*s.B12, 2.5*s.B11, 2.5*s.B04, s.dataMask];
}`.trim();

/** Sentinel-1 SAR intensity (VV polarization) for change detection */
export const EVALSCRIPT_S1_VV = `
//VERSION=3
function setup() {
  return { input: ["VV","dataMask"], output: { bands: 2, sampleType: "FLOAT32" } };
}
function evaluatePixel(s) {
  return [10 * Math.log10(s.VV), s.dataMask];
}`.trim();

/**
 * Change detection: difference between two time periods.
 * Returns positive values where reflectance increased (new bright areas = potential damage).
 */
export function makeChangeDetectionEvalscript(band: "B04" | "B08" | "B12" = "B04"): string {
  return `
//VERSION=3
function setup() {
  return {
    input: [{ bands: ["${band}","dataMask"], metadata: ["normalizationFactor"] }],
    output: { bands: 2, sampleType: "FLOAT32" },
    mosaicking: "ORBIT"
  };
}
function evaluatePixel(samples) {
  if (samples.length < 2) return [0, 0];
  const before = samples[samples.length - 1].${band};
  const after = samples[0].${band};
  const change = after - before;
  const mask = samples[0].dataMask;
  return [change, mask];
}`.trim();
}
