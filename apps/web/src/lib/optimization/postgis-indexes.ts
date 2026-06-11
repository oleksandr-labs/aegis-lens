/**
 * PostGIS spatial index audit — recommended indexes for the Aegis Lens schema.
 *
 * Use GIST for geometry/geography columns queried with spatial operators (&&, ST_Within, etc.).
 * Use BRIN for append-only time-series columns (occurred_at, created_at) — very cheap to build.
 * Use GIN for JSONB metadata columns that are queried with @> / ? operators.
 *
 * All SQL uses `CREATE INDEX IF NOT EXISTS` — safe to re-run on a live database.
 * See also: postgis-index-audit.sql for the runnable migration script.
 */

export interface SpatialIndexDef {
  table: string;
  column: string;
  indexType: "GIST" | "BRIN" | "GIN";
  reason: string;
  sql: string;
}

export const RECOMMENDED_SPATIAL_INDEXES: SpatialIndexDef[] = [
  {
    table: "events",
    column: "geometry",
    indexType: "GIST",
    reason:
      "Accelerates spatial filter queries: bounding-box tile lookups, ST_Within oblast queries, ST_DWithin radius searches.",
    sql: `CREATE INDEX IF NOT EXISTS idx_events_geometry_gist
  ON events USING GIST (geometry);`,
  },
  {
    table: "events",
    column: "occurred_at",
    indexType: "BRIN",
    reason:
      "BRIN is ideal for the append-only occurred_at column — tiny index size (~128 pages), fast range scans for timeline queries.",
    sql: `CREATE INDEX IF NOT EXISTS idx_events_occurred_at_brin
  ON events USING BRIN (occurred_at) WITH (pages_per_range = 128);`,
  },
  {
    table: "events",
    column: "metadata",
    indexType: "GIN",
    reason:
      "Enables efficient @> containment queries on JSONB metadata (e.g., source_type, verified flags).",
    sql: `CREATE INDEX IF NOT EXISTS idx_events_metadata_gin
  ON events USING GIN (metadata);`,
  },
  {
    table: "aois",
    column: "geometry",
    indexType: "GIST",
    reason:
      "Area-of-interest polygon intersection queries require GIST; plain B-tree cannot compare geometries.",
    sql: `CREATE INDEX IF NOT EXISTS idx_aois_geometry_gist
  ON aois USING GIST (geometry);`,
  },
  {
    table: "regions",
    column: "boundary",
    indexType: "GIST",
    reason:
      "Oblast/raion boundary lookups (ST_Contains, ST_Intersects) dominate the region-feed query path.",
    sql: `CREATE INDEX IF NOT EXISTS idx_regions_boundary_gist
  ON regions USING GIST (boundary);`,
  },
  {
    table: "tiles_cache",
    column: "created_at",
    indexType: "BRIN",
    reason:
      "Tile cache entries are inserted in time order; BRIN gives near-instant range scans for TTL expiry jobs.",
    sql: `CREATE INDEX IF NOT EXISTS idx_tiles_cache_created_at_brin
  ON tiles_cache USING BRIN (created_at) WITH (pages_per_range = 64);`,
  },
  {
    table: "equipment_losses",
    column: "geometry",
    indexType: "GIST",
    reason:
      "Equipment loss location queries are used for heatmap rendering; GIST prevents sequential scan.",
    sql: `CREATE INDEX IF NOT EXISTS idx_equipment_losses_geometry_gist
  ON equipment_losses USING GIST (geometry);`,
  },
  {
    table: "air_raid_alerts",
    column: "geometry",
    indexType: "GIST",
    reason:
      "Active alert spatial queries must be sub-millisecond; GIST on alert polygon/point is critical.",
    sql: `CREATE INDEX IF NOT EXISTS idx_air_raid_alerts_geometry_gist
  ON air_raid_alerts USING GIST (geometry);`,
  },
  {
    table: "air_raid_alerts",
    column: "started_at",
    indexType: "BRIN",
    reason:
      "Alert timeline is append-only; BRIN on started_at allows fast range scans for active-alert queries.",
    sql: `CREATE INDEX IF NOT EXISTS idx_air_raid_alerts_started_at_brin
  ON air_raid_alerts USING BRIN (started_at) WITH (pages_per_range = 64);`,
  },
  {
    table: "sources",
    column: "metadata",
    indexType: "GIN",
    reason:
      "Source health and tag queries use JSONB containment; GIN prevents full-table scans on the sources table.",
    sql: `CREATE INDEX IF NOT EXISTS idx_sources_metadata_gin
  ON sources USING GIN (metadata);`,
  },
];
