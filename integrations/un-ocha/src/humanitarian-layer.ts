/**
 * Humanitarian map-layer data builders.
 *
 * Produces GeoJSON features for the proposed `humanitarian` layer (see the
 * handoff file sprint258_shared_OCHA.txt → registry + paint spec):
 *   - Displacement intensity: one point/feature per oblast carrying an
 *     `intensity` (0–1) derived from IDP counts → drives a choropleth.
 *   - Aid corridors: LineString features with an `access` status → drives the
 *     aid-corridor lines paint.
 *
 * All centroids are coarse (admin resolution); no individual geometry.
 */

import type { DtmDisplacementRecord } from "./types";
import { coarsenCoord } from "./pii-redaction";
import { DEMO_DTM_RECORDS } from "./dtm-client";

export interface GeoFeature {
  type: "Feature";
  geometry:
    | { type: "Point"; coordinates: [number, number] }
    | { type: "LineString"; coordinates: Array<[number, number]> };
  properties: Record<string, unknown>;
}

export interface GeoFeatureCollection {
  type: "FeatureCollection";
  features: GeoFeature[];
}

/** Normalize IDP counts to 0–1 intensity across the input set (max-scaled). */
export function buildDisplacementIntensity(
  records: DtmDisplacementRecord[] = DEMO_DTM_RECORDS,
): GeoFeatureCollection {
  const stock = records.filter((r) => r.measure === "stock" && r.centroid);
  const max = Math.max(1, ...stock.map((r) => r.individuals));

  const features: GeoFeature[] = stock.map((r) => {
    const c = coarsenCoord(r.centroid!, 2);
    return {
      type: "Feature",
      geometry: { type: "Point", coordinates: [c.lon, c.lat] },
      properties: {
        admin1Name: r.admin1Name,
        admin1Pcode: r.admin1Pcode,
        idps: r.individuals,
        intensity: Math.round((r.individuals / max) * 100) / 100,
        reportingDate: r.reportingDate,
        source: r.source,
      },
    };
  });

  return { type: "FeatureCollection", features };
}

export type CorridorAccess = "open" | "constrained" | "blocked";

export interface AidCorridor {
  id: string;
  nameEn: string;
  nameUk: string;
  access: CorridorAccess;
  path: Array<[number, number]>; // [lon, lat] coarse waypoints
  source: string;
  url?: string;
}

/** Demo aid corridors (aggregate inter-agency convoy routes — no PII). */
export const DEMO_AID_CORRIDORS: AidCorridor[] = [
  {
    id: "corridor-dnipro-zaporizhzhia",
    nameEn: "Dnipro → Zaporizhzhia convoy corridor",
    nameUk: "Конвойний коридор Дніпро → Запоріжжя",
    access: "constrained",
    path: [[35.04, 48.46], [35.14, 47.84]],
    source: "OCHA Access Unit",
    url: "https://data.humdata.org/dataset/ukraine-humanitarian-access",
  },
  {
    id: "corridor-kharkiv-frontline",
    nameEn: "Kharkiv front-line access route",
    nameUk: "Прифронтовий маршрут доступу Харків",
    access: "blocked",
    path: [[36.23, 49.99], [37.5, 49.5]],
    source: "OCHA Access Unit",
    url: "https://data.humdata.org/dataset/ukraine-humanitarian-access",
  },
  {
    id: "corridor-kyiv-hub",
    nameEn: "Kyiv humanitarian hub distribution route",
    nameUk: "Маршрут розподілу з гуманітарного хабу Київ",
    access: "open",
    path: [[30.52, 50.45], [32.61, 50.0]],
    source: "OCHA Access Unit",
    url: "https://data.humdata.org/dataset/ukraine-humanitarian-access",
  },
];

export function buildAidCorridors(corridors: AidCorridor[] = DEMO_AID_CORRIDORS): GeoFeatureCollection {
  return {
    type: "FeatureCollection",
    features: corridors.map((c) => ({
      type: "Feature",
      geometry: { type: "LineString", coordinates: c.path },
      properties: {
        id: c.id,
        nameEn: c.nameEn,
        nameUk: c.nameUk,
        access: c.access,
        source: c.source,
        url: c.url,
      },
    })),
  };
}

/** Combined payload for the `humanitarian` layer API route. */
export function buildHumanitarianLayer(records?: DtmDisplacementRecord[]) {
  return {
    displacement: buildDisplacementIntensity(records),
    corridors: buildAidCorridors(),
  };
}
