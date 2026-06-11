-- PostGIS Spatial Index Audit
-- Aegis Lens / Ukrainian MAP
--
-- Run this script against the production Postgres instance to create all
-- recommended spatial indexes. All statements use IF NOT EXISTS — safe to
-- re-run without downtime (indexes are built CONCURRENTLY where noted).
--
-- Execution order matters: tables must exist before indexing.
-- Estimated time: < 5 min on a 10M-row events table with CONCURRENTLY.

-- =============================================================================
-- events table
-- =============================================================================

-- Spatial index on event geometry (GIST) — enables ST_Within, ST_DWithin, &&
CREATE INDEX IF NOT EXISTS idx_events_geometry_gist
  ON events USING GIST (geometry);

-- Time-series index on occurred_at (BRIN) — tiny size, fast range scans
CREATE INDEX IF NOT EXISTS idx_events_occurred_at_brin
  ON events USING BRIN (occurred_at) WITH (pages_per_range = 128);

-- JSONB metadata index (GIN) — enables @> and ? containment queries
CREATE INDEX IF NOT EXISTS idx_events_metadata_gin
  ON events USING GIN (metadata);

-- Composite index: region_code + occurred_at for region-timeline queries
CREATE INDEX IF NOT EXISTS idx_events_region_time
  ON events (region_code, occurred_at DESC);

-- Partial index: only verified events (reduces index size for AI-quality queries)
CREATE INDEX IF NOT EXISTS idx_events_verified_geometry_gist
  ON events USING GIST (geometry)
  WHERE verified = true;

-- =============================================================================
-- aois (Areas of Interest) table
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_aois_geometry_gist
  ON aois USING GIST (geometry);

CREATE INDEX IF NOT EXISTS idx_aois_owner_id
  ON aois (owner_id);

-- =============================================================================
-- regions table
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_regions_boundary_gist
  ON regions USING GIST (boundary);

-- Look up oblast by code (used in every region-feed query)
CREATE INDEX IF NOT EXISTS idx_regions_code
  ON regions (code);

-- =============================================================================
-- tiles_cache table
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_tiles_cache_created_at_brin
  ON tiles_cache USING BRIN (created_at) WITH (pages_per_range = 64);

-- Look up tile by layer + z/x/y
CREATE INDEX IF NOT EXISTS idx_tiles_cache_layer_zxy
  ON tiles_cache (layer_id, z, x, y);

-- =============================================================================
-- equipment_losses table
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_equipment_losses_geometry_gist
  ON equipment_losses USING GIST (geometry);

CREATE INDEX IF NOT EXISTS idx_equipment_losses_date_brin
  ON equipment_losses USING BRIN (loss_date) WITH (pages_per_range = 64);

-- =============================================================================
-- air_raid_alerts table
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_air_raid_alerts_geometry_gist
  ON air_raid_alerts USING GIST (geometry);

CREATE INDEX IF NOT EXISTS idx_air_raid_alerts_started_at_brin
  ON air_raid_alerts USING BRIN (started_at) WITH (pages_per_range = 64);

-- Active alerts partial index (most queries filter WHERE ended_at IS NULL)
CREATE INDEX IF NOT EXISTS idx_air_raid_alerts_active
  ON air_raid_alerts (oblast_code, started_at DESC)
  WHERE ended_at IS NULL;

-- =============================================================================
-- sources table
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_sources_metadata_gin
  ON sources USING GIN (metadata);

-- =============================================================================
-- Verification queries (run after creating indexes)
-- =============================================================================

-- List all GIST indexes on geometry columns
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE indexdef ILIKE '%GIST%'
ORDER BY tablename, indexname;

-- Check index sizes
SELECT
  relname AS table_name,
  indexrelname AS index_name,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
