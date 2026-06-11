/**
 * Base infrastructure layer: OpenStreetMap infrastructure features + curated additions.
 *
 * OSM is the canonical source of *peacetime* infrastructure geometry (power plants,
 * substations, bridges, telecom masts, waterworks, hospitals…). We model the subset
 * of OSM tags relevant to the damage layer, then merge a small curated-override set
 * (analyst corrections / assets missing from OSM). Curated entries win on conflict.
 *
 * Примітки / NOTE: this module intentionally does NOT ingest or expose functional
 * military assets. OSM features tagged `military=*` (or curated entries flagged
 * `isMilitary`) are filtered out so we never reveal tactical detail on operational
 * military infrastructure. Only civilian / dual-use civilian infrastructure is kept.
 */

import { InfrastructureCategory, InfrastructureOwner } from "./types";

/** A typed OSM infrastructure feature relevant to the damage layer. */
export interface OsmInfraFeature {
  /** OSM element id, e.g. "way/12345" or "node/678". */
  osmId: string;
  osmType: "node" | "way" | "relation";
  name?: string;
  nameUk?: string;
  category: InfrastructureCategory;
  lat: number;
  lon: number;
  /** Selected raw OSM tags (power=*, amenity=*, man_made=* …). */
  tags: Record<string, string>;
  owner?: InfrastructureOwner;
  /** True if the source OSM tags indicate a military object (excluded downstream). */
  isMilitary?: boolean;
}

/**
 * Curated override / addition. Same shape as an OSM feature but sourced from
 * analysts. `osmId` may be a synthetic id ("curated/lviv-substation-1") when the
 * asset is absent from OSM.
 */
export interface CuratedInfraOverride extends OsmInfraFeature {
  /** Free-text reason for the override (analyst note). */
  note?: string;
}

/**
 * Map OSM tags → our InfrastructureCategory. Returns undefined for tags we do not
 * track (so unrelated OSM features are dropped). Order matters: most specific first.
 */
export function osmTagsToCategory(tags: Record<string, string>): InfrastructureCategory | undefined {
  if (tags.power && ["plant", "substation", "generator", "transformer"].includes(tags.power)) return "power";
  if (tags["plant:source"] || tags["generator:source"]) return "power";
  if (tags.man_made === "communications_tower" || tags.tower_type === "communication" || tags.telecom) return "telecom";
  if (tags.man_made === "tower" && tags["tower:type"] === "communication") return "telecom";
  if (tags.bridge === "yes" || tags.railway === "station" || tags.railway === "bridge" || tags.highway === "motorway_junction") return "transport";
  if (tags.man_made === "water_works" || tags.man_made === "water_tower" || tags.man_made === "pumping_station") return "water";
  if (tags.amenity === "hospital" || tags.amenity === "clinic" || tags.healthcare) return "healthcare";
  if (tags.amenity === "school" || tags.amenity === "university" || tags.amenity === "college") return "education";
  if (tags.building === "residential" || tags.building === "apartments") return "residential";
  if (tags.man_made === "works" || tags.industrial || tags.landuse === "industrial") return "industrial";
  if (tags.office === "government" || tags.amenity === "townhall") return "government";
  if (tags.historic || tags.tourism === "museum" || tags.heritage) return "cultural";
  return undefined;
}

/** Detect military OSM objects so they can be excluded. */
export function isMilitaryFeature(tags: Record<string, string>): boolean {
  if (tags.military) return true;
  if (tags.landuse === "military") return true;
  if (tags.building === "military" || tags.building === "bunker") return true;
  return false;
}

/**
 * Convert a raw OSM Overpass element into a typed feature, or undefined if it is
 * not a tracked civilian infrastructure category. Military features are tagged
 * `isMilitary: true` and returned so callers can audit, but `buildBaseLayer`
 * filters them out of the public layer.
 */
export function osmElementToFeature(el: {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}): OsmInfraFeature | undefined {
  const tags = el.tags ?? {};
  const category = osmTagsToCategory(tags);
  if (!category) return undefined;

  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (lat === undefined || lon === undefined) return undefined;

  return {
    osmId: `${el.type}/${el.id}`,
    osmType: el.type,
    name: tags.name ?? tags["name:en"],
    nameUk: tags["name:uk"] ?? tags.name,
    category,
    lat,
    lon,
    tags,
    owner: osmOwner(tags),
    isMilitary: isMilitaryFeature(tags),
  };
}

function osmOwner(tags: Record<string, string>): InfrastructureOwner | undefined {
  const op = (tags.operator ?? tags.ownership ?? "").toLowerCase();
  if (!op) return undefined;
  if (op.includes("state") || op.includes("ukrenergo") || op.includes("держ")) return "state";
  if (op.includes("municipal") || op.includes("city") || op.includes("комунал")) return "municipal";
  if (op.includes("private") || op.includes("dtek") || op.includes("приват")) return "private";
  return "unknown";
}

/**
 * Merge an OSM base set with curated overrides.
 *
 * - Curated entries replace OSM entries that share the same `osmId`.
 * - Curated entries with a new id are appended.
 * - Military features (from either source) are excluded from the returned layer.
 */
export function buildBaseLayer(
  osm: OsmInfraFeature[],
  curated: CuratedInfraOverride[] = [],
): OsmInfraFeature[] {
  const byId = new Map<string, OsmInfraFeature>();
  for (const f of osm) {
    if (f.isMilitary) continue;
    byId.set(f.osmId, f);
  }
  for (const c of curated) {
    if (c.isMilitary) {
      byId.delete(c.osmId); // explicit removal of a leaked military object
      continue;
    }
    byId.set(c.osmId, c); // curated wins on conflict
  }
  return [...byId.values()];
}

/** Default Overpass query (Ukraine bbox) for fetching the base infrastructure set. */
export const OVERPASS_INFRA_QUERY = `
[out:json][timeout:60];
(
  node["power"~"plant|substation|generator"](44.38,22.14,52.38,40.23);
  way["power"~"plant|substation"](44.38,22.14,52.38,40.23);
  node["man_made"="communications_tower"](44.38,22.14,52.38,40.23);
  way["man_made"="water_works"](44.38,22.14,52.38,40.23);
  way["bridge"="yes"]["railway"](44.38,22.14,52.38,40.23);
  node["amenity"~"hospital|clinic"](44.38,22.14,52.38,40.23);
);
out center tags;
`.trim();
