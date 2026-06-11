/** Tile service types — vector + raster tile generation and caching. */

export type TileFormat = "mvt" | "pbf" | "png" | "webp" | "geojson";

export type TileGenerationMode = "on_demand" | "pre_generated" | "hybrid";

/** A tile coordinate in the standard XYZ scheme. */
export interface TileCoord {
  z: number; // zoom level 0–22
  x: number;
  y: number;
}

/** Bounding box in WGS-84. */
export interface BBox {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}

/** Identifies a specific tile in a layer at a point in time. */
export interface TileKey {
  layerId: string;
  /** ISO-8601 bucket, e.g. "2024-11-01T00:00:00Z" for a 1h bucket */
  timeBucket: string;
  /** org_id for tenant-specific tiles; undefined = public */
  orgId?: string;
  coord: TileCoord;
}

export type TileStatus = "pending" | "generating" | "ready" | "stale" | "error";

export interface TileRecord {
  key: TileKey;
  status: TileStatus;
  format: TileFormat;
  /** Bytes stored */
  sizeBytes?: number;
  /** ISO-8601 */
  generatedAt?: string;
  /** ISO-8601 — when this tile expires and should be re-generated */
  expiresAt?: string;
  /** CDN URL if published */
  cdnUrl?: string;
  error?: string;
}

export interface LayerTileConfig {
  layerId: string;
  displayName: string;
  mode: TileGenerationMode;
  format: TileFormat;
  /** Zoom levels this layer supports */
  minZoom: number;
  maxZoom: number;
  /** How long tiles stay fresh (seconds). Live layers use short TTL. */
  ttlSeconds: number;
  /** Whether tiles are tenant-scoped */
  tenantScoped: boolean;
  /** Whether signed URLs are required */
  requiresAuth: boolean;
  /** Time bucket granularity: "1h" | "6h" | "1d" | "7d" */
  timeBucketSize: string;
}

export interface TileGenerationJob {
  jobId: string;
  layerId: string;
  coord: TileCoord;
  timeBucket: string;
  orgId?: string;
  status: "queued" | "running" | "done" | "failed";
  queuedAt: string;
  startedAt?: string;
  finishedAt?: string;
  retries: number;
  error?: string;
}

/** Result from a tile generation attempt. */
export interface TileGenerationResult {
  key: TileKey;
  data: Uint8Array;
  format: TileFormat;
  sizeBytes: number;
  generatedAt: string;
  expiresAt: string;
}

export interface TileMetrics {
  layerId: string;
  totalTiles: number;
  readyTiles: number;
  staleTiles: number;
  pendingTiles: number;
  errorTiles: number;
  totalSizeBytes: number;
  avgGenerationMs: number;
  cacheHitRate: number;
}

/** Cache tag for CDN invalidation */
export interface CacheTag {
  layerId: string;
  timeBucket: string;
  orgId?: string;
}

export interface SignedTileUrl {
  url: string;
  expiresAt: string;
  layerId: string;
  coord: TileCoord;
}
