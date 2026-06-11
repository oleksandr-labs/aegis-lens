/**
 * Ingestion of the ISW / Critical Threats Project interactive "Control of Terrain" map.
 *
 * ISW publishes daily control-of-terrain layers (ArcGIS / GeoJSON feature collections).
 * This module normalizes those features into our typed `ControlPolygon` model.
 *
 * LICENSING (see COMPLIANCE.md): the underlying control map is © ISW/CTP. We ingest
 * polygons for INTERNAL analysis (diff / divergence) and surface them as an OVERLAY on
 * the platform's existing control layer with ISW attribution — we do NOT republish the
 * ISW map as a standalone product. A bundled DEMO snapshot is provided for offline use.
 */

import type {
  ControlMapSnapshot,
  ControlPolygon,
  ControlState,
  OblastCode,
  PolygonRing,
} from "./types";

/** Loose shape of a GeoJSON Feature as it might arrive from the ISW map service. */
export interface RawControlFeature {
  type?: "Feature";
  id?: string | number;
  properties?: Record<string, unknown>;
  geometry?: {
    type: "Polygon" | "MultiPolygon";
    coordinates: unknown;
  };
}

export interface RawControlFeatureCollection {
  type?: "FeatureCollection";
  features?: RawControlFeature[];
}

/**
 * Map free-form ISW control labels to our canonical `ControlState`.
 * ISW uses descriptive strings ("Assessed Russian Advances in Ukraine", etc.);
 * we match conservatively and default to "contested" when unsure.
 */
export function classifyControlState(raw: string | undefined): ControlState {
  const s = (raw ?? "").toLowerCase();
  if (/counter[\s-]?offensive|ukrainian (advance|counter)/.test(s)) return "ua_counteroffensive";
  if (/claimed|reported russian|not assessed/.test(s)) return "ru_claimed";
  if (/advance/.test(s) && /russ/.test(s)) return "ru_advance";
  if (/occupied|russian[\s-]?controlled|russian[\s-]?held/.test(s)) return "ru_occupied";
  if (/ukrainian[\s-]?controlled|ukrainian[\s-]?held/.test(s)) return "ua_controlled";
  if (/contest|grey ?zone|gray ?zone|disputed/.test(s)) return "contested";
  return "contested";
}

/** Normalize a GeoJSON geometry into an array of polygon ring-sets. */
function geometryToRingSets(geometry: RawControlFeature["geometry"]): PolygonRing[][] {
  if (!geometry) return [];
  if (geometry.type === "Polygon") {
    return [normalizeRings(geometry.coordinates)];
  }
  if (geometry.type === "MultiPolygon") {
    const multi = geometry.coordinates as unknown[];
    return multi.map((poly) => normalizeRings(poly));
  }
  return [];
}

function normalizeRings(coords: unknown): PolygonRing[] {
  if (!Array.isArray(coords)) return [];
  const rings: PolygonRing[] = [];
  for (const ring of coords) {
    if (!Array.isArray(ring)) continue;
    const pts: Array<[number, number]> = [];
    for (const pt of ring) {
      if (Array.isArray(pt) && typeof pt[0] === "number" && typeof pt[1] === "number") {
        pts.push([pt[0], pt[1]]);
      }
    }
    if (pts.length >= 3) rings.push(pts);
  }
  return rings;
}

/**
 * Planar shoelace-area estimate in km^2 for a polygon's outer ring.
 * Good enough for ranking/diff magnitude at Ukraine latitudes; NOT geodesic.
 */
export function approxAreaKm2(rings: PolygonRing[]): number {
  const outer = rings[0];
  if (!outer || outer.length < 3) return 0;
  // Convert degrees to km using a local equirectangular approximation.
  const latRef = outer.reduce((a, p) => a + p[1], 0) / outer.length;
  const kmPerDegLat = 111.32;
  const kmPerDegLon = 111.32 * Math.cos((latRef * Math.PI) / 180);
  let area2 = 0;
  for (let i = 0; i < outer.length; i++) {
    const [x1, y1] = outer[i];
    const [x2, y2] = outer[(i + 1) % outer.length];
    area2 += (x1 * kmPerDegLon) * (y2 * kmPerDegLat) - (x2 * kmPerDegLon) * (y1 * kmPerDegLat);
  }
  return Math.abs(area2) / 2;
}

/** Centroid [lon, lat] of a polygon's outer ring (vertex average). */
export function polygonCentroid(rings: PolygonRing[]): [number, number] | null {
  const outer = rings[0];
  if (!outer || outer.length === 0) return null;
  const sum = outer.reduce<[number, number]>((a, p) => [a[0] + p[0], a[1] + p[1]], [0, 0]);
  return [sum[0] / outer.length, sum[1] / outer.length];
}

/**
 * Best-effort oblast tagging by testing the polygon centroid against a small
 * bounding-box table. Returns [] when no box matches (the diff/divergence modules
 * tolerate empty oblast tags). This is intentionally coarse — precise PIP belongs
 * to the platform `services/geo` package.
 */
const OBLAST_BBOXES: Array<{ code: OblastCode; minLon: number; minLat: number; maxLon: number; maxLat: number }> = [
  { code: "UA-14", minLon: 36.6, minLat: 46.8, maxLon: 39.0, maxLat: 49.3 }, // Donetsk
  { code: "UA-09", minLon: 37.9, minLat: 47.8, maxLon: 40.2, maxLat: 50.1 }, // Luhansk
  { code: "UA-63", minLon: 35.0, minLat: 48.7, maxLon: 38.2, maxLat: 50.5 }, // Kharkiv
  { code: "UA-23", minLon: 34.0, minLat: 46.6, maxLon: 37.3, maxLat: 48.4 }, // Zaporizhzhia
  { code: "UA-65", minLon: 31.5, minLat: 45.9, maxLon: 34.6, maxLat: 47.5 }, // Kherson
  { code: "UA-59", minLon: 33.0, minLat: 50.0, maxLon: 35.6, maxLat: 52.0 }, // Sumy
  { code: "UA-12", minLon: 33.5, minLat: 47.4, maxLon: 36.6, maxLat: 49.3 }, // Dnipropetrovsk
];

export function oblastsForCentroid(centroid: [number, number] | null): OblastCode[] {
  if (!centroid) return [];
  const [lon, lat] = centroid;
  return OBLAST_BBOXES.filter(
    (b) => lon >= b.minLon && lon <= b.maxLon && lat >= b.minLat && lat <= b.maxLat,
  ).map((b) => b.code);
}

/** Normalize a raw ISW feature collection into a typed control-map snapshot. */
export function ingestControlMap(
  raw: RawControlFeatureCollection,
  opts: { assessmentDate: string; sourceUrl: string; isDemo?: boolean },
): ControlMapSnapshot {
  const polygons: ControlPolygon[] = [];
  const features = raw.features ?? [];

  features.forEach((feature, idx) => {
    const props = feature.properties ?? {};
    const stateRaw =
      (props.control as string) ??
      (props.status as string) ??
      (props.layer as string) ??
      (props.Name as string) ??
      (props.name as string);
    const controlState = classifyControlState(stateRaw);
    const ringSets = geometryToRingSets(feature.geometry);

    ringSets.forEach((rings, partIdx) => {
      if (rings.length === 0) return;
      const centroid = polygonCentroid(rings);
      const sourceFeatureId = feature.id != null ? String(feature.id) : undefined;
      polygons.push({
        polygonId: `isw-${opts.assessmentDate}-${sourceFeatureId ?? idx}-${partIdx}`,
        sourceFeatureId,
        controlState,
        rings,
        oblastCodes: oblastsForCentroid(centroid),
        assessmentDate: opts.assessmentDate,
        areaKm2: approxAreaKm2(rings),
        label: typeof props.label === "string" ? { en: props.label } : undefined,
      });
    });
  });

  return {
    assessmentDate: opts.assessmentDate,
    polygons,
    sourceUrl: opts.sourceUrl,
    fetchedAt: new Date().toISOString(),
    isDemo: opts.isDemo ?? false,
  };
}

/**
 * Bundled DEMO control-map snapshot (two small illustrative polygons near the
 * Donetsk front). Used when live ISW map data is unavailable.
 */
export function demoControlSnapshot(assessmentDate = "2026-06-05"): ControlMapSnapshot {
  const raw: RawControlFeatureCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        id: "ru-occupied-donetsk-demo",
        properties: { control: "Russian-occupied", label: "Avdiivka sector" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [37.70, 48.10],
              [37.95, 48.10],
              [37.95, 48.30],
              [37.70, 48.30],
              [37.70, 48.10],
            ],
          ],
        },
      },
      {
        type: "Feature",
        id: "ru-advance-donetsk-demo",
        properties: { control: "Assessed Russian Advance", label: "SW of Avdiivka" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [37.62, 48.02],
              [37.70, 48.02],
              [37.70, 48.12],
              [37.62, 48.12],
              [37.62, 48.02],
            ],
          ],
        },
      },
    ],
  };
  return ingestControlMap(raw, {
    assessmentDate,
    sourceUrl: "https://www.understandingwar.org/backgrounder/ukraine-conflict-updates",
    isDemo: true,
  });
}
