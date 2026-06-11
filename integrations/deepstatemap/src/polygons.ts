/**
 * Polygon ingestion model + PostGIS-ready helpers (TODO task:
 * "Polygon ingestion to PostGIS (controlled / contested / liberated)").
 *
 * The canonical `ControlPolygon` (types.ts) already carries GeoJSON geometry in
 * EPSG:4326, which maps 1:1 to a PostGIS `geometry(MultiPolygon, 4326)` column.
 * This module provides:
 *   - a typed table/row shape for the `frontline_control` table,
 *   - a deterministic conversion from ControlPolygon → DB row (geometry as GeoJSON,
 *     to be wrapped with ST_GeomFromGeoJSON at insert time),
 *   - a rough planar area estimate (km^2) for changelog/diff summaries.
 *
 * No DB driver is imported (additive, no new deps). The SQL is provided as a string
 * template so the platform's existing migration tooling can apply it.
 */

import type { ControlPolygon, ControlStatus, FrontlineSnapshot } from "./types";

/** DDL for the PostGIS-ready table. Apply via the platform's migration runner. */
export const FRONTLINE_CONTROL_DDL = `
CREATE TABLE IF NOT EXISTS frontline_control (
  id              TEXT NOT NULL,
  snapshot_date   DATE NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('controlled','contested','liberated')),
  force           TEXT NOT NULL CHECK (force IN ('ru','ua','unknown')),
  confidence      REAL NOT NULL,
  label_en        TEXT,
  label_uk        TEXT,
  source_fill     TEXT,
  geom            geometry(MultiPolygon, 4326) NOT NULL,
  ingested_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (snapshot_date, id)
);
CREATE INDEX IF NOT EXISTS frontline_control_geom_gix ON frontline_control USING GIST (geom);
CREATE INDEX IF NOT EXISTS frontline_control_date_idx ON frontline_control (snapshot_date);
CREATE INDEX IF NOT EXISTS frontline_control_status_idx ON frontline_control (status);
`;

/** Row shape for inserting into `frontline_control`. */
export interface FrontlineControlRow {
  id: string;
  snapshot_date: string; // YYYY-MM-DD
  status: ControlStatus;
  force: ControlPolygon["force"];
  confidence: number;
  label_en: string | null;
  label_uk: string | null;
  source_fill: string | null;
  /** GeoJSON geometry string; insert with ST_GeomFromGeoJSON(geom_geojson, 4326). */
  geom_geojson: string;
}

/** Convert a snapshot's polygons into insertable rows. */
export function toRows(snapshot: FrontlineSnapshot): FrontlineControlRow[] {
  return snapshot.polygons.map((p) => ({
    id: p.id,
    snapshot_date: p.snapshotDate,
    status: p.status,
    force: p.force,
    confidence: p.confidence,
    label_en: p.label?.en ?? null,
    label_uk: p.label?.uk ?? null,
    source_fill: p.sourceFill ?? null,
    geom_geojson: JSON.stringify(p.geometry),
  }));
}

/** Parameterized INSERT template (one row). Placeholders match `FrontlineControlRow` order. */
export const INSERT_SQL = `
INSERT INTO frontline_control
  (id, snapshot_date, status, force, confidence, label_en, label_uk, source_fill, geom)
VALUES
  ($1, $2, $3, $4, $5, $6, $7, $8, ST_Multi(ST_GeomFromGeoJSON($9)))
ON CONFLICT (snapshot_date, id) DO UPDATE SET
  status = EXCLUDED.status,
  force = EXCLUDED.force,
  confidence = EXCLUDED.confidence,
  geom = EXCLUDED.geom;
`;

/** Ordered parameter array for INSERT_SQL. */
export function toInsertParams(row: FrontlineControlRow): unknown[] {
  return [
    row.id,
    row.snapshot_date,
    row.status,
    row.force,
    row.confidence,
    row.label_en,
    row.label_uk,
    row.source_fill,
    row.geom_geojson,
  ];
}

// ── Area estimate (planar, km^2) ─────────────────────────────────────────────
// Equirectangular approximation around Ukraine's latitude. Good enough for relative
// diff/changelog summaries; NOT a geodesic-accurate measurement.

const KM_PER_DEG_LAT = 111.32;

function ringAreaKm2(ring: number[][]): number {
  if (ring.length < 3) return 0;
  // mean latitude for longitude scaling
  const meanLat = ring.reduce((s, c) => s + c[1], 0) / ring.length;
  const kmPerDegLon = KM_PER_DEG_LAT * Math.cos((meanLat * Math.PI) / 180);
  let area = 0; // shoelace in km
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    area += (x1 * kmPerDegLon) * (y2 * KM_PER_DEG_LAT) - (x2 * kmPerDegLon) * (y1 * KM_PER_DEG_LAT);
  }
  return Math.abs(area) / 2;
}

/** Approximate area of a control polygon in km^2. */
export function polygonAreaKm2(p: Pick<ControlPolygon, "geometry">): number {
  const g = p.geometry;
  if (g.type === "Polygon") {
    const [outer, ...holes] = g.coordinates;
    return ringAreaKm2(outer) - holes.reduce((s, h) => s + ringAreaKm2(h), 0);
  }
  // MultiPolygon
  return g.coordinates.reduce((sum, poly) => {
    const [outer, ...holes] = poly;
    return sum + ringAreaKm2(outer) - holes.reduce((s, h) => s + ringAreaKm2(h), 0);
  }, 0);
}
