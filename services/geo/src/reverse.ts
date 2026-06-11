import type { ReverseResult, AdminRegion, LatLng } from "./types";

export interface ReverseGeocoderOptions {
  nominatimBaseUrl: string;
}

export interface GeoCache {
  get(key: string): Promise<ReverseResult | undefined>;
  set(key: string, value: ReverseResult, ttlSeconds: number): Promise<void>;
}

/**
 * Reverse geocoder: coordinates → admin hierarchy.
 * Returns oblast (admin level 4 in UA), rayon (6), hromada (7), settlement.
 */
export class ReverseGeocoder {
  constructor(
    private readonly opts: ReverseGeocoderOptions,
    private readonly cache?: GeoCache,
  ) {}

  async reverse(point: LatLng): Promise<ReverseResult | null> {
    const cacheKey = `rev:${point.lat.toFixed(4)}:${point.lng.toFixed(4)}`;
    if (this.cache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) return cached;
    }

    const params = new URLSearchParams({
      lat: String(point.lat),
      lon: String(point.lng),
      format: "jsonv2",
      zoom: "14",
      addressdetails: "1",
      "accept-language": "uk,en",
    });

    const res = await fetch(`${this.opts.nominatimBaseUrl}/reverse?${params}`, {
      headers: { "User-Agent": "ua-map-platform/1.0" },
    });
    if (!res.ok) return null;

    const data = await res.json() as NominatimReverseResult;
    if (!data?.address) return null;

    const admin = this.extractAdmin(data.address);
    const result: ReverseResult = {
      admin,
      display_name: { en: data.display_name ?? "", uk: data.display_name ?? "" },
      distance_m: 0,
    };

    if (this.cache) await this.cache.set(cacheKey, result, 86_400);
    return result;
  }

  private extractAdmin(address: Record<string, string>): AdminRegion[] {
    const regions: AdminRegion[] = [];

    // Ukraine country level
    if (address.country_code === "ua") {
      regions.push({ level: 0, code: "UA", name: { en: "Ukraine", uk: "Україна" } });
    }

    // Oblast (state)
    if (address.state) {
      regions.push({
        level: 1,
        code: address.state ?? "",
        name: { en: address.state, uk: address.state },
      });
    }

    // County / rayon
    if (address.county) {
      regions.push({
        level: 2,
        code: address.county,
        name: { en: address.county, uk: address.county },
      });
    }

    // Municipality / hromada
    if (address.municipality) {
      regions.push({
        level: 3,
        code: address.municipality,
        name: { en: address.municipality, uk: address.municipality },
      });
    }

    // Settlement
    const settlement = address.city ?? address.town ?? address.village ?? address.hamlet;
    if (settlement) {
      regions.push({
        level: 4,
        code: settlement,
        name: { en: settlement, uk: settlement },
      });
    }

    return regions;
  }
}

interface NominatimReverseResult {
  display_name?: string;
  address?: Record<string, string>;
}
