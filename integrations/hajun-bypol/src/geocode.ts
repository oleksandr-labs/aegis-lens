/**
 * Geocoding of Hajun/BYPOL free-text locations.
 *
 * Belarus sightings cluster around RAIL NODES and AIRBASES, named in Belarusian
 * / Russian prose (e.g. "станцыя Брэст", "аэрадром Мачулішчы"). This module
 * extracts the place reference and resolves it against a built-in BY gazetteer
 * of rail nodes / airbases / garrisons / border crossings — NO external calls,
 * so the demo path is offline-safe. A production deployment can plug in a real
 * gazetteer adapter behind the same `Geocoder` interface.
 *
 * Output coordinates carry an HONEST, deliberately LOW precision: we resolve to
 * the POI centroid (rail yard / airbase), never to a contributor's vantage
 * point. uncertaintyM reflects POI extent (rail node ~5 km, airbase ~3 km).
 */

import type { ByPoi, ByPoiKind } from "./types";

export interface GeocodeResult {
  lat: number;
  lon: number;
  /** 1-sigma uncertainty radius in metres (intentionally coarse). */
  uncertaintyM: number;
  poiId: string;
  poiKind: ByPoiKind;
  resolvedNameEn: string;
  resolvedNameUk: string;
  /** 0–1: how confident the resolver is. */
  confidence: number;
}

/** Pluggable resolver. The demo uses ByGazetteerGeocoder; prod can swap in. */
export interface Geocoder {
  geocode(text: string): Promise<GeocodeResult | undefined>;
}

// ── Belarus gazetteer: rail nodes, airbases, garrisons, border crossings ──────

export const BY_GAZETTEER: ByPoi[] = [
  // Rail nodes (key logistics chokepoints toward the UA border).
  { id: "rail_brest",      kind: "rail_node",        nameEn: "Brest",       nameUk: "Брест",      nameBe: "Брэст",      lonlat: [23.687, 52.098], aliases: ["брэст", "брест", "brest"] },
  { id: "rail_zhabinka",   kind: "rail_node",        nameEn: "Zhabinka",    nameUk: "Жабинка",    nameBe: "Жабінка",    lonlat: [24.005, 52.198], aliases: ["жабінка", "жабинка", "zhabinka"] },
  { id: "rail_luninets",   kind: "rail_node",        nameEn: "Luninets",    nameUk: "Лунинець",   nameBe: "Лунінец",    lonlat: [26.806, 52.250], aliases: ["лунінец", "лунинец", "лунінца", "luninets"] },
  { id: "rail_kalinkavichy", kind: "rail_node",      nameEn: "Kalinkavichy", nameUk: "Калинковичі", nameBe: "Калінкавічы", lonlat: [29.328, 52.130], aliases: ["калінкавічы", "калинковичи", "kalinkavichy"] },
  { id: "rail_mazyr",      kind: "rail_node",        nameEn: "Mazyr",       nameUk: "Мозир",      nameBe: "Мазыр",      lonlat: [29.245, 52.049], aliases: ["мазыр", "мозырь", "mazyr", "mozyr"] },
  { id: "rail_homiel",     kind: "rail_node",        nameEn: "Homiel",      nameUk: "Гомель",     nameBe: "Гомель",     lonlat: [30.987, 52.425], aliases: ["гомель", "homiel", "gomel"] },
  { id: "rail_baranavichy", kind: "rail_node",       nameEn: "Baranavichy", nameUk: "Барановичі", nameBe: "Баранавічы", lonlat: [26.013, 53.133], aliases: ["баранавічы", "барановичи", "baranavichy"] },
  { id: "rail_orsha",      kind: "rail_node",        nameEn: "Orsha",       nameUk: "Орша",       nameBe: "Орша",       lonlat: [30.425, 54.509], aliases: ["орша", "orsha"] },
  // Airbases.
  { id: "air_machulishchy", kind: "airbase",         nameEn: "Machulishchy", nameUk: "Мачулищі",  nameBe: "Мачулішчы",  lonlat: [27.572, 53.749], aliases: ["мачулішчы", "мачулищи", "machulishchy"] },
  { id: "air_baranavichy",  kind: "airbase",         nameEn: "Baranavichy AB", nameUk: "Барановичі (авіабаза)", nameBe: "Баранавічы (авіябаза)", lonlat: [25.985, 53.100], aliases: ["баранавічы аэрадром", "baranavichy airbase"] },
  { id: "air_luninets",     kind: "airbase",         nameEn: "Luninets AB", nameUk: "Лунинець (авіабаза)", nameBe: "Лунінец (авіябаза)", lonlat: [26.690, 52.218], aliases: ["лунінец аэрадром", "luninets airbase"] },
  { id: "air_zyabrauka",    kind: "airbase",         nameEn: "Zyabrauka",   nameUk: "Зябрівка",   nameBe: "Зябраўка",   lonlat: [31.120, 52.328], aliases: ["зябраўка", "зябровка", "zyabrauka"] },
  { id: "air_bobruisk",     kind: "airbase",         nameEn: "Babruysk",    nameUk: "Бобруйськ",  nameBe: "Бабруйск",   lonlat: [29.211, 53.103], aliases: ["бабруйск", "бобруйск", "babruysk"] },
  // Border crossings toward Ukraine.
  { id: "cross_mokrany",    kind: "border_crossing", nameEn: "Mokrany",     nameUk: "Мокрани",    nameBe: "Мокраны",    lonlat: [24.250, 51.575], aliases: ["мокраны", "mokrany"] },
];

const POI_INDEX: Array<{ needle: string; poi: ByPoi }> = BY_GAZETTEER.flatMap((poi) =>
  poi.aliases.map((needle) => ({ needle, poi })),
);

/** POI-extent uncertainty (metres), by kind. Deliberately coarse. */
const KIND_UNCERTAINTY_M: Record<ByPoiKind, number> = {
  rail_node: 5_000,
  airbase: 3_000,
  garrison: 4_000,
  border_crossing: 2_000,
  settlement: 6_000,
};

/** Find the best-matching BY POI referenced in prose, if any. */
export function matchPoi(text: string): ByPoi | undefined {
  const lower = text.toLowerCase();
  // Longest alias first so "baranavichy airbase" beats "baranavichy".
  let best: { poi: ByPoi; len: number } | undefined;
  for (const { needle, poi } of POI_INDEX) {
    if (lower.includes(needle) && (!best || needle.length > best.len)) {
      best = { poi, len: needle.length };
    }
  }
  return best?.poi;
}

/** Built-in, offline BY gazetteer geocoder (demo-safe, no network). */
export class ByGazetteerGeocoder implements Geocoder {
  async geocode(text: string): Promise<GeocodeResult | undefined> {
    const poi = matchPoi(text);
    if (!poi) return undefined;
    return {
      lat: poi.lonlat[1],
      lon: poi.lonlat[0],
      uncertaintyM: KIND_UNCERTAINTY_M[poi.kind],
      poiId: poi.id,
      poiKind: poi.kind,
      resolvedNameEn: poi.nameEn,
      resolvedNameUk: poi.nameUk,
      // Airbase mentions are usually unambiguous; rail nodes slightly less so.
      confidence: poi.kind === "airbase" ? 0.8 : 0.7,
    };
  }
}

/** Default resolver instance. */
export const defaultGeocoder: Geocoder = new ByGazetteerGeocoder();
