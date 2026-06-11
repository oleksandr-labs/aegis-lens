/**
 * Advanced filter types for Aegis Lens — Sprint 2.70
 * Extends the base filter state (use-filters.ts / filter-config.ts) with
 * advanced dimensions: custom time range, geo, source, entity, proximity,
 * cross-source, author, and tag/case-file filters.
 *
 * Serialization uses base64url-encoded JSON so the full filter set fits in
 * a single URL parameter (`afs=<encoded>`).
 */

// ---------------------------------------------------------------------------
// Primitive filter types
// ---------------------------------------------------------------------------

/** Absolute or relative custom time range. */
export type CustomTimeRange = {
  from: string;           // ISO 8601 datetime string (used when isRelative=false)
  to: string;             // ISO 8601 datetime string (used when isRelative=false)
  isRelative: boolean;
  relativeUnit?: "hours" | "days" | "weeks" | "months";
  relativeAmount?: number;
};

/** Geographic filter: admin-level boundary, AOI polygon, or radius. */
export type GeoFilter = {
  type: "polygon" | "radius" | "admin-level";
  /** GeoJSON-style ring coordinates [lon, lat] pairs */
  polygon?: [number, number][];
  /** Center point [lon, lat] */
  center?: [number, number];
  radiusKm?: number;
  /** e.g. "oblast", "rayon", "municipality" */
  adminLevel?: string;
  /** ISO 3166-2 or KOATUU code */
  adminCode?: string;
};

/** Source multi-select with optional reputation banding and language filter. */
export type SourceFilter = {
  sourceIds: string[];
  minReputation?: number;   // 0–100
  maxReputation?: number;   // 0–100
  requireVerified?: boolean;
  languages?: string[];     // BCP-47 language tags, e.g. ["uk", "en", "ru"]
};

/** Entity dimension: military units, equipment types, region tags. */
export type EntityFilter = {
  unitIds?: string[];
  equipmentTypes?: string[];
  regionCodes?: string[];   // ISO 3166-2 sub-region codes
  minEntityConfidence?: number; // 0–100
};

/** Proximity to a named place or another event. */
export type ProximityFilter = {
  type: "from-place" | "from-event";
  placeId?: string;
  eventId?: string;
  maxDistanceKm: number;
};

/** Cross-source corroboration requirement. */
export type CrossSourceFilter = {
  minIndependentSources: number;
  requiresCorroboration: boolean;
};

/** Author / contributor filter. */
export type AuthorFilter = {
  contributorIds?: string[];
  requireVerifiedContributor?: boolean;
};

/** Tag and case-file membership filter. */
export type TagFilter = {
  tagIds?: string[];
  caseFileIds?: string[];
  matchMode: "any" | "all";
};

// ---------------------------------------------------------------------------
// Combined advanced filter set
// ---------------------------------------------------------------------------

/**
 * Full advanced filter set.  All fields are optional so callers can compose
 * only the dimensions they need.  The base fields mirror the URL-synced state
 * produced by use-filters.ts (country, hours, classes, etc.) so that the two
 * systems can be bridged without a hard dependency on nuqs.
 */
export interface AdvancedFilterSet {
  // ── base filters (mirror of use-filters.ts) ──────────────────────────────
  country?: string;
  hours?: number;
  classes?: string[];
  minSeverity?: number;
  minConfidence?: number;
  verification?: string;
  minDanger?: number;
  hasMedia?: string;

  // ── advanced dimensions ───────────────────────────────────────────────────
  customTimeRange?: CustomTimeRange;
  geoFilter?: GeoFilter;
  sourceFilter?: SourceFilter;
  entityFilter?: EntityFilter;
  proximityFilter?: ProximityFilter;
  crossSourceFilter?: CrossSourceFilter;
  authorFilter?: AuthorFilter;
  tagFilter?: TagFilter;
}

// ---------------------------------------------------------------------------
// Serialization helpers
// ---------------------------------------------------------------------------

/**
 * Serialize an AdvancedFilterSet to a URL-safe base64url string.
 * Empty / undefined fields are stripped to keep the payload compact.
 */
export function serializeAdvancedFilters(filters: AdvancedFilterSet): string {
  // Strip keys whose value is undefined, null, empty array, or empty object.
  const cleaned = JSON.parse(
    JSON.stringify(filters, (_k, v) => {
      if (v === null || v === undefined) return undefined;
      if (Array.isArray(v) && v.length === 0) return undefined;
      if (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0)
        return undefined;
      return v;
    }),
  ) as Record<string, unknown>;

  const json = JSON.stringify(cleaned);
  // btoa is available in both browser and Node 16+ / Edge runtime.
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Deserialize a base64url-encoded string back into an AdvancedFilterSet.
 * Returns an empty object on any parse failure so callers never get an
 * exception from a malformed URL parameter.
 */
export function deserializeAdvancedFilters(encoded: string): AdvancedFilterSet {
  try {
    // Re-pad and convert from base64url → base64.
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = decodeURIComponent(escape(atob(padded)));
    const parsed = JSON.parse(json);
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed as AdvancedFilterSet;
  } catch {
    return {};
  }
}
