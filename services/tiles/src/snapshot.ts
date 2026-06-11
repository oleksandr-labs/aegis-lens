import { BBox, TileCoord } from "./types";
import { tilesInBBox } from "./tile-math";

export interface SnapshotRequest {
  /** Layer to snapshot */
  layerId: string;
  /** Bounding box for the snapshot */
  bbox: BBox;
  zoom: number;
  timeBucket: string;
  /** Pixel width/height of output image */
  width: number;
  height: number;
  /** Optional overlay layers */
  overlayLayers?: string[];
  orgId?: string;
  /** Requested format */
  format: "png" | "webp" | "jpeg";
}

export interface SnapshotResult {
  /** Base64-encoded image data */
  dataBase64: string;
  format: "png" | "webp" | "jpeg";
  width: number;
  height: number;
  bbox: BBox;
  zoom: number;
  generatedAt: string;
  /** Tiles used to compose the snapshot */
  tilesUsed: TileCoord[];
}

/**
 * Generate a static map snapshot by stitching tiles.
 * Production: use Playwright headless or a dedicated map-renderer service.
 */
export async function generateSnapshot(req: SnapshotRequest): Promise<SnapshotResult> {
  const tilesUsed = tilesInBBox(req.bbox, req.zoom);

  // Production: fetch each tile, stitch into canvas/sharp pipeline, crop to bbox
  const stub: SnapshotResult = {
    dataBase64: "",
    format: req.format,
    width: req.width,
    height: req.height,
    bbox: req.bbox,
    zoom: req.zoom,
    generatedAt: new Date().toISOString(),
    tilesUsed,
  };

  return stub;
}

/** Estimate the number of tiles required for a snapshot (budget check). */
export function estimateTileCount(bbox: BBox, zoom: number): number {
  return tilesInBBox(bbox, zoom).length;
}

/** Hard budget: refuse snapshots that would consume too many tiles. */
export const SNAPSHOT_TILE_BUDGET = 256;

export function checkSnapshotBudget(bbox: BBox, zoom: number): { ok: boolean; tileCount: number } {
  const tileCount = estimateTileCount(bbox, zoom);
  return { ok: tileCount <= SNAPSHOT_TILE_BUDGET, tileCount };
}
