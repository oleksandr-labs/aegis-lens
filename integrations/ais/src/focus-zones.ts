/**
 * Black Sea + Sea of Azov focus polygons.
 *
 * GeoJSON polygon constants for the conflict-relevant maritime zones, plus a
 * point-in-polygon test for tagging vessel positions to a zone. Coordinates are
 * [lon, lat] per the GeoJSON spec. Polygons are deliberately coarse operational
 * boxes, not legal maritime boundaries.
 */

export type MaritimeZoneId =
  | "black_sea"
  | "sea_of_azov"
  | "nw_black_sea"
  | "kerch_strait"
  | "danube_delta";

export interface MaritimeZoneFeature {
  type: "Feature";
  id: MaritimeZoneId;
  properties: {
    id: MaritimeZoneId;
    name_en: string;
    name_uk: string;
    /** Operational note about why the zone is focused */
    note_en: string;
    note_uk: string;
  };
  geometry: {
    type: "Polygon";
    /** [lon, lat] rings */
    coordinates: number[][][];
  };
}

function poly(
  id: MaritimeZoneId,
  name_en: string,
  name_uk: string,
  note_en: string,
  note_uk: string,
  ring: number[][],
): MaritimeZoneFeature {
  const closed = ring[0] === ring[ring.length - 1] ? ring : [...ring, ring[0]];
  return {
    type: "Feature",
    id,
    properties: { id, name_en, name_uk, note_en, note_uk },
    geometry: { type: "Polygon", coordinates: [closed] },
  };
}

export const MARITIME_FOCUS_ZONES: MaritimeZoneFeature[] = [
  poly(
    "black_sea",
    "Black Sea",
    "Чорне море",
    "Primary maritime theatre: grain corridor, naval activity, missile launch boxes.",
    "Основний морський театр: зерновий коридор, активність флоту, зони пусків ракет.",
    [
      [27.45, 40.9],
      [41.7, 41.0],
      [41.7, 46.6],
      [31.4, 46.6],
      [29.6, 45.2],
      [27.45, 42.5],
    ],
  ),
  poly(
    "sea_of_azov",
    "Sea of Azov",
    "Азовське море",
    "Russian-controlled inland sea; closed shipping, military logistics.",
    "Внутрішнє море під контролем РФ; закрите судноплавство, військова логістика.",
    [
      [34.8, 45.3],
      [39.3, 45.9],
      [39.3, 47.3],
      [36.9, 47.3],
      [34.8, 46.1],
    ],
  ),
  poly(
    "nw_black_sea",
    "North-West Black Sea",
    "Північно-західне Чорне море",
    "Odesa approaches and the grain export corridor.",
    "Підходи до Одеси та зерновий експортний коридор.",
    [
      [29.6, 44.6],
      [32.1, 44.6],
      [32.1, 46.6],
      [30.2, 46.6],
      [29.6, 45.4],
    ],
  ),
  poly(
    "kerch_strait",
    "Kerch Strait",
    "Керченська протока",
    "Choke point + STS transfer anchorage used by the shadow fleet.",
    "Вузьке місце та рейд STS, що використовує тіньовий флот.",
    [
      [36.3, 44.9],
      [36.9, 44.9],
      [36.9, 45.5],
      [36.3, 45.5],
    ],
  ),
  poly(
    "danube_delta",
    "Danube Delta approaches",
    "Підходи до дельти Дунаю",
    "Inland alternative grain route via Izmail / Reni.",
    "Внутрішній альтернативний зерновий маршрут через Ізмаїл / Рені.",
    [
      [28.6, 45.1],
      [29.9, 45.1],
      [29.9, 45.7],
      [28.6, 45.7],
    ],
  ),
];

export const MARITIME_FOCUS_ZONES_FC = {
  type: "FeatureCollection" as const,
  features: MARITIME_FOCUS_ZONES,
};

/** Ray-casting point-in-polygon. `point` is [lon, lat]. */
export function pointInZone(lon: number, lat: number, zone: MaritimeZoneFeature): boolean {
  const ring = zone.geometry.coordinates[0];
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect =
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Return the id of the (most specific) focus zone a position falls in. */
export function zoneForPosition(lon: number, lat: number): MaritimeZoneId | null {
  // check sub-zones before the parent Black Sea box
  const order: MaritimeZoneId[] = ["kerch_strait", "danube_delta", "nw_black_sea", "sea_of_azov", "black_sea"];
  for (const id of order) {
    const z = MARITIME_FOCUS_ZONES.find((f) => f.id === id);
    if (z && pointInZone(lon, lat, z)) return id;
  }
  return null;
}
