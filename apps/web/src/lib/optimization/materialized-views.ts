/**
 * Materialized view definitions for hot aggregates.
 *
 * These views pre-aggregate expensive queries and are refreshed on a
 * short interval (CONCURRENTLY to avoid read locks).
 *
 * Use pg_cron or the ingest-svc scheduler to call REFRESH periodically.
 * See also: materialized-views.sql for the CREATE statements.
 */

export interface MatViewDef {
  /** SQL view name (no schema prefix — defaults to public). */
  name: string;
  /** ISO 8601 duration string for the refresh interval (used by scheduler). */
  refreshInterval: string;
  /** Full CREATE MATERIALIZED VIEW SQL. */
  sql: string;
  /** Additional CREATE UNIQUE/REGULAR INDEX statements for the view. */
  indexes: string[];
}

export const MATERIALIZED_VIEWS: MatViewDef[] = [
  {
    name: "mv_events_by_region_day",
    refreshInterval: "PT5M", // every 5 minutes
    sql: `CREATE MATERIALIZED VIEW IF NOT EXISTS mv_events_by_region_day AS
SELECT
  region_code,
  DATE_TRUNC('day', occurred_at) AS day,
  event_class,
  COUNT(*)                       AS event_count,
  SUM(CASE WHEN verified THEN 1 ELSE 0 END) AS verified_count
FROM events
GROUP BY region_code, DATE_TRUNC('day', occurred_at), event_class
WITH DATA;`,
    indexes: [
      `CREATE UNIQUE INDEX IF NOT EXISTS uidx_mv_events_by_region_day
  ON mv_events_by_region_day (region_code, day, event_class);`,
      `CREATE INDEX IF NOT EXISTS idx_mv_events_by_region_day_day
  ON mv_events_by_region_day (day DESC);`,
    ],
  },
  {
    name: "mv_source_health_summary",
    refreshInterval: "PT1M", // every 1 minute
    sql: `CREATE MATERIALIZED VIEW IF NOT EXISTS mv_source_health_summary AS
SELECT
  s.id                                                        AS source_id,
  s.name                                                      AS source_name,
  s.type                                                      AS source_type,
  COUNT(e.id)                                                 AS total_events_24h,
  AVG(e.confidence_score)                                     AS avg_confidence,
  MAX(e.occurred_at)                                          AS last_event_at,
  SUM(CASE WHEN e.verified THEN 1 ELSE 0 END)::float
    / NULLIF(COUNT(e.id), 0)                                  AS verification_rate,
  (s.metadata->>'health_status')::text                        AS health_status
FROM sources s
LEFT JOIN events e
  ON e.source_id = s.id
  AND e.occurred_at >= NOW() - INTERVAL '24 hours'
GROUP BY s.id, s.name, s.type, s.metadata
WITH DATA;`,
    indexes: [
      `CREATE UNIQUE INDEX IF NOT EXISTS uidx_mv_source_health_summary_source_id
  ON mv_source_health_summary (source_id);`,
    ],
  },
  {
    name: "mv_active_alerts_count",
    refreshInterval: "PT30S", // every 30 seconds — alerts are time-critical
    sql: `CREATE MATERIALIZED VIEW IF NOT EXISTS mv_active_alerts_count AS
SELECT
  oblast_code,
  COUNT(*)                                              AS active_count,
  MIN(started_at)                                       AS oldest_alert_at,
  MAX(started_at)                                       AS newest_alert_at,
  ARRAY_AGG(DISTINCT alert_type ORDER BY alert_type)    AS alert_types
FROM air_raid_alerts
WHERE ended_at IS NULL
GROUP BY oblast_code
WITH DATA;`,
    indexes: [
      `CREATE UNIQUE INDEX IF NOT EXISTS uidx_mv_active_alerts_count_oblast
  ON mv_active_alerts_count (oblast_code);`,
    ],
  },
  {
    name: "mv_equipment_losses_daily",
    refreshInterval: "PT10M", // every 10 minutes — Oryx updates ~daily
    sql: `CREATE MATERIALIZED VIEW IF NOT EXISTS mv_equipment_losses_daily AS
SELECT
  DATE_TRUNC('day', loss_date)  AS day,
  side,
  equipment_category,
  loss_type,
  COUNT(*)                      AS loss_count,
  SUM(quantity)                 AS total_units
FROM equipment_losses
GROUP BY
  DATE_TRUNC('day', loss_date),
  side,
  equipment_category,
  loss_type
WITH DATA;`,
    indexes: [
      `CREATE UNIQUE INDEX IF NOT EXISTS uidx_mv_equipment_losses_daily
  ON mv_equipment_losses_daily (day, side, equipment_category, loss_type);`,
      `CREATE INDEX IF NOT EXISTS idx_mv_equipment_losses_daily_day
  ON mv_equipment_losses_daily (day DESC);`,
    ],
  },
];
