import type { GeoResult, LatLng } from "./types";

export interface GeocoderOptions {
  nominatimBaseUrl: string;
  mapboxToken?: string;
  /** Cache TTL in seconds. Default: 86400 (1 day). */
  cacheTtlSeconds?: number;
  /** Bias searches toward this bounding box (UA by default). */
  countryCode?: string;
}

export interface GeoCache {
  get(key: string): Promise<GeoResult | undefined>;
  set(key: string, value: GeoResult, ttlSeconds: number): Promise<void>;
}

/**
 * Forward geocoder: text → coordinates.
 * Primary: self-hosted Nominatim.
 * Fallback: Mapbox Geocoding API.
 */
export class Geocoder {
  private readonly cacheTtl: number;

  constructor(
    private readonly opts: GeocoderOptions,
    private readonly cache?: GeoCache,
  ) {
    this.cacheTtl = opts.cacheTtlSeconds ?? 86_400;
  }

  async geocode(query: string, contextRegion?: string): Promise<GeoResult | null> {
    const cacheKey = `fwd:${contextRegion ?? ""}:${query}`;

    if (this.cache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) return cached;
    }

    const result =
      (await this.nominatim(query, contextRegion)) ??
      (this.opts.mapboxToken ? await this.mapbox(query, contextRegion) : null);

    if (result && this.cache) {
      await this.cache.set(cacheKey, result, this.cacheTtl);
    }

    return result;
  }

  private async nominatim(query: string, region?: string): Promise<GeoResult | null> {
    const params = new URLSearchParams({
      q: query,
      format: "jsonv2",
      limit: "1",
      addressdetails: "1",
      "accept-language": "uk,en",
    });
    if (region) params.set("countrycodes", region.toLowerCase());

    const url = `${this.opts.nominatimBaseUrl}/search?${params}`;
    const res = await fetch(url, { headers: { "User-Agent": "ua-map-platform/1.0" } });
    if (!res.ok) return null;

    const data = await res.json() as NominatimResult[];
    if (!data.length) return null;

    const r = data[0];
    return {
      point: { lat: parseFloat(r.lat), lng: parseFloat(r.lon) },
      precision_m: this.osm_type_precision(r.osm_type),
      method: "nominatim",
      admin: [],
      display_name: { en: r.display_name },
      confidence: parseFloat(r.importance ?? "0.5"),
    };
  }

  private async mapbox(query: string, region?: string): Promise<GeoResult | null> {
    const params = new URLSearchParams({
      access_token: this.opts.mapboxToken!,
      limit: "1",
      language: "uk,en",
    });
    if (region) params.set("country", region.toLowerCase());

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json() as MapboxResponse;
    const feature = data.features?.[0];
    if (!feature) return null;

    return {
      point: { lng: feature.center[0], lat: feature.center[1] },
      precision_m: 1000,
      method: "mapbox",
      admin: [],
      display_name: { en: feature.place_name },
      confidence: feature.relevance,
    };
  }

  private osm_type_precision(type: string): number {
    if (type === "node") return 100;
    if (type === "way") return 500;
    return 2000;
  }
}

// ── Nominatim response types ─────────────────────────────────────────────────
interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  osm_type: string;
  importance?: string;
}

interface MapboxResponse {
  features: Array<{
    center: [number, number];
    place_name: string;
    relevance: number;
  }>;
}
