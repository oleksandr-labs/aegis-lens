/**
 * DeepStateMAP source record types.
 *
 * DeepStateMAP (deepstatemap.live) is a volunteer-maintained, daily-updated map of
 * the Ukrainian frontline. It publishes:
 *   - A live web map and an internal API serving GeoJSON FeatureCollections.
 *   - Polygons describing area control (occupied / contested / liberated) and
 *     point features for settlements, units, and notable objects.
 *   - Daily editorial commentary (in Ukrainian) via their public Telegram channel.
 *
 * IMPORTANT (see COMPLIANCE.md): DeepStateMAP data is NOT public-domain. Republication
 * requires explicit permission + prominent attribution. These types model the source so
 * an adapter can normalize it; whether the polygons may be re-served publicly is gated by
 * the license/partnership state encoded in COMPLIANCE.md and `attribution.ts`.
 */

// ── Control status ──────────────────────────────────────────────────────────

/**
 * Canonical control status for a frontline area.
 *
 * DeepStateMAP itself primarily distinguishes "occupied" (under Russian control) from
 * the rest. We model a richer, PostGIS-ready set so the platform can express contested
 * and recently-liberated zones without overclaiming (see `disputed-policy.ts`).
 */
export type ControlStatus =
  | "controlled" // under occupying-force control (DeepState: occupied area)
  | "contested" // active fighting / unclear control — DO NOT render as either side's
  | "liberated"; // re-taken by Ukrainian forces within the tracked window

/** Which force is asserted to control a `controlled` area. */
export type ControllingForce = "ru" | "ua" | "unknown";

/** GeoJSON geometry subset we ingest (polygons + points). */
export interface GeoJsonPolygon {
  type: "Polygon";
  coordinates: number[][][]; // [ring][vertex][lon,lat]
}

export interface GeoJsonMultiPolygon {
  type: "MultiPolygon";
  coordinates: number[][][][];
}

export interface GeoJsonPoint {
  type: "Point";
  coordinates: [number, number]; // [lon, lat]
}

export type GeoJsonGeometry = GeoJsonPolygon | GeoJsonMultiPolygon | GeoJsonPoint;

/** Raw DeepStateMAP feature as served by their GeoJSON endpoint. */
export interface DeepStateRawFeature {
  type: "Feature";
  id?: string | number;
  geometry: GeoJsonGeometry;
  properties: {
    /** DeepState attaches a name string; often Ukrainian, sometimes "Name [ISO date]". */
    name?: string;
    description?: string;
    /** DeepState colour codes control; we map it to ControlStatus in the client. */
    fill?: string;
    "fill-opacity"?: number;
    stroke?: string;
    [key: string]: unknown;
  };
}

export interface DeepStateRawSnapshot {
  type: "FeatureCollection";
  /** ISO date of the snapshot (YYYY-MM-DD), derived from filename or API param. */
  date?: string;
  features: DeepStateRawFeature[];
}

// ── Normalized control polygon (PostGIS-ready) ──────────────────────────────

/**
 * A typed, PostGIS-ready frontline control polygon.
 *
 * `geometry` is GeoJSON (EPSG:4326 / WGS-84), which maps directly to a PostGIS
 * `geometry(MultiPolygon, 4326)` column. `confidence` carries the source's inherent
 * uncertainty forward to the display layer.
 */
export interface ControlPolygon {
  /** Stable id within a snapshot (source id or derived hash). */
  id: string;
  status: ControlStatus;
  force: ControllingForce;
  geometry: GeoJsonPolygon | GeoJsonMultiPolygon;
  /** Snapshot date this polygon belongs to (YYYY-MM-DD). */
  snapshotDate: string;
  /**
   * Confidence 0–1 that the control state is accurate for this date.
   * DeepState is highly reliable for `controlled`; `contested` is inherently lower.
   */
  confidence: number;
  /** Optional human label (settlement / sector), EN + UK. */
  label?: { en?: string; uk?: string };
  /** Source colour, preserved for provenance. */
  sourceFill?: string;
}

// ── Snapshot (normalized) ────────────────────────────────────────────────────

export interface FrontlineSnapshot {
  /** YYYY-MM-DD */
  date: string;
  fetchedAt: string;
  polygons: ControlPolygon[];
  /** Counts by status, for changelog summaries. */
  counts: Record<ControlStatus, number>;
  /** Attribution metadata required on every render (see attribution.ts). */
  attribution: SourceAttribution;
}

// ── Diff ─────────────────────────────────────────────────────────────────────

export type PolygonChangeType =
  | "added" // new polygon (e.g. newly-marked occupied or contested area)
  | "removed" // polygon disappeared (e.g. liberated, no longer occupied)
  | "status_changed" // same area, control status flipped
  | "geometry_changed"; // boundary shifted (advance / retreat)

export interface PolygonChange {
  type: PolygonChangeType;
  polygonId: string;
  previousStatus?: ControlStatus;
  newStatus?: ControlStatus;
  /** Approx area delta in km^2 (positive = expansion of newStatus). */
  areaDeltaKm2?: number;
  label?: { en?: string; uk?: string };
}

export interface SnapshotDiff {
  fromDate: string;
  toDate: string;
  changes: PolygonChange[];
  /** Net km^2 by status that changed hands toward each side. */
  netKm2: { towardRu: number; towardUa: number; contested: number };
}

// ── Telegram commentary ──────────────────────────────────────────────────────

export interface FrontlineCommentary {
  messageId: number;
  postedAt: string; // ISO-8601
  /** Original Ukrainian text as published. */
  originalText: string;
  /** Translated/normalized summary, EN + UK. */
  summary: { en: string; uk: string };
  /** Source post URL (t.me/...). */
  url: string;
}

// ── Attribution ──────────────────────────────────────────────────────────────

export interface SourceAttribution {
  sourceName: string; // "DeepStateMAP"
  sourceUrl: string; // https://deepstatemap.live
  /** Required attribution line, EN + UK. */
  notice: { en: string; uk: string };
  /** License short id (see COMPLIANCE.md). */
  license: string;
  /** Whether republication of polygons is currently permitted (gated). */
  republicationPermitted: boolean;
}
