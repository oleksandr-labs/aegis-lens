import { SentinelHubClient, type BBox } from "./client";
import { makeChangeDetectionEvalscript, EVALSCRIPT_S2_NBR } from "./evalscripts";
import type { RegionCode, SensorFamily } from "./types";

/**
 * Task 3 — Change-detection differencing layer (typed contract).
 *
 * A before/after diff request and a changed-pixel result model that the layer /
 * API can consume independently of the live Process API call below.
 */
export interface ChangeDetectionRequest {
  region: RegionCode;
  bbox: BBox;
  before: { from: string; to: string };
  after: { from: string; to: string };
  /** Which sensor to difference (optical reflectance vs SAR backscatter). */
  sensor?: SensorFamily;
  /** |delta| above this (in band units / dB) counts a pixel as "changed". */
  changeThreshold?: number;
  resolution?: number;
}

/** A single detected change region (cluster of changed pixels). */
export interface ChangedFeature {
  /** Centroid [lon, lat]. */
  centroid: [number, number];
  /** Approximate changed area in square metres. */
  areaM2: number;
  /** Mean signed change within the feature (negative = loss, positive = gain). */
  meanDelta: number;
  /** 0–1 confidence the change is real (not cloud / speckle artefact). */
  confidence: number;
}

/** Typed result of differencing two periods over an AOI. */
export interface ChangedPixelResult {
  region: RegionCode;
  bbox: BBox;
  before_period: string;
  after_period: string;
  changeThreshold: number;
  /** Fraction (0–1) of valid pixels that crossed the threshold. */
  changedFraction: number | null;
  features: ChangedFeature[];
  output_url: string | null;
  generated_at: string;
}

const DEFAULT_CHANGE_THRESHOLD = 0.15;

/** Convenience: turn a typed change request into the live differencing call. */
export function changeDetectionParams(req: ChangeDetectionRequest): {
  bbox: BBox;
  before: { from: string; to: string };
  after: { from: string; to: string };
  resolution?: number;
} {
  return {
    bbox: req.bbox,
    before: req.before,
    after: req.after,
    resolution: req.resolution,
  };
}

export { DEFAULT_CHANGE_THRESHOLD };

export interface ChangeDetectionResult {
  bbox: BBox;
  before_period: string;
  after_period: string;
  /** S3 key or URL of the change-detection GeoTIFF */
  output_url: string | null;
  /** Mean change score across the AOI (-1 to +1) */
  mean_change: number | null;
  /** Percentage of pixels with significant change (|delta| > threshold) */
  changed_area_pct: number | null;
  processing_units_used: number;
  generated_at: string;
}

export interface ObjectStore {
  put(key: string, data: Uint8Array, contentType: string): Promise<string>;
}

/**
 * Runs a before/after change detection over a bounding box.
 * Returns the processed image + statistics.
 */
export async function runChangeDetection(params: {
  client: SentinelHubClient;
  store: ObjectStore;
  bbox: BBox;
  before: { from: string; to: string };
  after: { from: string; to: string };
  resolution?: number;
}): Promise<ChangeDetectionResult> {
  const { client, store, bbox, before, after } = params;
  const width = params.resolution ?? 512;
  const height = params.resolution ?? 512;

  const evalscript = makeChangeDetectionEvalscript("B04");

  // Fetch the after-period composite (mosaicking handles multi-date within Process API)
  const imageBytes = await client.process({
    bbox,
    time_range: { from: before.from, to: after.to },
    collection: "SENTINEL2_L2A",
    evalscript,
    width,
    height,
    format: "image/tiff",
  });

  const key = `change-detection/${bbox.west}_${bbox.south}_${bbox.east}_${bbox.north}/${after.to}.tiff`;
  const outputUrl = await store.put(key, imageBytes, "image/tiff");

  // Also run NBR statistics to detect burn scars
  const stats = await client.statistics({
    bbox,
    time_range: { from: before.from, to: after.to },
    collection: "SENTINEL2_L2A",
    evalscript: EVALSCRIPT_S2_NBR,
    aggregation_period: "P7D",
  });

  const latestInterval = stats.data[stats.data.length - 1];
  const nbrMean = latestInterval?.outputs?.default?.bands?.B0?.stats?.mean ?? null;

  return {
    bbox,
    before_period: `${before.from}/${before.to}`,
    after_period: `${after.from}/${after.to}`,
    output_url: outputUrl,
    mean_change: nbrMean,
    changed_area_pct: null, // requires pixel-level analysis of the GeoTIFF
    processing_units_used: Math.ceil((width * height) / 256 / 256),
    generated_at: new Date().toISOString(),
  };
}
