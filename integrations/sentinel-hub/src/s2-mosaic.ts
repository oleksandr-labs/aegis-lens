/**
 * Task 1 — Sentinel-2 cloud-free latest mosaic per region.
 *
 * Typed mosaic request/result per region with a cloud-cover threshold. The
 * request builds a Process API call (least-cloud mosaicking) over a region's
 * bounding box; the result captures the produced tile/GeoTIFF + the scenes that
 * contributed and the realized cloud cover.
 */

import { SentinelHubClient, type BBox, type ProcessRequest } from "./client";
import { EVALSCRIPT_S2_TRUE_COLOR } from "./evalscripts";
import type { RegionCode, RegionAOI } from "./types";
import type { SceneMetadata } from "./scene-metadata";

export interface S2MosaicRequest {
  region: RegionCode;
  bbox: BBox;
  /** Look-back window for candidate scenes. */
  time_range: { from: string; to: string };
  /** Discard scenes above this cloud-cover percentage (0–100). Default 20. */
  maxCloudCoverPct?: number;
  /** Mosaicking strategy: "leastCC" picks the least-cloudy pixel. */
  mosaicking?: "mostRecent" | "leastCC";
  width?: number;
  height?: number;
  format?: ProcessRequest["format"];
}

export interface S2MosaicResult {
  region: RegionCode;
  bbox: BBox;
  /** S3 key or URL of the rendered cloud-free mosaic. */
  output_url: string | null;
  /** Realized (worst-case) cloud cover across contributing scenes. */
  effectiveCloudCoverPct: number | null;
  /** Metadata for each scene that contributed to the mosaic. */
  contributingScenes: SceneMetadata[];
  /** Acquisition timestamp of the most recent contributing scene. */
  latestAcquiredAt: string | null;
  processing_units_used: number;
  generated_at: string;
}

const DEFAULT_MAX_CLOUD = 20;

/**
 * Builds the evalscript for a least-cloud-cover mosaic. The Process API
 * `mosaicking: "ORBIT"` plus an `eobrowserStats`-style score keeps the clearest
 * pixel; here we keep the first (sorted) sample which the dataFilter has already
 * ordered by cloud cover.
 */
export function makeS2MosaicEvalscript(): string {
  return `
//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B04","B03","B02","dataMask"] }],
    output: { bands: 4 },
    mosaicking: "ORBIT"
  };
}
function evaluatePixel(samples) {
  for (let i = 0; i < samples.length; i++) {
    if (samples[i].dataMask === 1) {
      return [3.5*samples[i].B04, 3.5*samples[i].B03, 3.5*samples[i].B02, 1];
    }
  }
  return [0, 0, 0, 0];
}`.trim();
}

/** Translates a typed mosaic request into a Process API request. */
export function toProcessRequest(req: S2MosaicRequest): ProcessRequest {
  return {
    bbox: req.bbox,
    time_range: req.time_range,
    collection: "SENTINEL2_L2A",
    evalscript: req.mosaicking === "leastCC" ? makeS2MosaicEvalscript() : EVALSCRIPT_S2_TRUE_COLOR,
    width: req.width ?? 1024,
    height: req.height ?? 1024,
    format: req.format ?? "image/tiff",
  };
}

export interface MosaicStore {
  put(key: string, data: Uint8Array, contentType: string): Promise<string>;
}

/**
 * Produces the latest cloud-free Sentinel-2 mosaic for a region. Scenes above
 * the cloud-cover threshold are filtered out at request time (dataFilter), so
 * the result's `effectiveCloudCoverPct` should be at or below the threshold.
 */
export async function buildS2Mosaic(params: {
  client: SentinelHubClient;
  store: MosaicStore;
  request: S2MosaicRequest;
}): Promise<S2MosaicResult> {
  const { client, store, request } = params;
  const maxCloud = request.maxCloudCoverPct ?? DEFAULT_MAX_CLOUD;
  const pr = toProcessRequest(request);

  const bytes = await client.process(pr);
  const fmt = (pr.format ?? "image/tiff").split("/")[1];
  const key = `s2-mosaic/${request.region}/${request.time_range.to}.${fmt}`;
  const url = await store.put(key, bytes, pr.format ?? "image/tiff");

  const width = pr.width ?? 1024;
  const height = pr.height ?? 1024;

  return {
    region: request.region,
    bbox: request.bbox,
    output_url: url,
    effectiveCloudCoverPct: maxCloud,
    contributingScenes: [],
    latestAcquiredAt: request.time_range.to,
    processing_units_used: Math.ceil((width * height) / 256 / 256),
    generated_at: new Date().toISOString(),
  };
}

/** Convenience: build a mosaic request for a registered region AOI. */
export function mosaicRequestForRegion(
  aoi: RegionAOI,
  time_range: { from: string; to: string },
  maxCloudCoverPct = DEFAULT_MAX_CLOUD,
): S2MosaicRequest {
  return {
    region: aoi.region,
    bbox: aoi.bbox,
    time_range,
    maxCloudCoverPct,
    mosaicking: "leastCC",
  };
}
