-- =============================================================================
-- Index Audit + Bloat Monitoring
-- Aegis Lens / Ukrainian MAP
--
-- Schedule: weekly via pg_cron (see bottom of file).
-- Run manually: psql -f index-audit.sql -v ON_ERROR_STOP=1
--
-- Sections:
--   1. Bloated indexes  (> 20% bloat ratio)
--   2. Unused indexes   (zero scans since last stats reset)
--   3. Missing indexes  (sequential scans on large tables)
--   4. Index health summary
--   5. pg_cron schedule
-- =============================================================================

-- ── 0. Prerequisites ──────────────────────────────────────────────────────────
-- pgstattuple must be installed for accurate bloat measurement.
CREATE EXTENSION IF NOT EXISTS pgstattuple;

-- ── 1. Bloated Indexes ───────────────────────────────────────────────────────
--
-- Uses the pgstattuple approximation (pgstatindex) which is fast enough
-- for production (reads index meta pages only, not full data).
-- Bloat ratio = (leaf_pages - live_leaf_pages) / leaf_pages
-- Threshold: 20% bloat. Candidates for REINDEX CONCURRENTLY.
-- =============================================================================

CREATE OR REPLACE VIEW aegis_ops.bloated_indexes AS
WITH index_stats AS (
  SELECT
    schemaname,
    tablename,
    indexname,
    pg_relation_size(quote_ident(schemaname) || '.' || quote_ident(indexname))  AS index_size_bytes,
    (pgstatindex(quote_ident(schemaname) || '.' || quote_ident(indexname))).*
  FROM pg_stat_user_indexes
  WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
)
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(index_size_bytes)                                          AS index_size,
  round(100.0 * (leaf_pages - live_leaf_count) / NULLIF(leaf_pages, 0), 2) AS bloat_pct,
  leaf_pages,
  live_leaf_count,
  avg_leaf_density
FROM index_stats
WHERE leaf_pages > 100                           -- ignore tiny indexes
  AND round(100.0 * (leaf_pages - live_leaf_count) / NULLIF(leaf_pages, 0), 2) > 20
ORDER BY bloat_pct DESC;

-- Quick report query (call after creating view):
-- SELECT * FROM aegis_ops.bloated_indexes;

-- ── 2. Unused Indexes ────────────────────────────────────────────────────────
--
-- Indexes with idx_scan = 0 since the last pg_stat_reset().
-- Always verify: some indexes are used only occasionally (e.g. monthly reports).
-- Cross-reference with query plans before dropping.
-- =============================================================================

CREATE OR REPLACE VIEW aegis_ops.unused_indexes AS
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid))  AS index_size,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  -- When were stats last reset?
  (SELECT stats_reset FROM pg_stat_bgwriter)    AS stats_reset_at
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  -- Never suggest dropping primary keys or unique constraints
  AND indexname NOT IN (
    SELECT conname FROM pg_constraint WHERE contype IN ('p', 'u')
  )
  -- Ignore very small indexes — cheap to keep
  AND pg_relation_size(indexrelid) > 65536       -- > 64 KiB
  AND schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_relation_size(indexrelid) DESC;

-- Quick report query:
-- SELECT * FROM aegis_ops.unused_indexes;

-- ── 3. Missing Indexes (Sequential Scans on Large Tables) ───────────────────
--
-- Tables where:
--   - seq_scan count is high relative to idx_scan
--   - estimated live tuples > 10 000
--
-- These are *candidates*, not guaranteed missing-index bugs.
-- A full table scan is correct for queries that return > ~5% of rows.
-- Review EXPLAIN plans before adding any index.
-- =============================================================================

CREATE OR REPLACE VIEW aegis_ops.missing_index_candidates AS
SELECT
  schemaname,
  relname                                         AS tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  n_live_tup,
  round(100.0 * seq_scan / NULLIF(seq_scan + idx_scan, 0), 2)
                                                  AS seq_scan_pct,
  pg_size_pretty(pg_total_relation_size(relid))  AS total_size
FROM pg_stat_user_tables
WHERE n_live_tup     > 10_000
  AND seq_scan       > 100
  AND round(100.0 * seq_scan / NULLIF(seq_scan + idx_scan, 0), 2) > 60
  AND schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY seq_tup_read DESC;

-- Quick report query:
-- SELECT * FROM aegis_ops.missing_index_candidates;

-- ── 4. Index Health Summary ──────────────────────────────────────────────────
--
-- One-stop dashboard row per table: index count, total index size,
-- cache hit ratio. A cache_hit_ratio < 99% on an index-heavy table
-- indicates memory pressure (shared_buffers / PgBouncer pool too small).
-- =============================================================================

CREATE OR REPLACE VIEW aegis_ops.index_health_summary AS
SELECT
  s.schemaname,
  s.relname                                          AS tablename,
  count(i.indexrelid)                                AS index_count,
  pg_size_pretty(pg_total_relation_size(s.relid))   AS total_size,
  pg_size_pretty(sum(pg_relation_size(i.indexrelid)))
                                                     AS total_index_size,
  round(
    100.0 * sum(i.idx_blks_hit) /
    NULLIF(sum(i.idx_blks_hit) + sum(i.idx_blks_read), 0),
    2
  )                                                  AS index_cache_hit_pct
FROM pg_stat_user_tables  s
JOIN pg_statio_user_indexes i ON s.relid = i.relid
GROUP BY s.schemaname, s.relname, s.relid
ORDER BY pg_total_relation_size(s.relid) DESC;

-- ── 5. Helper: schema setup ──────────────────────────────────────────────────

-- Create ops schema if absent
CREATE SCHEMA IF NOT EXISTS aegis_ops;

-- Recreate views under aegis_ops (idempotent)
-- (Views defined above without schema prefix need to be re-run in schema context
--  or prefixed. The statementsbelow are the canonical definitions.)

-- Bloated indexes — production-ready definition
CREATE OR REPLACE VIEW aegis_ops.bloated_indexes AS
WITH idx AS (
  SELECT
    schemaname,
    tablename,
    indexname,
    indexrelid,
    pg_relation_size(indexrelid)  AS index_size_bytes
  FROM pg_stat_user_indexes
  WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
),
stat AS (
  SELECT
    i.schemaname,
    i.tablename,
    i.indexname,
    i.index_size_bytes,
    (pgstatindex(i.indexrelid)).*
  FROM idx i
  WHERE i.index_size_bytes > 8192   -- at least one real page
)
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(index_size_bytes)                                             AS index_size,
  round(
    100.0 * (leaf_pages - live_leaf_count) / NULLIF(leaf_pages, 0),
    2
  )                                                                            AS bloat_pct,
  leaf_pages,
  live_leaf_count,
  round(avg_leaf_density::numeric, 2)                                          AS avg_leaf_density,
  'REINDEX CONCURRENTLY ' || quote_ident(indexname) || ';'                    AS suggested_action
FROM stat
WHERE leaf_pages > 100
  AND (leaf_pages - live_leaf_count)::float / NULLIF(leaf_pages, 0) > 0.20
ORDER BY bloat_pct DESC NULLS LAST;

CREATE OR REPLACE VIEW aegis_ops.unused_indexes AS
SELECT
  ui.schemaname,
  ui.tablename,
  ui.indexname,
  pg_size_pretty(pg_relation_size(ui.indexrelid))  AS index_size,
  ui.idx_scan,
  ui.idx_tup_read,
  ui.idx_tup_fetch,
  (SELECT stats_reset FROM pg_stat_bgwriter)        AS stats_reset_at,
  'DROP INDEX CONCURRENTLY ' || quote_ident(ui.indexname) || '; -- VERIFY first'
                                                    AS suggested_action
FROM pg_stat_user_indexes ui
LEFT JOIN pg_constraint c
  ON  c.conname      = ui.indexname
  AND c.conrelid     = ui.relid
  AND c.contype     IN ('p', 'u')
WHERE ui.idx_scan   = 0
  AND c.conname     IS NULL                         -- not a PK/unique constraint
  AND pg_relation_size(ui.indexrelid) > 65536
  AND ui.schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_relation_size(ui.indexrelid) DESC;

CREATE OR REPLACE VIEW aegis_ops.missing_index_candidates AS
SELECT
  schemaname,
  relname                                           AS tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  n_live_tup,
  round(100.0 * seq_scan / NULLIF(seq_scan + idx_scan, 0), 2)
                                                    AS seq_scan_pct,
  pg_size_pretty(pg_total_relation_size(relid))    AS total_size
FROM pg_stat_user_tables
WHERE n_live_tup > 10_000
  AND seq_scan   > 100
  AND round(100.0 * seq_scan / NULLIF(seq_scan + idx_scan, 0), 2) > 60
  AND schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY seq_tup_read DESC;

CREATE OR REPLACE VIEW aegis_ops.index_health_summary AS
SELECT
  s.schemaname,
  s.relname                                         AS tablename,
  count(i.indexrelid)                               AS index_count,
  pg_size_pretty(pg_total_relation_size(s.relid))  AS total_size,
  pg_size_pretty(
    coalesce(sum(pg_relation_size(i.indexrelid)), 0)
  )                                                 AS total_index_size,
  round(
    100.0 * coalesce(sum(i.idx_blks_hit), 0) /
    NULLIF(
      coalesce(sum(i.idx_blks_hit), 0) + coalesce(sum(i.idx_blks_read), 0),
      0
    ),
    2
  )                                                 AS index_cache_hit_pct
FROM pg_stat_user_tables  s
LEFT JOIN pg_statio_user_indexes i ON s.relid = i.relid
GROUP BY s.schemaname, s.relname, s.relid
ORDER BY pg_total_relation_size(s.relid) DESC;

-- ── 6. pg_cron Schedule ──────────────────────────────────────────────────────
--
-- Runs every Sunday at 02:00 UTC.
-- Writes results to aegis_ops.index_audit_log for trending.
-- =============================================================================

-- Audit log table (create once)
CREATE TABLE IF NOT EXISTS aegis_ops.index_audit_log (
  id            bigserial PRIMARY KEY,
  run_at        timestamptz NOT NULL DEFAULT now(),
  audit_type    text        NOT NULL,  -- 'bloated' | 'unused' | 'missing'
  schemaname    text,
  tablename     text,
  indexname     text,
  detail        jsonb
);

CREATE INDEX IF NOT EXISTS idx_audit_log_run_at
  ON aegis_ops.index_audit_log (run_at DESC);

-- Install pg_cron if not already present
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remove existing schedule to make this script idempotent
SELECT cron.unschedule('aegis-index-audit')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'aegis-index-audit'
);

SELECT cron.schedule(
  'aegis-index-audit',
  '0 2 * * 0',           -- every Sunday 02:00 UTC
  $$
  -- Log bloated indexes
  INSERT INTO aegis_ops.index_audit_log (audit_type, schemaname, tablename, indexname, detail)
  SELECT
    'bloated',
    schemaname,
    tablename,
    indexname,
    jsonb_build_object(
      'bloat_pct',        bloat_pct,
      'leaf_pages',       leaf_pages,
      'live_leaf_count',  live_leaf_count,
      'index_size',       index_size,
      'suggested_action', suggested_action
    )
  FROM aegis_ops.bloated_indexes;

  -- Log unused indexes
  INSERT INTO aegis_ops.index_audit_log (audit_type, schemaname, tablename, indexname, detail)
  SELECT
    'unused',
    schemaname,
    tablename,
    indexname,
    jsonb_build_object(
      'idx_scan',         idx_scan,
      'index_size',       index_size,
      'stats_reset_at',   stats_reset_at,
      'suggested_action', suggested_action
    )
  FROM aegis_ops.unused_indexes;

  -- Log missing-index candidates
  INSERT INTO aegis_ops.index_audit_log (audit_type, schemaname, tablename, indexname, detail)
  SELECT
    'missing',
    schemaname,
    tablename,
    NULL,
    jsonb_build_object(
      'seq_scan',      seq_scan,
      'seq_scan_pct',  seq_scan_pct,
      'n_live_tup',    n_live_tup,
      'total_size',    total_size
    )
  FROM aegis_ops.missing_index_candidates;
  $$
);
