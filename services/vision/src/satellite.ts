/**
 * Satellite processing (Satellite cluster):
 *   1. detectSentinel2Change — Sentinel-2 optical bi-temporal change detection per AOI.
 *   2. processSentinel1Sar    — Sentinel-1 SAR bright-target + coherence change (night/cloud).
 *   3. mapBurnScar            — burn-scar mapping via Sentinel-2 dNBR fused with NASA FIRMS hotspots.
 *
 * Delivered as the codeable contract: typed inputs/outputs + spectral-index
 * HEURISTIC baselines that run on band statistics the worker extracts, with
 * calibrated confidence. The worker (Sentinel Hub / openEO / Google Earth Engine
 * client) does the raster I/O; this package is pure-TS math + types so it stays
 * dependency-free and testable.
 *
 * === MODEL WEIGHTS + DATA ACCESS PENDING ===
 *  - Learned change/segmentation nets (`sat-change-v0` Siamese U-Net, `sar-target-v0`)
 *    are stubs; the spectral-index heuristics below are the baseline.
 *  - Imagery access (Sentinel-2/-1) needs Copernicus Data Space / Sentinel Hub creds
 *    (`COPERNICUS_CLIENT_ID` / `COPERNICUS_CLIENT_SECRET`) and FIRMS needs
 *    `FIRMS_MAP_KEY` — all read from process.env, documented in COMPLIANCE.md.
 *    Copernicus Sentinel data is free & open (attribution required).
 */

import {
  BoundingBox,
  ChangeDetectionResult,
  ChangeRegion,
  ChangeType,
  SarPolarization,
  SarProcessingResult,
  SarProduct,
} from "./types";
import { calibrate } from "./confidence";

const CHANGE_MODEL_ID = "sat-change-v0";
const SAR_MODEL_ID = "sar-target-v0";

// ── Spectral indices ──────────────────────────────────────────────────────────────

/** NDVI (vegetation): (NIR − Red) / (NIR + Red), range −1..1. */
export function ndvi(nir: number, red: number): number {
  const d = nir + red;
  return d === 0 ? 0 : (nir - red) / d;
}

/** NBR (Normalized Burn Ratio): (NIR − SWIR) / (NIR + SWIR), range −1..1. */
export function nbr(nir: number, swir: number): number {
  const d = nir + swir;
  return d === 0 ? 0 : (nir - swir) / d;
}

/**
 * dNBR = NBR_before − NBR_after. Standard USGS burn-severity thresholds:
 *   < 0.1 unburned, 0.1–0.27 low, 0.27–0.44 moderate-low, 0.44–0.66 moderate-high, >0.66 high.
 */
export function dNBR(nbrBefore: number, nbrAfter: number): number {
  return parseFloat((nbrBefore - nbrAfter).toFixed(4));
}

export type BurnSeverity = "unburned" | "low" | "moderate_low" | "moderate_high" | "high";
export function burnSeverity(d: number): BurnSeverity {
  if (d < 0.1) return "unburned";
  if (d < 0.27) return "low";
  if (d < 0.44) return "moderate_low";
  if (d < 0.66) return "moderate_high";
  return "high";
}

// ── 1. Sentinel-2 optical change detection ────────────────────────────────────────

/** Per-tile band stats the worker extracts for a before/after pair within an AOI. */
export interface OpticalTile {
  boundingBox: BoundingBox;
  beforeRed: number; beforeNir: number; beforeSwir: number;
  afterRed: number; afterNir: number; afterSwir: number;
  /** Cloud-probability 0–1 (Sentinel-2 SCL/s2cloudless); high → drop tile. */
  cloudProb?: number;
  /** Approx ground area of the tile, hectares. */
  areaHectares?: number;
}

export interface Sentinel2ChangeOptions {
  beforeImageId: string;
  afterImageId: string;
  /** Drop tiles with cloudProb above this. Default 0.4. */
  maxCloudProb?: number;
  /** NDVI drop threshold to flag vegetation loss. Default 0.2. */
  ndviLossThreshold?: number;
}

export function detectSentinel2Change(
  mediaId: string,
  tiles: OpticalTile[],
  opts: Sentinel2ChangeOptions,
): ChangeDetectionResult {
  const start = Date.now();
  const maxCloud = opts.maxCloudProb ?? 0.4;
  const ndviLoss = opts.ndviLossThreshold ?? 0.2;
  const changes: ChangeRegion[] = [];
  let totalArea = 0;

  for (const t of tiles) {
    if ((t.cloudProb ?? 0) > maxCloud) continue; // optical blind under cloud — see SAR
    const ndviBefore = ndvi(t.beforeNir, t.beforeRed);
    const ndviAfter = ndvi(t.afterNir, t.afterRed);
    const d = dNBR(nbr(t.beforeNir, t.beforeSwir), nbr(t.afterNir, t.afterSwir));
    const ndviDelta = ndviBefore - ndviAfter;

    let changeType: ChangeType | undefined;
    let raw = 0;
    if (d >= 0.27) { changeType = "burn_scar"; raw = Math.min(0.9, 0.4 + d); }
    else if (ndviDelta >= ndviLoss) { changeType = "vegetation_loss"; raw = Math.min(0.85, 0.4 + ndviDelta); }
    else if (ndviAfter < 0.1 && ndviBefore > 0.3) { changeType = "building_damage"; raw = 0.5; }

    if (changeType) {
      changes.push({
        boundingBox: t.boundingBox,
        changeType,
        confidence: calibrate(raw, CHANGE_MODEL_ID).calibrated,
        areaHectares: t.areaHectares,
      });
      totalArea += t.areaHectares ?? 0;
    }
  }

  return {
    mediaId,
    beforeImageId: opts.beforeImageId,
    afterImageId: opts.afterImageId,
    changes,
    totalChangedAreaHectares: parseFloat(totalArea.toFixed(2)),
    processingMs: Date.now() - start,
  };
}

// ── 2. Sentinel-1 SAR processing (night / cloud) ──────────────────────────────────

/** Per-pixel/-tile SAR stats the worker extracts after calibration & speckle filtering. */
export interface SarTile {
  boundingBox: BoundingBox;
  /** Backscatter in dB (sigma-0). Bright metal targets ~ > -5 dB. */
  backscatterDb: number;
  /** Interferometric coherence 0–1 between two passes (low = change). */
  coherence?: number;
}

export interface Sentinel1Options {
  product: SarProduct;
  polarizations: SarPolarization[];
  /** Backscatter (dB) above which a tile is a candidate bright target. Default -7. */
  brightTargetDb?: number;
  /** Coherence below which a change is flagged. Default 0.3. */
  coherenceLossThreshold?: number;
}

export function processSentinel1Sar(mediaId: string, tiles: SarTile[], opts: Sentinel1Options): SarProcessingResult {
  const start = Date.now();
  const brightDb = opts.brightTargetDb ?? -7;
  const cohLoss = opts.coherenceLossThreshold ?? 0.3;

  const brightTargets = tiles
    .filter((t) => t.backscatterDb >= brightDb)
    .map((t) => ({
      boundingBox: t.boundingBox,
      backscatterDb: t.backscatterDb,
      confidence: calibrate(Math.min(0.85, 0.4 + (t.backscatterDb - brightDb) / 20), SAR_MODEL_ID),
    }));

  const coherenceLossRegions: ChangeRegion[] = tiles
    .filter((t) => typeof t.coherence === "number" && t.coherence < cohLoss)
    .map((t) => ({
      boundingBox: t.boundingBox,
      changeType: "building_damage" as ChangeType,
      confidence: calibrate(Math.min(0.8, 0.4 + (cohLoss - (t.coherence ?? 0))), SAR_MODEL_ID).calibrated,
    }));

  return {
    mediaId,
    product: opts.product,
    polarizations: opts.polarizations,
    brightTargets,
    coherenceLossRegions,
    notes: "Sentinel-1 SAR is all-weather/day-night — use when Sentinel-2 optical is cloud-blocked or at night. Heuristic thresholding; learned CFAR+CNN weights pending.",
    processingMs: Date.now() - start,
  };
}

// ── 3. Burn-scar mapping (Sentinel-2 dNBR ⊕ NASA FIRMS) ────────────────────────────

/** A FIRMS active-fire hotspot (VIIRS/MODIS). */
export interface FirmsHotspot {
  lat: number;
  lon: number;
  /** Fire Radiative Power (MW) — proxy for intensity. */
  frp?: number;
  /** Detection confidence as reported by FIRMS (0–100 or low/nominal/high). */
  confidence?: number | "low" | "nominal" | "high";
  acquiredAt: string; // ISO-8601
}

export interface BurnScarRegion {
  boundingBox: BoundingBox;
  severity: BurnSeverity;
  dnbr: number;
  /** Number of FIRMS hotspots falling inside the region's time/space window. */
  firmsHotspots: number;
  /** Fused confidence: optical dNBR corroborated by thermal hotspots → higher. */
  confidence: number;
  areaHectares?: number;
}

export interface BurnScarResult {
  mediaId: string;
  regions: BurnScarRegion[];
  totalBurnedHectares: number;
  processingMs: number;
}

function pointInBox(lat: number, lon: number, b: BoundingBox, aoi: { minLat: number; minLon: number; latSpan: number; lonSpan: number }): boolean {
  // Map a normalized bbox back to geo extents using the AOI envelope.
  const west = aoi.minLon + b.x * aoi.lonSpan;
  const east = aoi.minLon + (b.x + b.w) * aoi.lonSpan;
  const north = aoi.minLat + aoi.latSpan - b.y * aoi.latSpan;
  const south = aoi.minLat + aoi.latSpan - (b.y + b.h) * aoi.latSpan;
  return lon >= west && lon <= east && lat >= south && lat <= north;
}

/**
 * Fuse Sentinel-2 dNBR tiles with FIRMS hotspots. A burn scar corroborated by a
 * thermal hotspot in the same window is far more reliable than optical dNBR alone
 * (which clouds/shadows/harvest can mimic).
 */
export function mapBurnScar(
  mediaId: string,
  tiles: OpticalTile[],
  hotspots: FirmsHotspot[],
  aoiEnvelope: { minLat: number; minLon: number; maxLat: number; maxLon: number },
): BurnScarResult {
  const start = Date.now();
  const aoi = {
    minLat: aoiEnvelope.minLat, minLon: aoiEnvelope.minLon,
    latSpan: aoiEnvelope.maxLat - aoiEnvelope.minLat,
    lonSpan: aoiEnvelope.maxLon - aoiEnvelope.minLon,
  };
  const regions: BurnScarRegion[] = [];
  let totalArea = 0;

  for (const t of tiles) {
    if ((t.cloudProb ?? 0) > 0.4) continue;
    const d = dNBR(nbr(t.beforeNir, t.beforeSwir), nbr(t.afterNir, t.afterSwir));
    const sev = burnSeverity(d);
    if (sev === "unburned") continue;
    const hotspotsInTile = hotspots.filter((h) => pointInBox(h.lat, h.lon, t.boundingBox, aoi)).length;
    // dNBR gives base confidence; each corroborating hotspot adds, capped.
    const raw = Math.min(0.95, 0.35 + d * 0.5 + Math.min(0.3, hotspotsInTile * 0.15));
    regions.push({
      boundingBox: t.boundingBox,
      severity: sev,
      dnbr: d,
      firmsHotspots: hotspotsInTile,
      confidence: calibrate(raw, CHANGE_MODEL_ID).calibrated,
      areaHectares: t.areaHectares,
    });
    totalArea += t.areaHectares ?? 0;
  }

  return { mediaId, regions, totalBurnedHectares: parseFloat(totalArea.toFixed(2)), processingMs: Date.now() - start };
}
