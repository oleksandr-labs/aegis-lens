/**
 * No-fly / restricted airspace overlay for Ukrainian airspace.
 *
 * Provides GeoJSON restricted-zone polygons and a point-in-zone test used to:
 *   - render the no-fly overlay on the aviation layer, and
 *   - flag ADS-B coverage gaps near restricted zones (input to mil-estimation).
 *
 * NOTE: Since 24 Feb 2022 the *entire* Ukrainian FIR is NOTAM-closed to civil
 * traffic. The polygons below model that closure plus a few illustrative
 * sub-zones (border buffers / known restricted areas). Coordinates are
 * approximate and for visualisation only — not for navigation.
 */

export type RestrictedZoneKind =
  | "fir_closure"      // entire FIR closed by NOTAM
  | "border_buffer"    // frontline / border exclusion buffer
  | "prohibited"       // permanently prohibited area
  | "danger";          // active danger area

export interface RestrictedZone {
  id: string;
  kind: RestrictedZoneKind;
  name: { en: string; uk: string };
  /** GeoJSON Polygon ring as [lon, lat] pairs (closed). */
  ring: Array<[number, number]>;
  /** Lower / upper bounds in flight levels (null = surface / unlimited). */
  floorFL: number | null;
  ceilingFL: number | null;
}

/** Ukrainian FIR outer boundary (simplified for overlay). */
const UA_FIR_RING: Array<[number, number]> = [
  [22.14, 52.38], [33.0, 52.38], [40.23, 51.2], [40.23, 47.0],
  [37.0, 44.38], [29.0, 45.0], [22.14, 48.0], [22.14, 52.38],
];

export const RESTRICTED_ZONES: RestrictedZone[] = [
  {
    id: "ua-fir-ukbv",
    kind: "fir_closure",
    name: {
      en: "Ukraine FIR — NOTAM closure (civil traffic)",
      uk: "РПІ України — закриття за NOTAM (цивільний рух)",
    },
    ring: UA_FIR_RING,
    floorFL: 0,
    ceilingFL: null,
  },
  {
    id: "ua-buffer-east",
    kind: "border_buffer",
    name: {
      en: "Eastern frontline exclusion buffer",
      uk: "Буферна зона східної лінії фронту",
    },
    ring: [
      [36.0, 50.5], [40.23, 50.5], [40.23, 46.5], [36.5, 46.5], [36.0, 50.5],
    ],
    floorFL: 0,
    ceilingFL: null,
  },
  {
    id: "ua-prohibited-znpp",
    kind: "prohibited",
    name: {
      en: "Zaporizhzhia NPP prohibited area",
      uk: "Заборонена зона Запорізької АЕС",
    },
    ring: [
      [34.5, 47.6], [34.7, 47.6], [34.7, 47.4], [34.5, 47.4], [34.5, 47.6],
    ],
    floorFL: 0,
    ceilingFL: null,
  },
];

/** GeoJSON FeatureCollection of all restricted zones for the map overlay. */
export function restrictedAirspaceGeoJSON() {
  return {
    type: "FeatureCollection" as const,
    features: RESTRICTED_ZONES.map((z) => ({
      type: "Feature" as const,
      id: z.id,
      properties: {
        id: z.id,
        kind: z.kind,
        name_en: z.name.en,
        name_uk: z.name.uk,
        floorFL: z.floorFL,
        ceilingFL: z.ceilingFL,
      },
      geometry: {
        type: "Polygon" as const,
        coordinates: [z.ring],
      },
    })),
  };
}

/** Ray-casting point-in-polygon test. point = [lon, lat]. */
function pointInRing(point: [number, number], ring: Array<[number, number]>): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Return all restricted zones containing the given lat/lon (and FL band, if known). */
export function zonesAt(lat: number, lon: number, flightLevel?: number | null): RestrictedZone[] {
  return RESTRICTED_ZONES.filter((z) => {
    if (!pointInRing([lon, lat], z.ring)) return false;
    if (flightLevel == null) return true;
    if (z.floorFL != null && flightLevel < z.floorFL) return false;
    if (z.ceilingFL != null && flightLevel > z.ceilingFL) return false;
    return true;
  });
}

/** True when the point falls inside any restricted zone. */
export function isInRestrictedAirspace(lat: number, lon: number, flightLevel?: number | null): boolean {
  return zonesAt(lat, lon, flightLevel).length > 0;
}
