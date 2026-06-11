/**
 * Tile compaction job.
 *
 * Inactive tiles (not requested recently) are removed from the cache to
 * reclaim storage. Historical layers keep their tiles longer than live ones.
 *
 * Strategy:
 *   - Live layers (drones, missiles): evict tiles unused > 1 hour
 *   - Historical layers (satellite, thermal): evict unused > 30 days
 *   - Always keep at least the lowest zoom levels (overview tiles) warm
 */

import { getLayerConfig } from "./layer-registry";
import { tileCache } from "./cache";

export interface TileAccessRecord {
  /** layerId/z/x/y key */
  tileKey: string;
  layerId: string;
  zoom: number;
  lastAccessedAt: string;
  sizeBytes: number;
}

export interface CompactionPolicy {
  /** Layers classified as "live" — short retention */
  liveLayerMaxIdleSeconds: number;
  /** Layers classified as "historical" — long retention */
  historicalLayerMaxIdleSeconds: number;
  /** Always keep tiles at or below this zoom (overview tiles) */
  keepOverviewZoom: number;
}

export const DEFAULT_COMPACTION_POLICY: CompactionPolicy = {
  liveLayerMaxIdleSeconds: 3600,            // 1 hour
  historicalLayerMaxIdleSeconds: 2592000,   // 30 days
  keepOverviewZoom: 6,
};

/** Classify a layer's retention based on its TTL config. */
function isLiveLayer(layerId: string): boolean {
  const cfg = getLayerConfig(layerId);
  // Short TTL (< 5 min) → live layer
  return !!cfg && cfg.ttlSeconds < 300;
}

export interface CompactionResult {
  scanned: number;
  evicted: number;
  bytesReclaimed: number;
  keptOverview: number;
  keptActive: number;
  evictedKeys: string[];
}

/**
 * Determine which tiles to evict given access records + policy.
 */
export function planCompaction(
  records: TileAccessRecord[],
  policy: CompactionPolicy = DEFAULT_COMPACTION_POLICY,
  now: number = Date.now(),
): CompactionResult {
  const result: CompactionResult = {
    scanned: records.length,
    evicted: 0,
    bytesReclaimed: 0,
    keptOverview: 0,
    keptActive: 0,
    evictedKeys: [],
  };

  for (const rec of records) {
    // Always keep overview tiles warm
    if (rec.zoom <= policy.keepOverviewZoom) {
      result.keptOverview++;
      continue;
    }

    const idleMs = now - new Date(rec.lastAccessedAt).getTime();
    const maxIdleMs = isLiveLayer(rec.layerId)
      ? policy.liveLayerMaxIdleSeconds * 1000
      : policy.historicalLayerMaxIdleSeconds * 1000;

    if (idleMs > maxIdleMs) {
      result.evicted++;
      result.bytesReclaimed += rec.sizeBytes;
      result.evictedKeys.push(rec.tileKey);
    } else {
      result.keptActive++;
    }
  }

  return result;
}

/**
 * Execute compaction: plan + evict from cache.
 * `evictFn` performs the actual storage delete (S3 / Redis).
 */
export async function runCompaction(
  records: TileAccessRecord[],
  evictFn: (tileKey: string) => Promise<void>,
  policy: CompactionPolicy = DEFAULT_COMPACTION_POLICY,
): Promise<CompactionResult> {
  const plan = planCompaction(records, policy);
  await Promise.all(plan.evictedKeys.map((key) => evictFn(key).catch(() => {})));
  return plan;
}
