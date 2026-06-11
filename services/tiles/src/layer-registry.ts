import { LayerTileConfig } from "./types";

/** Central registry of all tile layer configurations. */
const LAYER_CONFIGS: LayerTileConfig[] = [
  {
    layerId: "events",
    displayName: "Events",
    mode: "hybrid",
    format: "mvt",
    minZoom: 3,
    maxZoom: 16,
    ttlSeconds: 300, // 5 min — live layer
    tenantScoped: true,
    requiresAuth: true,
    timeBucketSize: "1h",
  },
  {
    layerId: "drones",
    displayName: "Drone Activity",
    mode: "hybrid",
    format: "mvt",
    minZoom: 5,
    maxZoom: 18,
    ttlSeconds: 60, // 1 min — very live
    tenantScoped: true,
    requiresAuth: true,
    timeBucketSize: "1h",
  },
  {
    layerId: "missiles",
    displayName: "Missile Strikes",
    mode: "hybrid",
    format: "mvt",
    minZoom: 4,
    maxZoom: 16,
    ttlSeconds: 120,
    tenantScoped: true,
    requiresAuth: true,
    timeBucketSize: "1h",
  },
  {
    layerId: "power_outages",
    displayName: "Power Outages",
    mode: "on_demand",
    format: "mvt",
    minZoom: 4,
    maxZoom: 12,
    ttlSeconds: 3600, // 1h — updated infrequently
    tenantScoped: false,
    requiresAuth: false,
    timeBucketSize: "6h",
  },
  {
    layerId: "infrastructure",
    displayName: "Infrastructure Damage",
    mode: "hybrid",
    format: "mvt",
    minZoom: 4,
    maxZoom: 16,
    ttlSeconds: 1800,
    tenantScoped: false,
    requiresAuth: false,
    timeBucketSize: "1d",
  },
  {
    layerId: "thermal",
    displayName: "Thermal Anomalies (FIRMS)",
    mode: "pre_generated",
    format: "mvt",
    minZoom: 3,
    maxZoom: 14,
    ttlSeconds: 21600, // 6h — FIRMS data cadence
    tenantScoped: false,
    requiresAuth: false,
    timeBucketSize: "6h",
  },
  {
    layerId: "satellite_rgb",
    displayName: "Satellite RGB",
    mode: "pre_generated",
    format: "webp",
    minZoom: 5,
    maxZoom: 18,
    ttlSeconds: 86400, // 1d
    tenantScoped: false,
    requiresAuth: false,
    timeBucketSize: "1d",
  },
  {
    layerId: "social_activity",
    displayName: "Social Media Activity",
    mode: "on_demand",
    format: "mvt",
    minZoom: 4,
    maxZoom: 14,
    ttlSeconds: 600,
    tenantScoped: true,
    requiresAuth: true,
    timeBucketSize: "1h",
  },
  {
    layerId: "troop_movement",
    displayName: "Troop Movement",
    mode: "on_demand",
    format: "mvt",
    minZoom: 5,
    maxZoom: 16,
    ttlSeconds: 900,
    tenantScoped: true,
    requiresAuth: true,
    timeBucketSize: "6h",
  },
];

const byId = new Map<string, LayerTileConfig>(LAYER_CONFIGS.map((c) => [c.layerId, c]));

export function getLayerConfig(layerId: string): LayerTileConfig | undefined {
  return byId.get(layerId);
}

export function listLayerConfigs(): LayerTileConfig[] {
  return [...LAYER_CONFIGS];
}

export function registerLayerConfig(config: LayerTileConfig): void {
  LAYER_CONFIGS.push(config);
  byId.set(config.layerId, config);
}
