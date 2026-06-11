/**
 * Commercial Satellite Integration — high-resolution tasking via Planet, BlackSky,
 * Maxar, and Capella.
 *
 * Phase 3 feature allowing enterprise customers to task commercial satellites
 * directly from an AOI within the Aegis Lens workspace.
 *
 * Комерційні супутники для корпоративних клієнтів фази 3.
 */

'use server';

// ── Providers ─────────────────────────────────────────────────────────────────

export type SatelliteProvider = 'planet' | 'blacksky' | 'maxar' | 'capella';

export const SATELLITE_PROVIDERS: SatelliteProvider[] = [
  'planet', 'blacksky', 'maxar', 'capella',
];

// ── Provider capabilities ─────────────────────────────────────────────────────

export interface SatelliteProviderSpec {
  provider: SatelliteProvider;
  name: string;
  /** Best GSD in metres — Найкраще просторове розрізнення (м) */
  gsdM: number;
  /** Sensor type — Тип сенсора */
  sensorType: 'optical' | 'sar' | 'both';
  /** Revisit time in hours — Час повторного знімання (год) */
  revisitHours: number;
  /** Approximate price per km² in USD — Приблизна ціна за км² (USD) */
  pricePerKm2Usd: number;
  /** Tasking latency in hours — Затримка замовлення (год) */
  taskingLatencyHours: number;
  /** Whether archive access is available — Чи є доступ до архіву */
  archiveAccess: boolean;
}

export const SATELLITE_PROVIDER_SPECS: Record<SatelliteProvider, SatelliteProviderSpec> = {
  planet: {
    provider: 'planet',
    name: 'Planet Labs (PlanetScope / SkySat)',
    gsdM: 0.5,
    sensorType: 'optical',
    revisitHours: 24,
    pricePerKm2Usd: 4,
    taskingLatencyHours: 24,
    archiveAccess: true,
  },
  blacksky: {
    provider: 'blacksky',
    name: 'BlackSky',
    gsdM: 1.0,
    sensorType: 'optical',
    revisitHours: 1,
    pricePerKm2Usd: 8,
    taskingLatencyHours: 2,
    archiveAccess: true,
  },
  maxar: {
    provider: 'maxar',
    name: 'Maxar Technologies (WorldView)',
    gsdM: 0.3,
    sensorType: 'optical',
    revisitHours: 24,
    pricePerKm2Usd: 20,
    taskingLatencyHours: 48,
    archiveAccess: true,
  },
  capella: {
    provider: 'capella',
    name: 'Capella Space (SAR)',
    gsdM: 0.5,
    sensorType: 'sar',
    revisitHours: 6,
    pricePerKm2Usd: 15,
    taskingLatencyHours: 4,
    archiveAccess: false,
  },
};

// ── Commercial satellite config ───────────────────────────────────────────────

export interface CommercialSatelliteConfig {
  providers: SatelliteProvider[];
  providerSpecs: Record<SatelliteProvider, SatelliteProviderSpec>;
  /** Required tier — Необхідний tier */
  requiredTier: string;
  /** Min AOI area in km² — Мін. площа AOI (км²) */
  minAoiKm2: number;
  /** Max AOI area per tasking in km² — Макс. площа AOI (км²) */
  maxAoiKm2: number;
}

export const COMMERCIAL_SATELLITE_CONFIG: CommercialSatelliteConfig = {
  providers: SATELLITE_PROVIDERS,
  providerSpecs: SATELLITE_PROVIDER_SPECS,
  requiredTier: 'enterprise',
  minAoiKm2: 1,
  maxAoiKm2: 10_000,
};

// ── Tasking stub ──────────────────────────────────────────────────────────────

/**
 * Build a satellite tasking request stub.
 * Real implementation calls the provider API via the satellite-tasking worker.
 *
 * Заглушка замовлення знімання. Реалізація — через воркер satellite-tasking.
 */
export function buildTaskingRequest(
  aoi: { west: number; south: number; east: number; north: number },
  provider: SatelliteProvider,
): object {
  return {
    provider,
    aoi: { type: 'bbox', coordinates: [aoi.west, aoi.south, aoi.east, aoi.north] },
    requestedAt: new Date().toISOString(),
    status: 'pending',
    spec: SATELLITE_PROVIDER_SPECS[provider],
  };
}

// ── Notes ─────────────────────────────────────────────────────────────────────

export const SATELLITE_INTEGRATION_NOTE_EN =
  'Commercial satellite tasking is integrated directly into the AOI workflow. ' +
  'Analysts draw an AOI, select a provider, and the tasking request is submitted in one click.';

export const SATELLITE_INTEGRATION_NOTE_UK =
  'Замовлення комерційних супутників інтегровано безпосередньо в робочий процес AOI. ' +
  'Аналітик малює AOI, обирає провайдера, і замовлення відправляється одним кліком.';
