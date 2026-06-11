/**
 * TimescaleDB time-windowed query builders for the events hypertable.
 * Побудова запитів TimescaleDB із вікнуванням часу для гіпертаблиці подій.
 *
 * The events table must be a TimescaleDB hypertable partitioned on the
 * `occurred_at` timestamptz column for time_bucket() to work efficiently.
 * Materialized continuous aggregates are recommended for dense time ranges.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type BucketInterval = '1m' | '5m' | '1h' | '1d';

export interface TimeWindowQuery {
  fromIso: string;
  toIso: string;
  bucketInterval: BucketInterval;
  /** Optional Postgres-safe key→value filter pairs (ANDed). */
  filters?: Record<string, unknown>;
}

export interface TimeBucket {
  /** ISO timestamp for the start of this bucket. */
  bucketStart: string;
  count: number;
  maxDangerScore: number;
  avgConfidence: number;
  /** Distinct event classes observed in this bucket. */
  eventClasses: string[];
}

// ── SQL builders ──────────────────────────────────────────────────────────────

/**
 * Build a parameterised SQL query using TimescaleDB time_bucket().
 * Побудова параметризованого SQL-запиту з TimescaleDB time_bucket().
 *
 * Returns a SQL string with $1 = fromIso, $2 = toIso placeholders.
 * Additional filter params start at $3.
 *
 * @param query  TimeWindowQuery config
 */
export function buildTimeBucketQuery(query: TimeWindowQuery): string {
  const interval = query.bucketInterval;
  const filterEntries = query.filters ? Object.entries(query.filters) : [];

  let whereClause = 'WHERE occurred_at >= $1::timestamptz AND occurred_at < $2::timestamptz';
  let paramIdx = 3;
  for (const [col] of filterEntries) {
    whereClause += ` AND ${col} = $${paramIdx}`;
    paramIdx++;
  }

  return `
SELECT
  time_bucket('${interval}', occurred_at) AS bucket_start,
  COUNT(*) AS count,
  MAX(danger_score) AS max_danger_score,
  AVG(confidence) AS avg_confidence,
  ARRAY_AGG(DISTINCT event_class) AS event_classes
FROM events
${whereClause}
GROUP BY bucket_start
ORDER BY bucket_start ASC;
`.trim();
}

/**
 * Build a density query returning per-bucket event counts for the histogram endpoint.
 * Побудова запиту щільності, що повертає кількість подій по бакетах для ендпоїнту гістограми.
 *
 * Optimised for continuous aggregate mat views if available.
 */
export function buildDensityQuery(query: TimeWindowQuery): string {
  const interval = query.bucketInterval;

  return `
SELECT
  time_bucket('${interval}', occurred_at) AS bucket_start,
  COUNT(*) AS count,
  MAX(danger_score) AS max_severity
FROM events
WHERE occurred_at >= $1::timestamptz
  AND occurred_at < $2::timestamptz
GROUP BY bucket_start
ORDER BY bucket_start ASC;
`.trim();
}

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const TIMESCALEDB_QUERY_NOTES_EN: Record<string, string> = {
  'hypertable-events-table':
    'The events table must be converted to a TimescaleDB hypertable: ' +
    "SELECT create_hypertable('events', 'occurred_at', if_not_exists => TRUE); " +
    'Chunk interval default is 7 days; tune with chunk_time_interval.',
  'time_bucket-function':
    "time_bucket('1h', occurred_at) groups events into 1-hour buckets aligned to midnight UTC. " +
    'Supported intervals: 1m, 5m, 1h, 1d. Smaller intervals → more rows → heavier query.',
  'materialized-continuous-agg':
    'Create a continuous aggregate for the density endpoint: ' +
    "CREATE MATERIALIZED VIEW events_1h WITH (timescaledb.continuous) AS " +
    "SELECT time_bucket('1 hour', occurred_at) AS bucket, COUNT(*) AS count FROM events GROUP BY 1; " +
    'Then refresh with add_continuous_aggregate_policy().',
};

export const TIMESCALEDB_QUERY_NOTES_UK: Record<string, string> = {
  'hypertable-events-table':
    'Таблиця events повинна бути перетворена на гіпертаблицю TimescaleDB: ' +
    "SELECT create_hypertable('events', 'occurred_at', if_not_exists => TRUE); " +
    'Стандартний інтервал чанку — 7 днів; налаштовуйте через chunk_time_interval.',
  'time_bucket-function':
    "time_bucket('1h', occurred_at) групує події в 1-годинні бакети, вирівняні по опівночі UTC. " +
    'Підтримувані інтервали: 1m, 5m, 1h, 1d. Менші інтервали → більше рядків → важчий запит.',
  'materialized-continuous-agg':
    'Створіть continuous aggregate для ендпоїнту щільності: ' +
    "CREATE MATERIALIZED VIEW events_1h WITH (timescaledb.continuous) AS " +
    "SELECT time_bucket('1 hour', occurred_at) AS bucket, COUNT(*) AS count FROM events GROUP BY 1; " +
    'Потім оновлюйте через add_continuous_aggregate_policy().',
};
