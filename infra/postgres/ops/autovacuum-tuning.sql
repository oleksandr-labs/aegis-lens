-- =============================================================================
-- Autovacuum Tuning — Per-table storage parameters
-- Aegis Lens / Ukrainian MAP
--
-- Run after initial schema creation (idempotent — ALTER TABLE IF EXISTS).
-- Reference: https://www.postgresql.org/docs/16/runtime-config-autovacuum.html
--
-- Design rationale
-- ────────────────
-- Default autovacuum_vacuum_scale_factor = 0.20 means vacuum fires after 20%
-- of a table has been modified. For a 100 M-row `events` table that is 20 M
-- dead tuples before cleanup — severe bloat and increased query plan variance.
--
-- High-write tables need much lower scale factors so vacuum runs frequently
-- on small increments rather than infrequently on huge batches.
--
-- maintenance_work_mem is set at the system level (ALTER SYSTEM) so vacuum
-- workers can sort and process more index entries per run, reducing the
-- number of index passes (each pass is an LRU miss storm).
-- =============================================================================

-- ── 1. Global vacuum worker memory ───────────────────────────────────────────
-- 256 MB gives each vacuum worker enough room to hold most index entries in
-- memory, avoiding repeated index scans during a single vacuum pass.
-- The setting applies to all autovacuum workers AND manual VACUUM calls.
-- Restart NOT required — effective after pg_reload_conf().

ALTER SYSTEM SET maintenance_work_mem = '256MB';
SELECT pg_reload_conf();

-- Verify:
-- SHOW maintenance_work_mem;


-- ── 2. events table — high-write, time-partitioned ───────────────────────────
--
-- autovacuum_vacuum_scale_factor  = 0.02  → vacuum after 2% row churn
--   For a 10 M-row partition that fires after ~200 K dead tuples.
-- autovacuum_analyze_scale_factor = 0.01  → analyze after 1% new/changed rows
--   Keeps planner statistics fresh for the hot partition.
-- autovacuum_vacuum_cost_delay    = 2ms   → faster vacuum (less IO throttling)
--   Acceptable on SSD-backed RDS instances; revisit if IO pressure rises.
-- autovacuum_vacuum_cost_limit    = 400   → double the default cost budget
-- autovacuum_vacuum_threshold     = 1000  → minimum dead tuples before trigger
--   (avoids vacuuming essentially empty new partitions on every tick)

ALTER TABLE events SET (
  autovacuum_vacuum_scale_factor  = 0.02,
  autovacuum_analyze_scale_factor = 0.01,
  autovacuum_vacuum_cost_delay    = 2,
  autovacuum_vacuum_cost_limit    = 400,
  autovacuum_vacuum_threshold     = 1000,
  autovacuum_analyze_threshold    = 500
);

-- Also apply to any existing child partitions.
-- (New partitions inherit parent storage params automatically in PG 16.)
DO $$
DECLARE
  child_relname text;
BEGIN
  FOR child_relname IN
    SELECT c.relname
    FROM   pg_inherits  i
    JOIN   pg_class     p ON p.oid = i.inhparent
    JOIN   pg_class     c ON c.oid = i.inhrelid
    WHERE  p.relname = 'events'
  LOOP
    EXECUTE format(
      'ALTER TABLE %I SET (
         autovacuum_vacuum_scale_factor  = 0.02,
         autovacuum_analyze_scale_factor = 0.01,
         autovacuum_vacuum_cost_delay    = 2,
         autovacuum_vacuum_cost_limit    = 400,
         autovacuum_vacuum_threshold     = 1000,
         autovacuum_analyze_threshold    = 500
       )',
      child_relname
    );
    RAISE NOTICE 'Applied autovacuum settings to partition: %', child_relname;
  END LOOP;
END;
$$;


-- ── 3. audit_log table — append-heavy, seldom updated ────────────────────────
--
-- autovacuum_vacuum_scale_factor  = 0.05  → vacuum after 5% row churn
--   audit_log rows are insert-only in normal operation; dead tuples accumulate
--   only via retention deletes. A 5% threshold is appropriate.
-- autovacuum_analyze_scale_factor = 0.05  → analyze less aggressively
--   Statistics are stable for an append-only table; over-analyzing wastes IO.
-- autovacuum_vacuum_cost_delay    = 10ms  → default throttling (no urgency)
-- autovacuum_freeze_max_age is left at default (150 M transactions); the table
--   is unlikely to suffer wraparound given the retention delete schedule.

ALTER TABLE audit_log SET (
  autovacuum_vacuum_scale_factor  = 0.05,
  autovacuum_analyze_scale_factor = 0.05,
  autovacuum_vacuum_cost_delay    = 10,
  autovacuum_vacuum_threshold     = 5000,
  autovacuum_analyze_threshold    = 2500
);


-- ── 4. crawl_jobs table — moderate churn ─────────────────────────────────────
--
-- Jobs are inserted, updated through lifecycle states (queued→running→done),
-- then left in place for retention. Medium-low scale factor.

ALTER TABLE crawl_jobs SET (
  autovacuum_vacuum_scale_factor  = 0.05,
  autovacuum_analyze_scale_factor = 0.02,
  autovacuum_vacuum_threshold     = 500
);


-- ── 5. Verification: current per-table autovacuum settings ───────────────────
--
-- Run this to confirm settings are applied:
--
-- SELECT
--   relname,
--   reloptions
-- FROM pg_class
-- WHERE relname IN ('events', 'audit_log', 'crawl_jobs')
--   AND relkind = 'r'
-- ORDER BY relname;


-- ── 6. Monitor autovacuum activity ───────────────────────────────────────────
--
-- Check when each table was last vacuumed/analyzed:
--
-- SELECT
--   schemaname,
--   relname,
--   last_vacuum,
--   last_autovacuum,
--   last_analyze,
--   last_autoanalyze,
--   n_dead_tup,
--   n_live_tup,
--   round(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_tup_pct
-- FROM pg_stat_user_tables
-- WHERE relname IN ('events', 'audit_log', 'crawl_jobs')
-- ORDER BY n_dead_tup DESC;


-- ── 7. pg_cron: weekly autovacuum effectiveness report ───────────────────────
--
-- Writes a snapshot to aegis_ops.vacuum_health_log every Sunday 03:00 UTC.

CREATE TABLE IF NOT EXISTS aegis_ops.vacuum_health_log (
  id              bigserial PRIMARY KEY,
  captured_at     timestamptz NOT NULL DEFAULT now(),
  tablename       text        NOT NULL,
  last_autovacuum timestamptz,
  last_vacuum     timestamptz,
  n_dead_tup      bigint,
  n_live_tup      bigint,
  dead_tup_pct    numeric(6,2)
);

CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.unschedule('aegis-vacuum-health')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'aegis-vacuum-health'
);

SELECT cron.schedule(
  'aegis-vacuum-health',
  '0 3 * * 0',   -- every Sunday 03:00 UTC
  $$
  INSERT INTO aegis_ops.vacuum_health_log
    (tablename, last_autovacuum, last_vacuum, n_dead_tup, n_live_tup, dead_tup_pct)
  SELECT
    relname,
    last_autovacuum,
    last_vacuum,
    n_dead_tup,
    n_live_tup,
    round(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2)
  FROM pg_stat_user_tables
  WHERE relname IN ('events', 'audit_log', 'crawl_jobs')
  ORDER BY relname;
  $$
);
