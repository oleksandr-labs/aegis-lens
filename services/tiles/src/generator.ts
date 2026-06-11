import { TileCoord, TileGenerationJob, TileGenerationResult, TileKey, LayerTileConfig } from "./types";
import { tileToBBox } from "./tile-math";
import { tileCache } from "./cache";

/** Generate the time bucket string for a given date and bucket size. */
export function getTimeBucket(date: Date, bucketSize: string): string {
  const ms = date.getTime();
  switch (bucketSize) {
    case "1h": {
      const h = new Date(Math.floor(ms / 3_600_000) * 3_600_000);
      return h.toISOString();
    }
    case "6h": {
      const h6 = new Date(Math.floor(ms / (6 * 3_600_000)) * (6 * 3_600_000));
      return h6.toISOString();
    }
    case "1d": {
      const d = new Date(date.toISOString().slice(0, 10) + "T00:00:00.000Z");
      return d.toISOString();
    }
    case "7d": {
      const weekMs = 7 * 86_400_000;
      const epoch = new Date("2024-01-01T00:00:00Z").getTime();
      const weekStart = new Date(epoch + Math.floor((ms - epoch) / weekMs) * weekMs);
      return weekStart.toISOString();
    }
    default:
      return date.toISOString().slice(0, 13) + ":00:00.000Z";
  }
}

/** Stub: generate a GeoJSON feature collection for a layer + tile. */
async function queryFeaturesForTile(
  _layerId: string,
  _bbox: ReturnType<typeof tileToBBox>,
  _timeBucket: string,
  _orgId: string | undefined,
): Promise<object> {
  // Production: query PostGIS via ST_MakeEnvelope + ST_AsMVT or pg_tileserv
  return { type: "FeatureCollection", features: [] };
}

/** Encode GeoJSON to MVT bytes (stub — use @mapbox/vector-tile or tippecanoe). */
function encodeAsMVT(_geojson: object, _coord: TileCoord): Uint8Array {
  // Production: use mapbox/vector-tile-js or call pg_tileserv
  return new Uint8Array(0);
}

/** Generate a single tile. Returns the result or throws. */
export async function generateTile(
  config: LayerTileConfig,
  coord: TileCoord,
  timeBucket: string,
  orgId: string | undefined,
): Promise<TileGenerationResult> {
  const bbox = tileToBBox(coord.z, coord.x, coord.y);
  const geojson = await queryFeaturesForTile(config.layerId, bbox, timeBucket, orgId);
  const data = encodeAsMVT(geojson, coord);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + config.ttlSeconds * 1000).toISOString();

  return {
    key: { layerId: config.layerId, timeBucket, orgId, coord },
    data,
    format: config.format,
    sizeBytes: data.byteLength,
    generatedAt: now.toISOString(),
    expiresAt,
  };
}

/** Job queue (in-memory stub). Production: use BullMQ or pg-boss. */
const jobQueue: TileGenerationJob[] = [];

export function enqueueJob(
  layerId: string,
  coord: TileCoord,
  timeBucket: string,
  orgId?: string,
): TileGenerationJob {
  const job: TileGenerationJob = {
    jobId: `${layerId}-${coord.z}-${coord.x}-${coord.y}-${Date.now()}`,
    layerId,
    coord,
    timeBucket,
    orgId,
    status: "queued",
    queuedAt: new Date().toISOString(),
    retries: 0,
  };
  jobQueue.push(job);
  tileCache.markStatus({ layerId, timeBucket, orgId, coord }, "pending");
  return job;
}

export function listJobs(layerId?: string): TileGenerationJob[] {
  return layerId ? jobQueue.filter((j) => j.layerId === layerId) : [...jobQueue];
}

export function getJob(jobId: string): TileGenerationJob | undefined {
  return jobQueue.find((j) => j.jobId === jobId);
}
