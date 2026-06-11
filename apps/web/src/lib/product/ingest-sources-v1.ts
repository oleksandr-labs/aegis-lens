/**
 * Ingest Sources v1 — configuration for all Phase 1 data ingestion connectors.
 *
 * Covers: Telegram curated channels, RSS news feeds, NASA FIRMS fire/explosion
 * data, ADS-B aircraft tracking, and Sentinel-2 AOI satellite imagery.
 *
 * Конфігурація всіх джерел інгесту фази 1.
 */

'use server';

// ── IngestSource enum ─────────────────────────────────────────────────────────

export enum IngestSource {
  Telegram   = 'telegram',
  Rss        = 'rss',
  NasaFirms  = 'nasa-firms',
  AdsB       = 'ads-b',
  Sentinel2  = 'sentinel2',
}

// ── Config shape ──────────────────────────────────────────────────────────────

export interface IngestSourceConfig {
  /** Human display name — Назва для відображення */
  name: string;
  /** Processing priority 1 (highest) – 5 (lowest) — Пріоритет обробки */
  priority: 1 | 2 | 3 | 4 | 5;
  /** Target end-to-end latency in seconds — Цільова затримка (сек) */
  latency_target_s: number;
  /** Expected uptime reliability 0–1 — Надійність джерела 0–1 */
  reliability: number;
  /** Polling or push — Тип підключення */
  connectionType: 'poll' | 'push' | 'stream';
  /** Approximate events per day at peak — Приблизна кількість подій на день */
  peakEventsPerDay: number;
  /** Requires auth token — Потребує токена */
  requiresAuth: boolean;
}

// ── Source configs ────────────────────────────────────────────────────────────

/**
 * Per-source ingestion configuration.
 *
 * Конфігурація по кожному джерелу.
 */
export const INGEST_SOURCE_CONFIGS: Record<IngestSource, IngestSourceConfig> = {
  [IngestSource.Telegram]: {
    name: 'Telegram Channels',
    priority: 1,
    latency_target_s: 30,
    reliability: 0.95,
    connectionType: 'stream',
    peakEventsPerDay: 5_000,
    requiresAuth: true,
  },
  [IngestSource.Rss]: {
    name: 'RSS News Feeds',
    priority: 2,
    latency_target_s: 120,
    reliability: 0.99,
    connectionType: 'poll',
    peakEventsPerDay: 2_000,
    requiresAuth: false,
  },
  [IngestSource.NasaFirms]: {
    name: 'NASA FIRMS (Fire / Explosion)',
    priority: 2,
    latency_target_s: 3_600,
    reliability: 0.97,
    connectionType: 'poll',
    peakEventsPerDay: 500,
    requiresAuth: true,
  },
  [IngestSource.AdsB]: {
    name: 'ADS-B Aircraft Tracking',
    priority: 1,
    latency_target_s: 10,
    reliability: 0.92,
    connectionType: 'stream',
    peakEventsPerDay: 50_000,
    requiresAuth: true,
  },
  [IngestSource.Sentinel2]: {
    name: 'Sentinel-2 AOI Imagery',
    priority: 3,
    latency_target_s: 86_400,
    reliability: 0.98,
    connectionType: 'poll',
    peakEventsPerDay: 20,
    requiresAuth: true,
  },
};

// ── Notes ─────────────────────────────────────────────────────────────────────

export const INGEST_SOURCES_NOTE_EN =
  'Phase 1 sources cover the critical real-time and near-real-time event stream for Ukraine. ' +
  'Sentinel-2 revisit is ~5 days; cadence depends on cloud cover.';

export const INGEST_SOURCES_NOTE_UK =
  'Джерела фази 1 охоплюють критичний потік подій у реальному та близькому до реального часі для України. ' +
  'Revisit Sentinel-2 — ~5 днів; залежить від хмарності.';
