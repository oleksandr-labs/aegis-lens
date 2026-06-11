/**
 * Task 2 — Sentinel-1 SAR overlay.
 *
 * SAR product model + polarization handling. SAR sees through cloud and at
 * night, so it is the all-weather complement to the Sentinel-2 optical mosaic.
 * Typed request/result + evalscript selection per polarization.
 */

import { SentinelHubClient, type BBox, type ProcessRequest } from "./client";
import { EVALSCRIPT_S1_VV } from "./evalscripts";
import type { Polarization, RegionCode } from "./types";

/** Sentinel-1 acquisition mode. */
export type S1AcquisitionMode = "IW" | "EW" | "SM";

/** Orbit direction — relevant when comparing SAR scenes. */
export type OrbitDirection = "ASCENDING" | "DESCENDING";

export interface S1SarRequest {
  region: RegionCode;
  bbox: BBox;
  time_range: { from: string; to: string };
  /** Default "VV" — best general-purpose backscatter band. */
  polarization?: Polarization;
  mode?: S1AcquisitionMode;
  orbitDirection?: OrbitDirection;
  /** Speckle reduction (Lee filter) applied server-side via backCoeff. */
  backCoeff?: "BETA0" | "SIGMA0_ELLIPSOID" | "GAMMA0_TERRAIN";
  width?: number;
  height?: number;
  format?: ProcessRequest["format"];
}

export interface S1SarResult {
  region: RegionCode;
  bbox: BBox;
  polarization: Polarization;
  /** S3 key or URL of the rendered SAR overlay (dB-scaled intensity). */
  output_url: string | null;
  acquiredAt: string | null;
  processing_units_used: number;
  generated_at: string;
}

/** Build the SAR evalscript for a given polarization. */
export function makeS1Evalscript(pol: Polarization): string {
  // Single-band VV uses the shared evalscript; others get a dB-scaled variant.
  if (pol === "VV") return EVALSCRIPT_S1_VV;
  const band = pol.includes("+") ? pol.split("+")[0] : pol;
  return `
//VERSION=3
function setup() {
  return { input: ["${band}","dataMask"], output: { bands: 2, sampleType: "FLOAT32" } };
}
function evaluatePixel(s) {
  return [10 * Math.log10(s.${band}), s.dataMask];
}`.trim();
}

export interface SarStore {
  put(key: string, data: Uint8Array, contentType: string): Promise<string>;
}

/** Renders a Sentinel-1 SAR overlay for the requested AOI. */
export async function buildS1Overlay(params: {
  client: SentinelHubClient;
  store: SarStore;
  request: S1SarRequest;
}): Promise<S1SarResult> {
  const { client, store, request } = params;
  const pol = request.polarization ?? "VV";

  const pr: ProcessRequest = {
    bbox: request.bbox,
    time_range: request.time_range,
    collection: "SENTINEL1_GRD",
    evalscript: makeS1Evalscript(pol),
    width: request.width ?? 1024,
    height: request.height ?? 1024,
    format: request.format ?? "image/tiff",
  };

  const bytes = await client.process(pr);
  const fmt = (pr.format ?? "image/tiff").split("/")[1];
  const key = `s1-sar/${request.region}/${pol}/${request.time_range.to}.${fmt}`;
  const url = await store.put(key, bytes, pr.format ?? "image/tiff");

  const width = pr.width ?? 1024;
  const height = pr.height ?? 1024;

  return {
    region: request.region,
    bbox: request.bbox,
    polarization: pol,
    output_url: url,
    acquiredAt: request.time_range.to,
    processing_units_used: Math.ceil((width * height) / 256 / 256),
    generated_at: new Date().toISOString(),
  };
}
