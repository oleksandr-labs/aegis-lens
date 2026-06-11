import type { AOIGeometry } from "./types";

/** Returns true if point (lat, lng) falls inside the AOI geometry */
export function pointInAOI(lat: number, lng: number, geometry: AOIGeometry): boolean {
  switch (geometry.type) {
    case "bbox": {
      const [west, south, east, north] = geometry.bbox;
      return lng >= west && lng <= east && lat >= south && lat <= north;
    }
    case "circle": {
      const [clng, clat] = geometry.center;
      return haversineKm(lat, lng, clat, clng) <= geometry.radius_km;
    }
    case "polygon": {
      return pointInPolygon(lat, lng, geometry.coordinates[0] ?? []);
    }
  }
}

/** Bounding box of an AOI geometry for fast pre-filtering */
export function aoiBoundingBox(geometry: AOIGeometry): [number, number, number, number] {
  switch (geometry.type) {
    case "bbox":
      return geometry.bbox;
    case "circle": {
      const [lng, lat] = geometry.center;
      const dLat = geometry.radius_km / 111.32;
      const dLng = geometry.radius_km / (111.32 * Math.cos((lat * Math.PI) / 180));
      return [lng - dLng, lat - dLat, lng + dLng, lat + dLat];
    }
    case "polygon": {
      const coords = geometry.coordinates[0] ?? [];
      const lngs = coords.map(([lng]) => lng);
      const lats = coords.map(([, lat]) => lat);
      return [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)];
    }
  }
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Ray-casting algorithm: point in polygon */
function pointInPolygon(lat: number, lng: number, ring: [number, number][]): boolean {
  let inside = false;
  const x = lng;
  const y = lat;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i]![0];
    const yi = ring[i]![1];
    const xj = ring[j]![0];
    const yj = ring[j]![1];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
