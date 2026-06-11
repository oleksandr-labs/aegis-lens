/**
 * WebGL / MapLibre clustering tuning.
 *
 * Three presets (performance / balanced / quality) are selected based on
 * the event count on screen and the detected device tier.
 *
 * Pass CLUSTER_PAINT_OVERRIDES to the MapLibre cluster layer paint property
 * to avoid unnecessary repaints. Use data-driven expressions sparingly —
 * each unique expression forces a new GPU draw call.
 */

export interface ClusteringConfig {
  /** Maximum zoom level at which clusters are shown. */
  maxZoom: number;
  /** Cluster radius in pixels. */
  radius: number;
  /** Minimum number of points to form a cluster. */
  minPoints: number;
  /** Tile extent used by supercluster (higher = more precise, slower). */
  extent: number;
  /** k-d tree leaf size used by supercluster. */
  nodeSize: number;
}

export const CLUSTERING_PRESETS: Record<
  "performance" | "quality" | "balanced",
  ClusteringConfig
> = {
  performance: {
    maxZoom: 14,
    radius: 80,
    minPoints: 2,
    extent: 256,
    nodeSize: 128,
  },
  balanced: {
    maxZoom: 16,
    radius: 50,
    minPoints: 3,
    extent: 512,
    nodeSize: 64,
  },
  quality: {
    maxZoom: 18,
    radius: 30,
    minPoints: 2,
    extent: 1024,
    nodeSize: 32,
  },
};

/**
 * Select a clustering preset based on visible event count and device capability.
 *
 * - Low-tier devices always get `performance`.
 * - High-tier devices with few events get `quality`.
 * - Otherwise `balanced`.
 */
export function selectClusteringPreset(
  eventCount: number,
  deviceTier: "low" | "mid" | "high"
): ClusteringConfig {
  if (deviceTier === "low") return CLUSTERING_PRESETS.performance;
  if (deviceTier === "high" && eventCount < 5_000) return CLUSTERING_PRESETS.quality;
  if (eventCount > 50_000) return CLUSTERING_PRESETS.performance;
  return CLUSTERING_PRESETS.balanced;
}

/**
 * MapLibre cluster layer paint overrides.
 *
 * Rules:
 * - Keep circle-color/circle-radius as simple step() expressions — not interpolate().
 *   Step expressions are cheaper on the GPU (no lerp).
 * - Avoid per-feature data-driven props on cluster layers (forces full re-evaluation).
 * - Set circle-pitch-alignment to "map" to skip billboard recalculation.
 */
export const CLUSTER_PAINT_OVERRIDES: Record<string, unknown> = {
  "circle-color": [
    "step",
    ["get", "point_count"],
    "#51bbd6", // 0–99
    100,
    "#f1f075", // 100–749
    750,
    "#f28cb1", // 750+
  ],
  "circle-radius": [
    "step",
    ["get", "point_count"],
    20,
    100,
    30,
    750,
    40,
  ],
  "circle-stroke-width": 2,
  "circle-stroke-color": "#fff",
  "circle-pitch-alignment": "map",
  "circle-translate": [0, 0],
};

/**
 * Rough FPS model for a given event count and clustering configuration.
 *
 * Based on empirical testing on mid-tier hardware (Intel UHD 620).
 * Actual FPS will vary by GPU, browser, and tile data complexity.
 *
 * Returns estimated frames per second (capped at 60).
 */
export function estimateClusterFPS(
  eventCount: number,
  config: ClusteringConfig
): number {
  // Base GPU budget: assume ~60 FPS baseline for empty map
  const BASE_FPS = 60;

  // Cost factors
  const densityFactor = Math.log10(Math.max(eventCount, 1)) / 6; // 0..~1
  const extentPenalty = config.extent / 1024; // larger extent = more CPU work per tile
  const nodeSizeSaving = 1 - config.nodeSize / 256; // larger nodeSize = faster k-d tree

  const estimated =
    BASE_FPS * (1 - densityFactor * 0.6 + nodeSizeSaving * 0.1 - extentPenalty * 0.1);

  return Math.max(5, Math.min(BASE_FPS, Math.round(estimated)));
}
