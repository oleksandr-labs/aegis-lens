/**
 * Tile Service — Raster Tile Server for Satellite Mosaics
 *
 * Pre-configured layers:
 *   - sentinel-2-rgb      (optical true-colour)
 *   - sentinel-1-sar      (SAR backscatter)
 *   - landsat-thermal     (band 10/11 thermal infrared)
 *
 * Tile URL pattern:
 *   /api/layers/raster/[layer]/[z]/[x]/[y]
 */

import type { TileCoord } from "./types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RasterTileConfig {
  layerId: string;
  /** Sentinel Hub / WMTS endpoint template.
   *  Placeholders: {z}, {x}, {y} */
  sourceUrl: string;
  format: "png" | "webp" | "tiff";
  tileSize: 256 | 512;
  minZoom: number;
  maxZoom: number;
  attribution: string;
  /** Value for the Cache-Control response header */
  cacheControl: string;
}

// ── Pre-configured satellite layers ──────────────────────────────────────────

export const RASTER_LAYER_CONFIGS: RasterTileConfig[] = [
  {
    layerId: "sentinel-2-rgb",
    // Sentinel Hub WMS/WMTS — requires INSTANCE_ID env var
    sourceUrl:
      "https://services.sentinel-hub.com/ogc/wmts/{instanceId}?REQUEST=GetTile&TILEMATRIXSET=PopularWebMercator256&LAYER=TRUE_COLOR&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png",
    format: "png",
    tileSize: 256,
    minZoom: 6,
    maxZoom: 18,
    attribution: "Sentinel-2 © ESA / Sentinel Hub",
    // Optical mosaics update ~every 5 days; cache for 12 hours
    cacheControl: "public, max-age=43200, stale-while-revalidate=86400",
  },
  {
    layerId: "sentinel-1-sar",
    // Sentinel-1 SAR GRD backscatter via Sentinel Hub
    sourceUrl:
      "https://services.sentinel-hub.com/ogc/wmts/{instanceId}?REQUEST=GetTile&TILEMATRIXSET=PopularWebMercator256&LAYER=SAR_RGB&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png",
    format: "png",
    tileSize: 256,
    minZoom: 6,
    maxZoom: 16,
    attribution: "Sentinel-1 SAR © ESA / Sentinel Hub",
    // SAR passes every 6 days; cache for 6 hours to allow near-real-time updates
    cacheControl: "public, max-age=21600, stale-while-revalidate=43200",
  },
  {
    layerId: "landsat-thermal",
    // Landsat-8/9 TIRS Band 10 thermal via USGS Landsatlook
    sourceUrl:
      "https://landsatlook.usgs.gov/map-viewer/tilejson/{z}/{x}/{y}?layer=thermal&product=Collection2",
    format: "png",
    tileSize: 256,
    minZoom: 5,
    maxZoom: 15,
    attribution: "Landsat Thermal © USGS / NASA Landsat",
    // Landsat has 16-day repeat cycle; cache for 4 hours
    cacheControl: "public, max-age=14400, stale-while-revalidate=28800",
  },
];

// ── Lookup ────────────────────────────────────────────────────────────────────

const _layerMap = new Map<string, RasterTileConfig>(
  RASTER_LAYER_CONFIGS.map((c) => [c.layerId, c]),
);

export function getRasterConfig(layerId: string): RasterTileConfig | undefined {
  return _layerMap.get(layerId);
}

// ── URL builder ───────────────────────────────────────────────────────────────

/**
 * Build the upstream raster tile URL for the given tile coordinate.
 * Replaces {z}, {x}, {y} and {instanceId} placeholders.
 * instanceId is read from SENTINEL_HUB_INSTANCE_ID env var (server-side only).
 */
export function buildRasterTileUrl(
  config: RasterTileConfig,
  z: number,
  x: number,
  y: number,
): string {
  const instanceId = process.env["SENTINEL_HUB_INSTANCE_ID"] ?? "MISSING_INSTANCE_ID";
  return config.sourceUrl
    .replace("{instanceId}", instanceId)
    .replace("{z}", String(z))
    .replace("{x}", String(x))
    .replace("{y}", String(y));
}

// ── Coordinate validation ─────────────────────────────────────────────────────

export function isValidTileCoord(
  config: RasterTileConfig,
  coord: TileCoord,
): boolean {
  const { z, x, y } = coord;
  if (z < config.minZoom || z > config.maxZoom) return false;
  const maxTile = Math.pow(2, z);
  if (x < 0 || x >= maxTile) return false;
  if (y < 0 || y >= maxTile) return false;
  return true;
}
