/**
 * Geocoding of DSNS free-text locations.
 *
 * DSNS reports name places in Ukrainian prose, e.g.
 *   "Одеська область, м. Чорноморськ" or "Сумська область, Шосткинський район".
 * This module extracts the place reference and resolves it to coordinates via a
 * pluggable Geocoder interface. A small built-in gazetteer (oblast centres +
 * a stub of major cities) covers the demo path with NO external calls; a
 * production deployment plugs in a real gazetteer / Nominatim adapter that
 * honours OSM usage policy (cache + rate limit).
 *
 * Output coordinates carry an honest uncertaintyM: settlement-level matches are
 * precise-ish (~3 km), oblast-only fallbacks are coarse (~80 km).
 */

import type { OblastCode } from "./types";
import { OBLASTS } from "./oblast-branches";

export interface GeocodeResult {
  lat: number;
  lon: number;
  /** 1-sigma uncertainty radius in metres. */
  uncertaintyM: number;
  /** Resolved place label (uk), for display / audit. */
  resolvedNameUk: string;
  oblast?: OblastCode;
  /** "settlement" | "raion" | "oblast" — granularity actually resolved. */
  granularity: "settlement" | "raion" | "oblast";
  /** 0–1: how confident the resolver is. */
  confidence: number;
}

/** Pluggable resolver. The demo uses GazetteerGeocoder; prod can swap in. */
export interface Geocoder {
  geocode(text: string, hintOblast?: OblastCode): Promise<GeocodeResult | undefined>;
}

// ── Oblast name → code lookup (matches prose like "Одеська область") ──────────

const OBLAST_NAME_INDEX: Array<{ needle: string; code: OblastCode }> = Object.values(OBLASTS).map(
  (o) => ({ needle: o.nameUk.toLowerCase(), code: o.code }),
);

/** Major-city stub gazetteer: lowercased uk name → [lon, lat]. */
const CITY_GAZETTEER: Record<string, { lonlat: [number, number]; oblast: OblastCode }> = {
  "київ":         { lonlat: [30.523, 50.450], oblast: "UA-30" },
  "харків":       { lonlat: [36.232, 49.994], oblast: "UA-63" },
  "одеса":        { lonlat: [30.733, 46.484], oblast: "UA-51" },
  "чорноморськ":  { lonlat: [30.654, 46.301], oblast: "UA-51" },
  "дніпро":       { lonlat: [35.045, 48.464], oblast: "UA-12" },
  "запоріжжя":    { lonlat: [35.139, 47.838], oblast: "UA-23" },
  "львів":        { lonlat: [24.032, 49.840], oblast: "UA-46" },
  "миколаїв":     { lonlat: [31.995, 46.975], oblast: "UA-48" },
  "херсон":       { lonlat: [32.617, 46.635], oblast: "UA-65" },
  "суми":         { lonlat: [34.799, 50.907], oblast: "UA-59" },
  "шостка":       { lonlat: [33.479, 51.866], oblast: "UA-59" },
  "полтава":      { lonlat: [34.551, 49.589], oblast: "UA-53" },
  "чернігів":     { lonlat: [31.289, 51.494], oblast: "UA-74" },
  "вінниця":      { lonlat: [28.468, 49.233], oblast: "UA-05" },
};

/** Find which oblast a free-text report references. */
export function detectOblast(text: string): OblastCode | undefined {
  const lower = text.toLowerCase();
  for (const { needle, code } of OBLAST_NAME_INDEX) {
    if (lower.includes(needle)) return code;
  }
  return undefined;
}

/**
 * Pull a settlement token from prose. Recognises "м. X", "с. X", "смт X",
 * "місто X", and bare gazetteer city names.
 */
export function extractPlaceName(text: string): string | undefined {
  const m = /\b(?:м\.|с\.|смт|селище|місто|село)\s*([А-ЯІЇЄҐа-яіїєґ'’\-]+)/u.exec(text);
  if (m) return m[1];
  const lower = text.toLowerCase();
  for (const city of Object.keys(CITY_GAZETTEER)) {
    if (lower.includes(city)) return city;
  }
  return undefined;
}

/** Built-in, offline gazetteer geocoder (demo-safe, no network). */
export class GazetteerGeocoder implements Geocoder {
  async geocode(text: string, hintOblast?: OblastCode): Promise<GeocodeResult | undefined> {
    const place = extractPlaceName(text);
    if (place) {
      const hit = CITY_GAZETTEER[place.toLowerCase()];
      if (hit) {
        return {
          lat: hit.lonlat[1],
          lon: hit.lonlat[0],
          uncertaintyM: 3_000,
          resolvedNameUk: place,
          oblast: hit.oblast,
          granularity: "settlement",
          confidence: 0.8,
        };
      }
    }

    // Fallback: oblast centre.
    const oblast = hintOblast ?? detectOblast(text);
    if (oblast) {
      const info = OBLASTS[oblast];
      return {
        lat: info.center[1],
        lon: info.center[0],
        uncertaintyM: 80_000,
        resolvedNameUk: info.nameUk,
        oblast,
        granularity: "oblast",
        confidence: 0.4,
      };
    }
    return undefined;
  }
}

/** Default resolver instance. */
export const defaultGeocoder: Geocoder = new GazetteerGeocoder();
