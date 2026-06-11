/**
 * Aegis Lens Filter DSL — typed, machine-readable filter representation.
 *
 * Powers: UI filters, alert rules, AOI triggers, AI rule builder, URL sharing.
 *
 * Grammar (simplified BNF):
 *   filter  ::= condition | combinator
 *   combinator ::= { op: "AND"|"OR"|"NOT", filters: filter[] }
 *   condition  ::= { field: FieldName, op: Operator, value: Value }
 */

// ── Field catalog ─────────────────────────────────────────────────────────────

export type FieldName =
  // Event core
  | "class"
  | "subclass"
  | "severity"
  | "confidence"
  | "danger_score"
  | "verification_state"
  | "is_public"
  | "is_retracted"
  // Location
  | "country"
  | "region_code"
  | "lat"
  | "lon"
  | "geom"  // PostGIS point/polygon operations
  // Time
  | "occurred_at"
  | "ingested_at"
  // Source
  | "source_id"
  // Content / tags
  | "tags"
  | "title_en"
  | "title_uk"
  // Multi-tenancy
  | "org_id";

export type FieldType =
  | "string"
  | "string_enum"
  | "number"
  | "integer"
  | "boolean"
  | "datetime"
  | "geometry"
  | "string_array";

export interface FieldDef {
  name: FieldName;
  type: FieldType;
  /** Legal operators for this field */
  operators: Operator[];
  /** Whether this field is queryable in public API */
  isPublic: boolean;
  description?: string;
}

// ── Operators ─────────────────────────────────────────────────────────────────

export type Operator =
  | "eq"           // =
  | "neq"          // !=
  | "in"           // IN (array)
  | "nin"          // NOT IN (array)
  | "gt"           // >
  | "gte"          // >=
  | "lt"           // <
  | "lte"          // <=
  | "contains"     // ILIKE %value%
  | "starts_with"  // ILIKE value%
  | "near"         // ST_DWithin(geom, point, radius)
  | "within"       // ST_Within(geom, polygon)
  | "intersects"   // ST_Intersects
  | "has"          // array contains
  | "has_any"      // array has any of
  | "between"      // BETWEEN low AND high
  | "is_null"      // IS NULL
  | "is_not_null"; // IS NOT NULL

// ── Values ────────────────────────────────────────────────────────────────────

export type ScalarValue = string | number | boolean | null;
export type ArrayValue = ScalarValue[];

export interface GeoPointValue {
  lat: number;
  lon: number;
}

export interface GeoRadiusValue {
  lat: number;
  lon: number;
  /** Radius in kilometers */
  radiusKm: number;
}

export interface GeoPolygonValue {
  /** GeoJSON polygon coordinates */
  coordinates: number[][][];
}

export interface BetweenValue {
  low: ScalarValue;
  high: ScalarValue;
}

export type ConditionValue =
  | ScalarValue
  | ArrayValue
  | GeoPointValue
  | GeoRadiusValue
  | GeoPolygonValue
  | BetweenValue;

// ── DSL Nodes ─────────────────────────────────────────────────────────────────

export interface ConditionNode {
  type: "condition";
  field: FieldName;
  op: Operator;
  value?: ConditionValue;
}

export interface AndNode {
  type: "and";
  filters: FilterNode[];
}

export interface OrNode {
  type: "or";
  filters: FilterNode[];
}

export interface NotNode {
  type: "not";
  filter: FilterNode;
}

export type FilterNode = ConditionNode | AndNode | OrNode | NotNode;

/** Top-level filter DSL document */
export interface FilterDSL {
  version: "1.0";
  filter: FilterNode;
  /** Optional human-readable label */
  label?: string;
  /** ISO-8601 — when this filter was saved */
  createdAt?: string;
}
