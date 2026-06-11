/**
 * Historical playback per region (TODO task: "Historical playback per region").
 *
 * Given an ordered series of dated snapshots (from the GitHub mirror), produce a
 * playback timeline clipped to a region's bounding box. Each frame carries the control
 * polygons intersecting the region's bbox plus per-frame counts, so the UI can scrub
 * day-by-day and watch the frontline move.
 *
 * Geometry clipping is intentionally simple (bbox-intersection of polygon bounds) — a
 * lightweight, dependency-free filter suitable for a timeline; precise clipping happens
 * client-side / in PostGIS. No overclaiming: contested frames stay contested.
 */

import type { ControlPolygon, FrontlineSnapshot } from "./types";

export type BBox = [number, number, number, number]; // [west, south, east, north]

/** A named region for playback (bbox in WGS-84). */
export interface PlaybackRegion {
  id: string;
  name: { en: string; uk: string };
  bbox: BBox;
}

export interface PlaybackFrame {
  date: string;
  polygons: ControlPolygon[];
  counts: { controlled: number; contested: number; liberated: number };
}

export interface PlaybackTimeline {
  region: PlaybackRegion;
  frames: PlaybackFrame[];
  fromDate: string;
  toDate: string;
}

/** A few illustrative regions (eastern/southern fronts). */
export const PLAYBACK_REGIONS: PlaybackRegion[] = [
  { id: "donetsk", name: { en: "Donetsk sector", uk: "Донецький напрямок" }, bbox: [36.5, 47.5, 39.0, 49.2] },
  { id: "zaporizhzhia", name: { en: "Zaporizhzhia sector", uk: "Запорізький напрямок" }, bbox: [34.0, 46.8, 37.5, 48.2] },
  { id: "kharkiv", name: { en: "Kharkiv sector", uk: "Харківський напрямок" }, bbox: [35.5, 49.0, 38.5, 50.6] },
  { id: "kherson", name: { en: "Kherson sector", uk: "Херсонський напрямок" }, bbox: [31.5, 46.0, 34.5, 47.5] },
];

function geometryBBox(p: ControlPolygon): BBox {
  let west = Infinity, south = Infinity, east = -Infinity, north = -Infinity;
  const rings =
    p.geometry.type === "Polygon" ? p.geometry.coordinates : p.geometry.coordinates.flat();
  for (const ring of rings) {
    for (const [lon, lat] of ring) {
      if (lon < west) west = lon;
      if (lon > east) east = lon;
      if (lat < south) south = lat;
      if (lat > north) north = lat;
    }
  }
  return [west, south, east, north];
}

function bboxIntersects(a: BBox, b: BBox): boolean {
  return !(a[2] < b[0] || a[0] > b[2] || a[3] < b[1] || a[1] > b[3]);
}

/** Keep only polygons whose bounds intersect the region bbox. */
export function clipToRegion(snapshot: FrontlineSnapshot, region: PlaybackRegion): ControlPolygon[] {
  return snapshot.polygons.filter((p) => bboxIntersects(geometryBBox(p), region.bbox));
}

/**
 * Build a playback timeline for a region from an array of snapshots.
 * Snapshots are sorted by date ascending before framing.
 */
export function buildPlayback(
  snapshots: FrontlineSnapshot[],
  region: PlaybackRegion,
): PlaybackTimeline {
  const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
  const frames: PlaybackFrame[] = sorted.map((s) => {
    const polys = clipToRegion(s, region);
    return {
      date: s.date,
      polygons: polys,
      counts: {
        controlled: polys.filter((p) => p.status === "controlled").length,
        contested: polys.filter((p) => p.status === "contested").length,
        liberated: polys.filter((p) => p.status === "liberated").length,
      },
    };
  });

  return {
    region,
    frames,
    fromDate: frames[0]?.date ?? "",
    toDate: frames[frames.length - 1]?.date ?? "",
  };
}
