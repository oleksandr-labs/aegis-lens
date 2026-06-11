/**
 * Air quality client — PurpleAir + EEA.
 *
 * PurpleAir: public sensor map API — no auth for public sensors (outdoor only)
 * EEA: European Environment Agency AQI API — open data directive
 *
 * Rate limits:
 * - PurpleAir: 1 req/min recommended for public map API
 * - EEA: No documented rate limit; 1 req/min enforced
 */

import type {
  AirQualityReading,
  AirQualityQueryBbox,
  AirQualityClient,
  AirQualitySource,
} from "./types";

const PURPLEAIR_API_URL = "https://api.purpleair.com/v1/sensors";
const EEA_AQI_URL = "https://aqicn.org/data-platform/covid19/report/32706/"; // EEA feed via WAQI

/** Ukraine bounding box */
const UKRAINE_BBOX: AirQualityQueryBbox = {
  nwlng: 22.0,
  nwlat: 52.5,
  selng: 40.0,
  selat: 44.0,
};

const REQUEST_INTERVAL_MS = 60_000; // 1 req/min

/** US EPA AQI breakpoints for PM2.5 (µg/m³) */
function pm25ToAqi(pm: number): { aqi: number; category: AirQualityReading["aqi_category"] } {
  if (pm <= 12.0) return { aqi: Math.round((50 / 12.0) * pm), category: "good" };
  if (pm <= 35.4) return { aqi: Math.round(51 + ((100 - 51) / (35.4 - 12.1)) * (pm - 12.1)), category: "moderate" };
  if (pm <= 55.4) return { aqi: Math.round(101 + ((150 - 101) / (55.4 - 35.5)) * (pm - 35.5)), category: "unhealthy_sensitive" };
  if (pm <= 150.4) return { aqi: Math.round(151 + ((200 - 151) / (150.4 - 55.5)) * (pm - 55.5)), category: "unhealthy" };
  if (pm <= 250.4) return { aqi: Math.round(201 + ((300 - 201) / (250.4 - 150.5)) * (pm - 150.5)), category: "very_unhealthy" };
  return { aqi: Math.min(500, Math.round(301 + ((500 - 301) / (500.4 - 250.5)) * (pm - 250.5))), category: "hazardous" };
}

export class AirQualityApiClient implements AirQualityClient {
  private lastPurpleAirRequest = 0;
  private lastEeaRequest = 0;

  constructor(
    private readonly purpleAirReadKey?: string,
    private readonly eeaApiKey?: string,
  ) {}

  async fetchPurpleAir(bbox: AirQualityQueryBbox = UKRAINE_BBOX): Promise<AirQualityReading[]> {
    const elapsed = Date.now() - this.lastPurpleAirRequest;
    if (elapsed < REQUEST_INTERVAL_MS) {
      await new Promise<void>((r) => setTimeout(r, REQUEST_INTERVAL_MS - elapsed));
    }

    const url = new URL(PURPLEAIR_API_URL);
    url.searchParams.set("fields", "name,latitude,longitude,pm2.5,pm2.5_cf_1,pm10.0,ozone1,humidity,temperature");
    url.searchParams.set("location_type", "0"); // outdoor only
    url.searchParams.set("nwlng", String(bbox.nwlng));
    url.searchParams.set("nwlat", String(bbox.nwlat));
    url.searchParams.set("selng", String(bbox.selng));
    url.searchParams.set("selat", String(bbox.selat));
    url.searchParams.set("max_age", "3600"); // sensors updated within last hour

    const headers: Record<string, string> = { "User-Agent": "AegisLens/1.0" };
    if (this.purpleAirReadKey) {
      headers["X-API-Key"] = this.purpleAirReadKey;
    }

    const res = await fetch(url.toString(), { headers });
    this.lastPurpleAirRequest = Date.now();

    if (!res.ok) {
      throw new Error(`PurpleAir API ${res.status}: ${await res.text()}`);
    }

    const json = (await res.json()) as {
      fields: string[];
      data: Array<Array<string | number | null>>;
    };

    const fieldIdx: Record<string, number> = {};
    json.fields.forEach((f, i) => (fieldIdx[f] = i));

    return (json.data ?? []).map((row): AirQualityReading => {
      const get = (f: string): string | number | null => row[fieldIdx[f] ?? -1] ?? null;
      const pm25 = Number(get("pm2.5") ?? get("pm2.5_cf_1")) || undefined;
      const { aqi, category } = pm25 ? pm25ToAqi(pm25) : { aqi: undefined, category: undefined };

      return {
        sensor_id: `purpleair:${String(get("sensor_index") ?? row[0])}`,
        source: "purpleair",
        sensor_name: String(get("name") ?? ""),
        latitude: Number(get("latitude")),
        longitude: Number(get("longitude")),
        measured_at: new Date().toISOString(),
        pm25,
        pm10: Number(get("pm10.0")) || undefined,
        o3: Number(get("ozone1")) || undefined,
        temperature: Number(get("temperature")) || undefined,
        humidity: Number(get("humidity")) || undefined,
        aqi,
        aqi_category: category,
      };
    }).filter((r) => r.latitude && r.longitude);
  }

  async fetchEea(countryCode = "UA"): Promise<AirQualityReading[]> {
    const elapsed = Date.now() - this.lastEeaRequest;
    if (elapsed < REQUEST_INTERVAL_MS) {
      await new Promise<void>((r) => setTimeout(r, REQUEST_INTERVAL_MS - elapsed));
    }

    // EEA AQI via World Air Quality Index (WAQI) data feed
    const url = new URL("https://api.waqi.info/v2/map/bounds");
    url.searchParams.set("latlng", "44.0,22.0,52.5,40.0"); // Ukraine bbox
    url.searchParams.set("networks", "all");
    if (this.eeaApiKey) {
      url.searchParams.set("token", this.eeaApiKey);
    }

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "AegisLens/1.0" },
    });
    this.lastEeaRequest = Date.now();

    if (!res.ok) {
      throw new Error(`EEA/WAQI API ${res.status}: ${await res.text()}`);
    }

    const json = (await res.json()) as {
      status: string;
      data: Array<{
        uid: number;
        aqi: string;
        lat: number;
        lon: number;
        station: { name: string; time: string };
      }>;
    };

    if (json.status !== "ok") {
      throw new Error(`EEA/WAQI API error: ${json.status}`);
    }

    return (json.data ?? []).map((s): AirQualityReading => {
      const aqiNum = parseInt(s.aqi, 10) || undefined;
      let category: AirQualityReading["aqi_category"] | undefined;
      if (aqiNum !== undefined) {
        if (aqiNum <= 50) category = "good";
        else if (aqiNum <= 100) category = "moderate";
        else if (aqiNum <= 150) category = "unhealthy_sensitive";
        else if (aqiNum <= 200) category = "unhealthy";
        else if (aqiNum <= 300) category = "very_unhealthy";
        else category = "hazardous";
      }

      return {
        sensor_id: `eea:${s.uid}`,
        source: "eea",
        sensor_name: s.station.name,
        latitude: s.lat,
        longitude: s.lon,
        measured_at: s.station.time || new Date().toISOString(),
        aqi: aqiNum,
        aqi_category: category,
        country_code: countryCode,
      };
    });
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    try {
      const readings = await this.fetchPurpleAir();
      return {
        healthy: true,
        message: `${readings.length} PurpleAir sensors found in Ukraine bbox`,
      };
    } catch (err) {
      return { healthy: false, message: String(err) };
    }
  }
}
