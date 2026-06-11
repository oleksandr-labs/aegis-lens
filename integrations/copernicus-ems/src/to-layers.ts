/**
 * Task 5 — Convert EMS outputs → our map layers (damage assessment, flood, fire).
 *
 * EMS per-activation outputs map onto:
 *   - the NEW `crisis_mapping` layer (authoritative EMS AOIs + product polygons:
 *     flood extent, burn scar, damage grading) — see handoff
 *     sprint259_shared_COPERNICUS.txt;
 *   - existing layers where the geometry fits: flood → `emergencies` (type
 *     "flood"), fire → `active_fires`, conflict damage → `infrastructure_damage`.
 *
 * Output is GeoJSON FeatureCollections the `crisis_mapping` API route serves.
 * The paint spec keys on `properties.kind` (flood_extent | burn_scar |
 * damage_grade) and `properties.grade`.
 */

import type {
  ActivationOutputs,
  VectorOutput,
  RasterOutput,
  EmsHazardType,
  DamageGrade,
} from "./types";
import { vectorAffectedAreaM2 } from "./outputs";

export interface GeoFeature {
  type: "Feature";
  geometry:
    | { type: "Polygon"; coordinates: Array<Array<[number, number]>> }
    | { type: "MultiPolygon"; coordinates: Array<Array<Array<[number, number]>>> }
    | { type: "Point"; coordinates: [number, number] };
  properties: Record<string, unknown>;
}

export interface GeoFeatureCollection {
  type: "FeatureCollection";
  features: GeoFeature[];
}

/** Our internal layer "kind" each EMS product maps to (drives paint). */
export type CrisisKind = "flood_extent" | "burn_scar" | "damage_grade" | "affected_area";

/** Map a hazard + product geometry to our crisis kind. */
function kindFor(hazard: EmsHazardType, hasGrade: boolean): CrisisKind {
  if (hasGrade) return "damage_grade";
  if (hazard === "flood") return "flood_extent";
  if (hazard === "fire") return "burn_scar";
  return "affected_area";
}

/** Convert one vector output to GeoJSON features for `crisis_mapping`. */
export function vectorToFeatures(v: VectorOutput): GeoFeature[] {
  return v.features.map((f) => {
    const grade = f.properties.grade as DamageGrade | undefined;
    const kind = kindFor(v.hazard, Boolean(grade));
    return {
      type: "Feature" as const,
      geometry: f.geometry,
      properties: {
        activationCode: v.activationCode,
        aoiId: v.aoiId,
        productId: v.productId,
        productType: v.type,
        hazard: v.hazard,
        kind,
        grade,
        notation: f.properties.notation,
        url: v.url,
        releasedAt: v.releasedAt,
        source: "Copernicus EMS",
      },
    };
  });
}

/** Build the `crisis_mapping` GeoJSON layer from one activation's outputs. */
export function toCrisisLayer(outputs: ActivationOutputs): GeoFeatureCollection {
  const features: GeoFeature[] = [];
  for (const v of outputs.vectors) features.push(...vectorToFeatures(v));
  return { type: "FeatureCollection", features };
}

/** Build a combined `crisis_mapping` layer across many activations' outputs. */
export function toCrisisLayerMany(all: ActivationOutputs[]): GeoFeatureCollection {
  const features: GeoFeature[] = [];
  for (const o of all) features.push(...toCrisisLayer(o).features);
  return { type: "FeatureCollection", features };
}

/** Where each EMS hazard product also lands on an EXISTING layer. */
export const EXISTING_LAYER_MAPPING: Record<CrisisKind, string> = {
  flood_extent: "emergencies", // emergencies paint has a "flood" type
  burn_scar: "active_fires",
  damage_grade: "infrastructure_damage",
  affected_area: "emergencies",
};

/** A raster overlay descriptor for the imagery layer (EMS classified GeoTIFFs). */
export interface RasterOverlay {
  activationCode: string;
  aoiId: string;
  productId: string;
  band: RasterOutput["band"];
  bbox: RasterOutput["bbox"];
  resolutionM: number;
  url: string;
  /** Existing layer/category the raster should overlay under. */
  layer: string;
}

export function rasterToOverlay(r: RasterOutput): RasterOverlay {
  const kind = kindFor(r.hazard, r.band === "damage_class");
  return {
    activationCode: r.activationCode,
    aoiId: r.aoiId,
    productId: r.productId,
    band: r.band,
    bbox: r.bbox,
    resolutionM: r.resolutionM,
    url: r.url,
    layer: EXISTING_LAYER_MAPPING[kind],
  };
}

/** Summary stats for a converted activation (drives banner / dashboard). */
export interface CrisisSummary {
  activationCode: string;
  hazard: EmsHazardType;
  featureCount: number;
  affectedAreaM2: number;
  gradeCounts: Partial<Record<DamageGrade, number>>;
}

export function summarize(outputs: ActivationOutputs): CrisisSummary {
  let featureCount = 0;
  let affectedAreaM2 = 0;
  const gradeCounts: Partial<Record<DamageGrade, number>> = {};
  let hazard: EmsHazardType = "other";
  for (const v of outputs.vectors) {
    hazard = v.hazard;
    featureCount += v.features.length;
    affectedAreaM2 += vectorAffectedAreaM2(v);
    for (const f of v.features) {
      const g = f.properties.grade as DamageGrade | undefined;
      if (g) gradeCounts[g] = (gradeCounts[g] ?? 0) + 1;
    }
  }
  return {
    activationCode: outputs.activationCode,
    hazard,
    featureCount,
    affectedAreaM2: Math.round(affectedAreaM2),
    gradeCounts,
  };
}
