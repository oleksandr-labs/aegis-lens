export interface LatLng {
  lat: number;
  lng: number;
}

export interface GeoResult {
  point: LatLng;
  /** Uncertainty radius in metres */
  precision_m: number;
  method: GeocodingMethod;
  /** Admin hierarchy, outermost to innermost */
  admin: AdminRegion[];
  display_name: Record<string, string>;
  confidence: number;
}

export type GeocodingMethod =
  | "nominatim"
  | "mapbox"
  | "manual"
  | "image_geolocation"
  | "coordinate_literal"
  | "region_centroid";

export interface AdminRegion {
  level: 0 | 1 | 2 | 3 | 4;
  code: string;
  name: Record<string, string>;
}

export interface ReverseResult {
  admin: AdminRegion[];
  display_name: Record<string, string>;
  /** Distance from query point to polygon centroid, metres */
  distance_m: number;
}

/** Supported coordinate formats */
export type CoordFormat = "decimal" | "dms" | "utm" | "mgrs";

export interface ParsedCoord {
  point: LatLng;
  format: CoordFormat;
  raw: string;
}
