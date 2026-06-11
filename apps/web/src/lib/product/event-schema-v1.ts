/**
 * Event Schema v1 — canonical event structure backed by Postgres/PostGIS.
 *
 * Defines the versioned contract for all ingested events stored in the
 * spatial database. PostGIS + TimescaleDB extensions required.
 *
 * Канонічна схема події v1. Зберігається у Postgres/PostGIS + TimescaleDB.
 */

'use server';

// ── Version ───────────────────────────────────────────────────────────────────

export const EVENT_SCHEMA_VERSION = '1.0' as const;

// ── Required fields ───────────────────────────────────────────────────────────

/**
 * Fields that must be present on every ingested event.
 *
 * Обов'язкові поля кожної події.
 */
export const REQUIRED_FIELDS = [
  'id',
  'source',
  'source_id',
  'occurred_at',
  'ingested_at',
  'location',        // PostGIS POINT (lon, lat, [alt])
  'event_class',     // Tier-1 classification
  'confidence',      // 0–1 float
  'danger_score',    // 0–100 int
  'raw_text',
  'language',
  'schema_version',
] as const;

export type RequiredField = typeof REQUIRED_FIELDS[number];

// ── PostGIS extensions ────────────────────────────────────────────────────────

/**
 * Postgres extensions required before running migrations.
 *
 * Розширення Postgres, що мають бути встановлені до міграцій.
 */
export const POSTGIS_EXTENSIONS = ['postgis', 'timescaledb'] as const;

export type PostgisExtension = typeof POSTGIS_EXTENSIONS[number];

// ── Schema config ─────────────────────────────────────────────────────────────

export interface EventSchemaV1Config {
  version: typeof EVENT_SCHEMA_VERSION;
  /** Postgres schema name — Назва схеми Postgres */
  pgSchema: string;
  /** Hypertable partition column — Колонка партиціонування TimescaleDB */
  hypertableColumn: string;
  /** Chunk interval in hours — Інтервал чанку */
  chunkIntervalHours: number;
  /** Spatial index type — Тип просторового індексу */
  spatialIndex: 'GIST' | 'BRIN';
  /** Enable row-level security — Увімкнути RLS */
  rowLevelSecurity: boolean;
  requiredFields: ReadonlyArray<RequiredField>;
  extensions: ReadonlyArray<PostgisExtension>;
}

export const EVENT_SCHEMA_V1_CONFIG: EventSchemaV1Config = {
  version: EVENT_SCHEMA_VERSION,
  pgSchema: 'aegis',
  hypertableColumn: 'occurred_at',
  chunkIntervalHours: 24,
  spatialIndex: 'GIST',
  rowLevelSecurity: true,
  requiredFields: REQUIRED_FIELDS,
  extensions: POSTGIS_EXTENSIONS,
};

// ── Notes ─────────────────────────────────────────────────────────────────────

export const SCHEMA_NOTE_EN =
  'Event Schema v1 is the stable contract for MVP. Breaking changes require a schema version bump.';

export const SCHEMA_NOTE_UK =
  'Схема події v1 — стабільний контракт для MVP. Зміни зі зламом сумісності потребують підвищення версії схеми.';
