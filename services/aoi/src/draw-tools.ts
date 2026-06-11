/**
 * AOI draw-tool normalisation.
 *
 * Converts polygon / circle / rectangle / MGRS-box draw inputs into a
 * canonical polygon ring for storage.  The actual UI drawing widgets live in
 * the web app (Mapbox GL Draw plugin); this module handles the normalisation
 * and type definitions only.
 */

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

/** EN operational notes for draw tools */
export const DRAW_TOOL_NOTES_EN = [
  "mapbox-draw-plugin: use @mapbox/mapbox-gl-draw for in-browser polygon/circle/rectangle drawing; wire to normalizeToPolygon() on commit",
  "geofence-validation: validate that the resulting polygon is non-self-intersecting and covers ≤ 500 km² for community tier",
  "max-vertices-500: hard-cap polygon rings to 500 vertices before persisting; simplify with Ramer-Douglas-Peucker if over limit",
] as const;

/** UA операційні примітки для інструментів малювання */
export const DRAW_TOOL_NOTES_UK = [
  "mapbox-draw-plugin: використовуйте @mapbox/mapbox-gl-draw для малювання полігонів/кіл/прямокутників у браузері; підключіть normalizeToPolygon() під час збереження",
  "geofence-validation: перевірте, що отриманий полігон не самоперетинається та охоплює ≤ 500 км² для community-рівня",
  "max-vertices-500: обмежуйте кільця полігонів 500 вершинами перед збереженням; спрощуйте алгоритмом Рамера–Дугласа–Пекера при перевищенні",
] as const;

/** EN notes for MGRS → lat/lng conversion */
export const MGRS_TO_LAT_LNG_NOTE_EN = [
  "mgrs-library-required-npm-mgrs: install the `mgrs` npm package (https://www.npmjs.com/package/mgrs) for client-side MGRS ↔ WGS-84 conversion",
  "server-conversion: alternatively perform MGRS → lat/lng on the server using proj4 or a PostGIS ST_Transform call",
] as const;

/** UA примітки для конвертації MGRS → lat/lng */
export const MGRS_TO_LAT_LNG_NOTE_UK = [
  "mgrs-library-required-npm-mgrs: встановіть пакет `mgrs` (https://www.npmjs.com/package/mgrs) для клієнтської конвертації MGRS ↔ WGS-84",
  "server-conversion: альтернативно виконуйте MGRS → lat/lng на сервері за допомогою proj4 або PostGIS ST_Transform",
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Drawing mode for AOI input */
export type AOIDrawMode = "polygon" | "circle" | "rectangle" | "mgrs_box";

/**
 * MGRS grid-square specifier.
 *
 * precision controls the easting/northing digit count:
 *   1 = 10 km, 2 = 1 km, 3 = 100 m, 4 = 10 m, 5 = 1 m
 */
export interface MGRSBox {
  /** e.g. "37U" */
  gridZone: string;
  /** 2-letter square ID, e.g. "DB" */
  squareId: string;
  /** Right-side digits of easting within square */
  easting: number;
  /** Right-side digits of northing within square */
  northing: number;
  /** Digit precision: 1=10km … 5=1m */
  precision: 1 | 2 | 3 | 4 | 5;
}

/** Raw draw input from the UI — one of four modes */
export interface AOIDrawInput {
  mode: AOIDrawMode;
  /** Polygon ring or rectangle corners ([lng, lat][]) */
  polygon?: { coordinates: [number, number][] };
  /** Circle centre + radius */
  circle?: { center: [number, number]; radiusKm: number };
  /** MGRS bounding box */
  mgrs?: MGRSBox;
}

/** Canonical polygon output stored in the AOI record */
export interface NormalizedPolygon {
  type: "polygon";
  /** Closed ring: first === last point, [lng, lat] pairs */
  coordinates: [number, number][];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Approximate degrees-per-km at equator */
const KM_PER_DEG_LAT = 111.32;

function degPerKmLng(latDeg: number): number {
  return KM_PER_DEG_LAT * Math.cos((latDeg * Math.PI) / 180);
}

/** Build a closed rectangle ring from SW + NE corners */
function rectangleRing(sw: [number, number], ne: [number, number]): [number, number][] {
  const [wLng, sLat] = sw;
  const [eLng, nLat] = ne;
  return [
    [wLng, sLat],
    [eLng, sLat],
    [eLng, nLat],
    [wLng, nLat],
    [wLng, sLat], // close
  ];
}

/**
 * Approximate a circle with a 64-point polygon.
 * center: [lng, lat]
 */
function circleToRing(center: [number, number], radiusKm: number, steps = 64): [number, number][] {
  const [lng, lat] = center;
  const dLat = radiusKm / KM_PER_DEG_LAT;
  const dLng = radiusKm / degPerKmLng(lat);
  const ring: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (2 * Math.PI * i) / steps;
    ring.push([lng + dLng * Math.cos(angle), lat + dLat * Math.sin(angle)]);
  }
  return ring;
}

/**
 * Approximate MGRS box to a polygon.
 *
 * NOTE: a full implementation requires the `mgrs` npm package for accurate
 * grid→WGS84 conversion.  This stub returns a 1°×1° placeholder centred on
 * [0, 0] and should be replaced with a real MGRS library call.
 *
 * See MGRS_TO_LAT_LNG_NOTE_EN for the recommended approach.
 */
function mgrsToRing(mgrs: MGRSBox): [number, number][] {
  // Precision → half-side in km
  const halfKm = [5, 0.5, 0.05, 0.005, 0.0005][mgrs.precision - 1] ?? 5;
  // Placeholder centre — replace with real mgrs.toPoint() call
  const lat = 0;
  const lng = 0;
  const dLat = halfKm / KM_PER_DEG_LAT;
  const dLng = halfKm / degPerKmLng(lat);
  return rectangleRing([lng - dLng, lat - dLat], [lng + dLng, lat + dLat]);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Normalise any AOIDrawInput to a canonical closed polygon ring.
 *
 * Polygon / rectangle inputs are passed through (rectangle must already be
 * expressed as a 4-or-5-point ring).
 * Circle inputs are approximated with 64 segments.
 * MGRS inputs are approximated via mgrsToRing() (stub — see note).
 */
export function normalizeToPolygon(input: AOIDrawInput): NormalizedPolygon {
  switch (input.mode) {
    case "polygon":
    case "rectangle": {
      const coords = input.polygon?.coordinates ?? [];
      // Ensure ring is closed
      const ring: [number, number][] =
        coords.length > 0 &&
        coords[0]![0] === coords[coords.length - 1]![0] &&
        coords[0]![1] === coords[coords.length - 1]![1]
          ? (coords as [number, number][])
          : ([...coords, coords[0]!] as [number, number][]);
      return { type: "polygon", coordinates: ring };
    }

    case "circle": {
      if (!input.circle) {
        throw new Error("AOIDrawInput.circle is required for mode='circle'");
      }
      return {
        type: "polygon",
        coordinates: circleToRing(input.circle.center, input.circle.radiusKm),
      };
    }

    case "mgrs_box": {
      if (!input.mgrs) {
        throw new Error("AOIDrawInput.mgrs is required for mode='mgrs_box'");
      }
      return { type: "polygon", coordinates: mgrsToRing(input.mgrs) };
    }
  }
}
