/**
 * Task 3 — Per-activation vector + raster outputs (typed AOI/vector/raster model).
 *
 * For a given activation, EMS publishes one or more AOIs, each with vector
 * outputs (flood-extent polygons, damage-grading polygons) and raster outputs
 * (classified flood extent, burn scar, damage class, before/after GeoTIFFs).
 * This module is the typed contract the layer builders + cross-reference consume.
 *
 * `loadActivationOutputs()` is demo-backed: against the live service it would
 * download the per-component GeoPackage / GeoTIFF; here it returns a fixture so
 * the contract is fully exercisable offline. All geometry is illustrative.
 */

import type {
  ActivationOutputs,
  ActivationAOI,
  VectorOutput,
  RasterOutput,
  BBox,
} from "./types";

/** Compute a coarse [lon,lat] centroid for a bbox. */
export function bboxCentroid(b: BBox): [number, number] {
  return [
    Math.round(((b.west + b.east) / 2) * 100) / 100,
    Math.round(((b.south + b.north) / 2) * 100) / 100,
  ];
}

/** Approximate area (m²) of a single polygon ring via the shoelace formula. */
export function ringAreaM2(ring: Array<[number, number]>): number {
  if (ring.length < 3) return 0;
  // Equirectangular approximation around the ring's mean latitude.
  const latMean = (ring.reduce((s, p) => s + p[1], 0) / ring.length) * (Math.PI / 180);
  const mPerDegLat = 111_320;
  const mPerDegLon = 111_320 * Math.cos(latMean);
  let area = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0] * mPerDegLon;
    const yi = ring[i][1] * mPerDegLat;
    const xj = ring[j][0] * mPerDegLon;
    const yj = ring[j][1] * mPerDegLat;
    area += xj * yi - xi * yj;
  }
  return Math.abs(area / 2);
}

/** Total affected area (m²) across all polygon features of a vector output. */
export function vectorAffectedAreaM2(v: VectorOutput): number {
  let total = 0;
  for (const f of v.features) {
    if (typeof f.properties.areaM2 === "number") {
      total += f.properties.areaM2;
      continue;
    }
    if (f.geometry.type === "Polygon") {
      total += ringAreaM2(f.geometry.coordinates[0] ?? []);
    } else if (f.geometry.type === "MultiPolygon") {
      for (const poly of f.geometry.coordinates) total += ringAreaM2(poly[0] ?? []);
    }
  }
  return Math.round(total);
}

/**
 * Load all outputs (AOIs + vector + raster) for an activation.
 * Demo-backed; returns null for unknown codes (caller falls back gracefully).
 */
export function loadActivationOutputs(activationCode: string): ActivationOutputs | null {
  const fixture = DEMO_OUTPUTS[activationCode];
  return fixture ?? null;
}

// ── Demo per-activation outputs (public-domain Copernicus EMS — illustrative) ────

const FLOOD_BBOX: BBox = { west: 34.9, south: 48.3, east: 35.2, north: 48.6 };
const FIRE_BBOX: BBox = { west: 35.0, south: 46.8, east: 35.4, north: 47.2 };
const DAMAGE_BBOX: BBox = { west: 37.7, south: 47.9, east: 37.95, north: 48.15 };

export const DEMO_OUTPUTS: Record<string, ActivationOutputs> = {
  EMSR698: {
    activationCode: "EMSR698",
    aois: [
      {
        activationCode: "EMSR698",
        aoiId: "AOI01",
        name: "Dnipro floodplain",
        bbox: FLOOD_BBOX,
        centroid: bboxCentroid(FLOOD_BBOX),
        country: "UA",
      } as ActivationAOI,
    ],
    vectors: [
      {
        activationCode: "EMSR698",
        aoiId: "AOI01",
        productId: "EMSR698_AOI01_DELINEATION_v1",
        type: "delineation",
        hazard: "flood",
        url: "https://emergency.copernicus.eu/mapping/list-of-components/EMSR698/ALL/EMSR698_AOI01_DELINEATION",
        releasedAt: "2026-05-20T18:00:00Z",
        features: [
          {
            geometry: {
              type: "Polygon",
              coordinates: [[
                [34.95, 48.35], [35.15, 48.35], [35.15, 48.55], [34.95, 48.55], [34.95, 48.35],
              ]],
            },
            properties: { notation: "observed_flood_extent" },
          },
        ],
      },
    ],
    rasters: [
      {
        activationCode: "EMSR698",
        aoiId: "AOI01",
        productId: "EMSR698_AOI01_DELINEATION_RASTER_v1",
        type: "delineation",
        hazard: "flood",
        band: "flood_extent",
        bbox: FLOOD_BBOX,
        resolutionM: 10,
        url: "https://emergency.copernicus.eu/mapping/download/EMSR698_AOI01_DELINEATION_raster.tif",
        releasedAt: "2026-05-20T18:00:00Z",
      },
    ],
  },
  EMSR695: {
    activationCode: "EMSR695",
    aois: [
      {
        activationCode: "EMSR695",
        aoiId: "AOI01",
        name: "Southern Ukraine burn area",
        bbox: FIRE_BBOX,
        centroid: bboxCentroid(FIRE_BBOX),
        country: "UA",
      } as ActivationAOI,
    ],
    vectors: [
      {
        activationCode: "EMSR695",
        aoiId: "AOI01",
        productId: "EMSR695_AOI01_DELINEATION_v1",
        type: "delineation",
        hazard: "fire",
        url: "https://emergency.copernicus.eu/mapping/list-of-components/EMSR695/ALL/EMSR695_AOI01_DELINEATION",
        releasedAt: "2026-05-12T20:00:00Z",
        features: [
          {
            geometry: {
              type: "Polygon",
              coordinates: [[
                [35.05, 46.85], [35.35, 46.85], [35.35, 47.15], [35.05, 47.15], [35.05, 46.85],
              ]],
            },
            properties: { notation: "burnt_area" },
          },
        ],
      },
    ],
    rasters: [
      {
        activationCode: "EMSR695",
        aoiId: "AOI01",
        productId: "EMSR695_AOI01_BURNSCAR_v1",
        type: "delineation",
        hazard: "fire",
        band: "burn_scar",
        bbox: FIRE_BBOX,
        resolutionM: 10,
        url: "https://emergency.copernicus.eu/mapping/download/EMSR695_AOI01_burnscar.tif",
        releasedAt: "2026-05-12T20:00:00Z",
      },
    ],
  },
  EMSR700: {
    activationCode: "EMSR700",
    aois: [
      {
        activationCode: "EMSR700",
        aoiId: "AOI01",
        name: "Eastern Ukraine urban damage",
        bbox: DAMAGE_BBOX,
        centroid: bboxCentroid(DAMAGE_BBOX),
        country: "UA",
      } as ActivationAOI,
    ],
    vectors: [
      {
        activationCode: "EMSR700",
        aoiId: "AOI01",
        productId: "EMSR700_AOI01_GRADING_v1",
        type: "grading",
        hazard: "conflict",
        url: "https://emergency.copernicus.eu/mapping/list-of-components/EMSR700/ALL/EMSR700_AOI01_GRADING",
        releasedAt: "2026-05-29T09:00:00Z",
        features: [
          {
            geometry: { type: "Point", coordinates: [37.81, 48.02] },
            properties: { grade: "destroyed", notation: "building" },
          },
          {
            geometry: { type: "Point", coordinates: [37.82, 48.03] },
            properties: { grade: "damaged", notation: "building" },
          },
          {
            geometry: { type: "Point", coordinates: [37.83, 48.01] },
            properties: { grade: "possibly_damaged", notation: "building" },
          },
        ],
      },
    ],
    rasters: [
      {
        activationCode: "EMSR700",
        aoiId: "AOI01",
        productId: "EMSR700_AOI01_DAMAGE_RASTER_v1",
        type: "grading",
        hazard: "conflict",
        band: "damage_class",
        bbox: DAMAGE_BBOX,
        resolutionM: 0.5,
        url: "https://emergency.copernicus.eu/mapping/download/EMSR700_AOI01_damage.tif",
        releasedAt: "2026-05-29T09:00:00Z",
      },
    ],
  },
};

export { FLOOD_BBOX, FIRE_BBOX, DAMAGE_BBOX };
