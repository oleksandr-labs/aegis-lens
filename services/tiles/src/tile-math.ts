import { TileCoord, BBox } from "./types";

const EARTH_CIRCUMFERENCE = 40075016.68557849;

/** Convert lon/lat to tile XY at given zoom. */
export function lonLatToTile(lon: number, lat: number, zoom: number): TileCoord {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lon + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
  return { z: zoom, x: Math.max(0, Math.min(n - 1, x)), y: Math.max(0, Math.min(n - 1, y)) };
}

/** Get bounding box of a tile in WGS-84. */
export function tileToBBox(z: number, x: number, y: number): BBox {
  const n = Math.pow(2, z);
  const minLon = (x / n) * 360 - 180;
  const maxLon = ((x + 1) / n) * 360 - 180;
  const maxLat = (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI;
  const minLat = (Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n))) * 180) / Math.PI;
  return { minLon, minLat, maxLon, maxLat };
}

/** List all tiles covering a bounding box at a given zoom. */
export function tilesInBBox(bbox: BBox, zoom: number): TileCoord[] {
  const { z: minX, x: tMinX } = lonLatToTile(bbox.minLon, bbox.minLat, zoom);
  const { z: maxX, x: tMaxX } = lonLatToTile(bbox.maxLon, bbox.maxLat, zoom);
  const n = Math.pow(2, zoom);
  const tMinY = lonLatToTile(bbox.minLon, bbox.maxLat, zoom).y;
  const tMaxY = lonLatToTile(bbox.maxLon, bbox.minLat, zoom).y;

  const tiles: TileCoord[] = [];
  const xMin = Math.min(tMinX, tMaxX);
  const xMax = Math.max(tMinX, tMaxX);
  const yMin = Math.min(tMinY, tMaxY);
  const yMax = Math.max(tMinY, tMaxY);

  for (let x = xMin; x <= Math.min(xMax, n - 1); x++) {
    for (let y = yMin; y <= Math.min(yMax, n - 1); y++) {
      tiles.push({ z: zoom, x, y });
    }
  }
  return tiles;
}

/** Ground resolution in meters per pixel at a given latitude and zoom. */
export function groundResolutionMeters(lat: number, zoom: number): number {
  return (Math.cos((lat * Math.PI) / 180) * EARTH_CIRCUMFERENCE) / (256 * Math.pow(2, zoom));
}

/**
 * Return the recommended zoom range for a given feature size.
 * Returns the zoom levels where the feature occupies between minPx and maxPx pixels.
 */
export function suggestZoomRange(
  featureSizeMeters: number,
  minPx = 2,
  maxPx = 256,
): { minZoom: number; maxZoom: number } {
  // Approximate using equator resolution
  const zoomForMin = Math.log2((EARTH_CIRCUMFERENCE / (featureSizeMeters / minPx)) / 256);
  const zoomForMax = Math.log2((EARTH_CIRCUMFERENCE / (featureSizeMeters / maxPx)) / 256);
  return {
    minZoom: Math.max(0, Math.floor(Math.min(zoomForMin, zoomForMax))),
    maxZoom: Math.min(22, Math.ceil(Math.max(zoomForMin, zoomForMax))),
  };
}

/** Tile quadkey (Bing Maps style) for caching / CDN path. */
export function tileToQuadkey(z: number, x: number, y: number): string {
  let key = "";
  for (let i = z; i > 0; i--) {
    let digit = 0;
    const mask = 1 << (i - 1);
    if (x & mask) digit += 1;
    if (y & mask) digit += 2;
    key += digit.toString();
  }
  return key;
}

/** S3/CDN path for a tile: `{layerId}/{z}/{x}/{y}.{ext}` */
export function tileCdnPath(layerId: string, z: number, x: number, y: number, ext: string): string {
  return `${layerId}/${z}/${x}/${y}.${ext}`;
}
