-- Materialized Views — Aegis Lens / Ukrainian MAP
-- Hot aggregate pre-computation for sub-second dashboard and map queries.
--
-- Run once to create; then schedule REFRESH MATERIALIZED VIEW CONCURRENTLY
-- via pg_cron or the ingest-svc scheduler (see materialized-views.ts for intervals).
--
-- All CREATE statements use IF NOT EXISTS — safe to re-run.
-- REFRESH CONCURRENTLY requires a UNIQUE INDEX on the view.

-- =============================================================================
-- 1. mv_events_by_region_day
--    Event counts by region × day × class — refreshed every 5 minutes.
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_events_by_region_day AS
SELECT
  region_code,
  DATE_TRUNC('day', occurred_at) AS day,
  event_class,
  COUNT(*)                       AS event_count,
  SUM(CASE WHEN verified THEN 1 ELSE 0 END) AS verified_count
FROM events
GROUP BY region_code, DATE_TRUNC('day', occurred_at), event_class
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS uidx_mv_events_by_region_day
  ON mv_events_by_region_day (region_code, day, event_class);

CREATE INDEX IF NOT EXISTS idx_mv_events_by_region_day_day
  ON mv_events_by_region_day (day DESC);

-- Refresh command (schedule every 5 min):
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_events_by_region_day;

-- =============================================================================
-- 2. mv_source_health_summary
--    Aggregated source health stats — refreshed every 1 minute.
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_source_health_summary AS
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
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS uidx_mv_source_health_summary_source_id
  ON mv_source_health_summary (source_id);

-- Refresh command (schedule every 1 min):
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_source_health_summary;

-- =============================================================================
-- 3. mv_active_alerts_count
--    Count of active alerts by oblast — refreshed every 30 seconds.
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_active_alerts_count AS
SELECT
  oblast_code,
  COUNT(*)                                              AS active_count,
  MIN(started_at)                                       AS oldest_alert_at,
  MAX(started_at)                                       AS newest_alert_at,
  ARRAY_AGG(DISTINCT alert_type ORDER BY alert_type)    AS alert_types
FROM air_raid_alerts
WHERE ended_at IS NULL
GROUP BY oblast_code
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS uidx_mv_active_alerts_count_oblast
  ON mv_active_alerts_count (oblast_code);

-- Refresh command (schedule every 30 sec):
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_active_alerts_count;

-- =============================================================================
-- 4. mv_equipment_losses_daily
--    Oryx loss counts by day, side, and category — refreshed every 10 minutes.
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_equipment_losses_daily AS
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
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS uidx_mv_equipment_losses_daily
  ON mv_equipment_losses_daily (day, side, equipment_category, loss_type);

CREATE INDEX IF NOT EXISTS idx_mv_equipment_losses_daily_day
  ON mv_equipment_losses_daily (day DESC);

-- Refresh command (schedule every 10 min):
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_equipment_losses_daily;

-- =============================================================================
-- pg_cron setup (run once as superuser if pg_cron extension is available)
-- =============================================================================

-- SELECT cron.schedule('refresh-events-by-region', '*/5 * * * *',
--   'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_events_by_region_day');

-- SELECT cron.schedule('refresh-source-health', '* * * * *',
--   'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_source_health_summary');

-- SELECT cron.schedule('refresh-active-alerts', '* * * * *',
--   'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_active_alerts_count');

-- SELECT cron.schedule('refresh-equipment-losses', '*/10 * * * *',
--   'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_equipment_losses_daily');
