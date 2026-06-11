/**
 * Geospatial import helpers.
 *
 * Parses GeoJSON natively; KML and Shapefile are stubs pending library
 * integration.  All parsers normalise their output to the same
 * GeospatialImportResult shape so callers are format-agnostic.
 */

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

/** EN implementation notes */
export const IMPORT_NOTES_EN = [
  "geojson-native: GeoJSON parsing is built-in; only FeatureCollection and Feature of type Polygon/MultiPolygon are imported",
  "kml-turf-js-parser: use the `@tmcw/togeojson` package to convert KML → GeoJSON before passing to parseGeoJSON()",
  "shapefile-shpjs-npm: use the `shpjs` npm package to parse .shp/.dbf buffers; it resolves to a GeoJSON FeatureCollection",
] as const;

/** UA нотатки щодо реалізації */
export const IMPORT_NOTES_UK = [
  "geojson-native: парсинг GeoJSON вбудований; імпортуються лише FeatureCollection та Feature типу Polygon/MultiPolygon",
  "kml-turf-js-parser: використовуйте пакет `@tmcw/togeojson` для конвертації KML → GeoJSON перед передачею до parseGeoJSON()",
  "shapefile-shpjs-npm: використовуйте npm-пакет `shpjs` для обробки буферів .shp/.dbf; він повертає GeoJSON FeatureCollection",
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Supported geospatial import formats */
export type GeospatialImportFormat = "geojson" | "kml" | "shapefile";

/** Normalised polygon AOI extracted from an import */
export interface ImportedAOI {
  name: string;
  polygon: { coordinates: [number, number][] };
}

/** Result returned by every parse function */
export interface GeospatialImportResult {
  success: boolean;
  aois: ImportedAOI[];
  errors?: string[];
  warnings?: string[];
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

type GeoJSONPosition = [number, number] | [number, number, number];

function extractRing(rawCoords: unknown[][]): [number, number][] {
  return (rawCoords as GeoJSONPosition[]).map(([lng, lat]) => [lng, lat] as [number, number]);
}

function polygonFromRing(ring: [number, number][], name: string): ImportedAOI {
  return { name, polygon: { coordinates: ring } };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processFeature(feature: any, index: number): { aoi?: ImportedAOI; error?: string } {
  const name: string =
    (feature?.properties?.name as string | undefined) ||
    (feature?.properties?.Name as string | undefined) ||
    `Imported AOI ${index + 1}`;

  const geom = feature?.geometry;
  if (!geom) return { error: `Feature ${index}: missing geometry` };

  if (geom.type === "Polygon") {
    const ring = extractRing((geom.coordinates as unknown[][])[0] as unknown[][]);
    return { aoi: polygonFromRing(ring, name) };
  }

  if (geom.type === "MultiPolygon") {
    // Take the first ring of each polygon member
    const ring = extractRing(
      ((geom.coordinates as unknown[][][])[0] as unknown[][])[0] as unknown[][],
    );
    return { aoi: polygonFromRing(ring, name) };
  }

  return { error: `Feature ${index}: unsupported geometry type "${geom.type as string}" (only Polygon/MultiPolygon)` };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse a raw GeoJSON string into AOIs.
 *
 * Accepts FeatureCollection or single Feature.  Only Polygon and
 * MultiPolygon geometries are imported; other types generate a warning.
 */
export function parseGeoJSON(json: string): GeospatialImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json) as unknown;
  } catch (e) {
    return { success: false, aois: [], errors: [`Invalid JSON: ${String(e)}`] };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const root = parsed as any;
  const errors: string[] = [];
  const warnings: string[] = [];
  const aois: ImportedAOI[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const features: any[] =
    root?.type === "FeatureCollection"
      ? (root.features as unknown[])
      : root?.type === "Feature"
        ? [root]
        : [];

  if (features.length === 0) {
    return {
      success: false,
      aois: [],
      errors: ['Unrecognised GeoJSON structure — expected FeatureCollection or Feature'],
    };
  }

  for (let i = 0; i < features.length; i++) {
    const { aoi, error } = processFeature(features[i], i);
    if (error) {
      warnings.push(error);
    } else if (aoi) {
      aois.push(aoi);
    }
  }

  if (aois.length === 0 && errors.length === 0) {
    errors.push("No valid Polygon/MultiPolygon features found");
  }

  return {
    success: aois.length > 0,
    aois,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Parse a KML string into AOIs.
 *
 * STUB — requires `@tmcw/togeojson` integration.
 * See IMPORT_NOTES_EN[1] for the recommended approach.
 */
export function parseKMLStub(_kmlString: string): GeospatialImportResult {
  return {
    success: false,
    aois: [],
    errors: [
      "KML parsing is not yet implemented. " +
        "Install @tmcw/togeojson, convert to GeoJSON, then call parseGeoJSON(). " +
        "See IMPORT_NOTES_EN[1].",
    ],
  };
}

/**
 * Parse a Shapefile ArrayBuffer into AOIs.
 *
 * STUB — requires `shpjs` npm package integration.
 * See IMPORT_NOTES_EN[2] for the recommended approach.
 */
export function parseShapefileStub(_buffer: ArrayBuffer): GeospatialImportResult {
  return {
    success: false,
    aois: [],
    errors: [
      "Shapefile parsing is not yet implemented. " +
        "Install shpjs, call shp(buffer) to get a GeoJSON FeatureCollection, then call parseGeoJSON(). " +
        "See IMPORT_NOTES_EN[2].",
    ],
  };
}
