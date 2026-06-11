import { OBLASTS, type OblastSeed } from "@/lib/oblasts-seed";
import { COUNTRY_BBOX } from "@/lib/events-seed";

/**
 * Find the smallest oblast whose bbox contains the given [lon, lat].
 * Returns null if no oblast matches.
 *
 * Used by /incidents and /reports to surface region badges + cross-links
 * without round-tripping to a real geocoder.
 */
export function findOblast(lon: number, lat: number): OblastSeed | null {
  let best: OblastSeed | null = null;
  let bestArea = Infinity;
  for (const o of OBLASTS) {
    const [minLon, minLat, maxLon, maxLat] = o.bbox;
    if (lon < minLon || lon > maxLon || lat < minLat || lat > maxLat) continue;
    const area = (maxLon - minLon) * (maxLat - minLat);
    if (area < bestArea) {
      bestArea = area;
      best = o;
    }
  }
  return best;
}

/** ISO-2 country lookup by point (UA/PL/DE). */
export function findCountryIso2(lon: number, lat: number): string | null {
  for (const [iso2, bbox] of Object.entries(COUNTRY_BBOX)) {
    const [minLon, minLat, maxLon, maxLat] = bbox;
    if (lon >= minLon && lon <= maxLon && lat >= minLat && lat <= maxLat) {
      return iso2;
    }
  }
  return null;
}
