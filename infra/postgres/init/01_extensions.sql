-- Enable required Postgres extensions
-- Run once on a fresh cluster before any migrations.

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;       -- fuzzy text search
CREATE EXTENSION IF NOT EXISTS unaccent;       -- accent-insensitive search
CREATE EXTENSION IF NOT EXISTS btree_gist;     -- exclusion constraints
CREATE EXTENSION IF NOT EXISTS pg_stat_statements; -- slow query analysis

-- TimescaleDB telemetry off (optional, reduces noise)
SELECT timescaledb_pre_restore();
ALTER SYSTEM SET timescaledb.telemetry_level = 'off';
SELECT pg_reload_conf();
