/**
 * AIS Integration — Automatic Identification System marine vessel tracking.
 *
 * Tracks naval assets, blockade enforcement, and humanitarian corridor ships
 * across the Black Sea and Sea of Azov.
 *
 * AIS-інтеграція: відстеження морських суден у Чорному морі та Азові.
 */

'use server';

// ── Sources ───────────────────────────────────────────────────────────────────

export type AisSource = 'aisstream' | 'marinetraffic' | 'vesseltracker';

export const AIS_SOURCES: AisSource[] = ['aisstream', 'marinetraffic', 'vesseltracker'];

// ── Update cadence ────────────────────────────────────────────────────────────

/** Target vessel position update interval in seconds — Інтервал оновлення позиції (сек) */
export const AIS_UPDATE_INTERVAL_SECONDS = 60;

// ── Source configs ────────────────────────────────────────────────────────────

export interface AisSourceConfig {
  source: AisSource;
  name: string;
  authType: 'api-key' | 'websocket-token';
  /** Whether real-time stream is available — Чи доступний real-time потік */
  realtime: boolean;
  /** Historical data retention in days — Зберігання історичних даних (дні) */
  historyDays: number;
  /** Max vessels tracked simultaneously — Макс. суден одночасно */
  maxVessels: number;
  /** Coverage area — Зона покриття */
  coverage: string;
  priority: 1 | 2 | 3;
}

export const AIS_SOURCE_CONFIGS: Record<AisSource, AisSourceConfig> = {
  aisstream: {
    source: 'aisstream',
    name: 'AISstream.io',
    authType: 'websocket-token',
    realtime: true,
    historyDays: 7,
    maxVessels: 100_000,
    coverage: 'global',
    priority: 1,
  },
  marinetraffic: {
    source: 'marinetraffic',
    name: 'MarineTraffic',
    authType: 'api-key',
    realtime: false,
    historyDays: 365,
    maxVessels: 50_000,
    coverage: 'global',
    priority: 2,
  },
  vesseltracker: {
    source: 'vesseltracker',
    name: 'VesselTracker',
    authType: 'api-key',
    realtime: false,
    historyDays: 30,
    maxVessels: 20_000,
    coverage: 'Black Sea / Azov Sea',
    priority: 3,
  },
};

// ── Vessel classification ─────────────────────────────────────────────────────

export type VesselClass =
  | 'warship'
  | 'cargo'
  | 'tanker'
  | 'passenger'
  | 'fishing'
  | 'unknown';

export const VESSEL_CLASSES: VesselClass[] = [
  'warship', 'cargo', 'tanker', 'passenger', 'fishing', 'unknown',
];

// ── Integration config ────────────────────────────────────────────────────────

export interface AisIntegrationConfig {
  sources: AisSource[];
  sourceConfigs: Record<AisSource, AisSourceConfig>;
  updateIntervalSeconds: number;
  /** AOI bounding box [west, south, east, north] for Black Sea — BB Чорного моря */
  defaultBbox: [number, number, number, number];
  vesselClasses: VesselClass[];
  /** Required tier — Необхідний tier */
  requiredTier: string;
}

export const AIS_INTEGRATION_CONFIG: AisIntegrationConfig = {
  sources: AIS_SOURCES,
  sourceConfigs: AIS_SOURCE_CONFIGS,
  updateIntervalSeconds: AIS_UPDATE_INTERVAL_SECONDS,
  defaultBbox: [27.5, 40.8, 41.5, 47.0], // Black Sea + Sea of Azov
  vesselClasses: VESSEL_CLASSES,
  requiredTier: 'pro',
};
