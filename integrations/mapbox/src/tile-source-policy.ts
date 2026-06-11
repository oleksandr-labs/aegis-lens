/**
 * Per-layer tile source decision: Mapbox-hosted vs our own PostGIS/Martin MVT.
 *
 * Rule of thumb:
 *  - BASEMAP context (roads, labels, terrain, satellite imagery) → Mapbox (or the
 *    MapLibre/OpenFreeMap fallback). We do not reproduce a global basemap.
 *  - OPERATIONAL OSINT DATA (our events, drones, missiles, thermal, frontline…) →
 *    our PostGIS via Martin (`services/tiles`). Reasons: (1) live freshness with
 *    short TTLs + cache invalidation we control; (2) per-tenant RLS / signed URLs;
 *    (3) ToS — Mapbox forbids re-hosting their tiles and we must not push our
 *    sensitive layers through a third party's tile pipeline.
 *
 * This matrix is the typed, auditable form of that decision (TODO task: "Vector
 * tiles from Mapbox vs our PostGIS — decide per layer").
 */

export type TileSource = "mapbox" | "maplibre_fallback" | "postgis_martin";

export interface LayerSourceDecision {
  layerId: string;
  source: TileSource;
  /** Short rationale shown in the policy audit. */
  rationale: string;
}

export const TILE_SOURCE_POLICY: LayerSourceDecision[] = [
  // ── Basemap context → Mapbox (MapLibre fallback when no token) ──
  {
    layerId: "basemap_dark",
    source: "mapbox",
    rationale: "Global basemap; not ours to reproduce. MapLibre/OpenFreeMap fallback.",
  },
  {
    layerId: "satellite_streets",
    source: "mapbox",
    rationale: "Satellite imagery basemap is licensed raster from Mapbox; fallback MapLibre.",
  },
  {
    layerId: "basemap_print",
    source: "mapbox",
    rationale: "High-contrast print basemap variant; fallback MapLibre positron.",
  },
  // ── Operational OSINT layers → our PostGIS/Martin MVT ──
  {
    layerId: "events",
    source: "postgis_martin",
    rationale: "Live, tenant-scoped, signed; 5-min TTL. Must stay on our pipeline (RLS).",
  },
  {
    layerId: "drones",
    source: "postgis_martin",
    rationale: "Very live (60s TTL), tenant-scoped — our Martin function, never Mapbox.",
  },
  {
    layerId: "missiles",
    source: "postgis_martin",
    rationale: "Live strike data, tenant-scoped + auth; our PostGIS MVT.",
  },
  {
    layerId: "infrastructure",
    source: "postgis_martin",
    rationale: "Damage assessments are our derived data; served from PostGIS.",
  },
  {
    layerId: "thermal",
    source: "postgis_martin",
    rationale: "FIRMS-derived thermal MVT, pre-generated on our pipeline (6h cadence).",
  },
  {
    layerId: "power_outages",
    source: "postgis_martin",
    rationale: "Our aggregated coverage polygons; on-demand MVT from PostGIS.",
  },
  {
    layerId: "social_activity",
    source: "postgis_martin",
    rationale: "Tenant-scoped heatmap from our data; PostGIS MVT.",
  },
  {
    layerId: "troop_movement",
    source: "postgis_martin",
    rationale: "Sensitive, low-precision, tenant-scoped; must not transit a third party.",
  },
  {
    layerId: "satellite_rgb",
    source: "postgis_martin",
    rationale: "Our pre-generated WebP raster tiles (imagery we license/process), not Mapbox.",
  },
];

const byId = new Map(TILE_SOURCE_POLICY.map((d) => [d.layerId, d]));

export function sourceForLayer(layerId: string): TileSource | undefined {
  return byId.get(layerId)?.source;
}

/** True when a layer is served from our own pipeline (vs Mapbox). */
export function isSelfHosted(layerId: string): boolean {
  return byId.get(layerId)?.source === "postgis_martin";
}
