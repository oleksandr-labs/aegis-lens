/**
 * Air quality adapter.
 * Normalizes PM2.5, PM10, O3, NO2 readings to AegisEvent type 'air-quality'.
 * Only yields elevated/unhealthy readings — normal air quality is not surfaced.
 */

import type { SourceAdapter, RawPayload, NormaliseResult } from "../../ingest/src/adapter";
import { AirQualityApiClient } from "./client";
import type { AirQualityReading } from "./types";

const UNHEALTHY_CATEGORIES = new Set([
  "unhealthy_sensitive",
  "unhealthy",
  "very_unhealthy",
  "hazardous",
]);

function inferSeverityFromAqi(aqi?: number, category?: AirQualityReading["aqi_category"]): 0 | 1 | 2 | 3 {
  if (category === "hazardous" || (aqi !== undefined && aqi > 300)) return 3;
  if (category === "very_unhealthy" || (aqi !== undefined && aqi > 200)) return 3;
  if (category === "unhealthy" || (aqi !== undefined && aqi > 150)) return 2;
  if (category === "unhealthy_sensitive" || (aqi !== undefined && aqi > 100)) return 1;
  return 0;
}

function buildSummary(r: AirQualityReading): string {
  const parts: string[] = [`Air quality at ${r.sensor_name}`];
  if (r.aqi !== undefined) parts.push(`AQI=${r.aqi}`);
  if (r.pm25 !== undefined) parts.push(`PM2.5=${r.pm25.toFixed(1)}µg/m³`);
  if (r.pm10 !== undefined) parts.push(`PM10=${r.pm10.toFixed(1)}µg/m³`);
  if (r.o3 !== undefined) parts.push(`O3=${r.o3.toFixed(1)}µg/m³`);
  if (r.no2 !== undefined) parts.push(`NO2=${r.no2.toFixed(1)}µg/m³`);
  return parts.join(", ");
}

const UKRAINE_BBOX = { nwlng: 22.0, nwlat: 52.5, selng: 40.0, selat: 44.0 };

export class AirQualityAdapter implements SourceAdapter {
  constructor(private readonly client: AirQualityApiClient) {}

  async *fetchSince(_since: Date): AsyncGenerator<RawPayload> {
    // PurpleAir
    try {
      const readings = await this.client.fetchPurpleAir(UKRAINE_BBOX);
      for (const r of readings) {
        if (!UNHEALTHY_CATEGORIES.has(r.aqi_category ?? "")) continue;
        yield {
          source_id: "purpleair",
          external_id: r.sensor_id,
          collected_at: new Date().toISOString(),
          raw: r,
        };
      }
    } catch {
      // Fail-soft
    }

    // EEA
    try {
      const readings = await this.client.fetchEea("UA");
      for (const r of readings) {
        if (!UNHEALTHY_CATEGORIES.has(r.aqi_category ?? "")) continue;
        yield {
          source_id: "eea",
          external_id: r.sensor_id,
          collected_at: new Date().toISOString(),
          raw: r,
        };
      }
    } catch {
      // Fail-soft
    }
  }

  normalise(payload: RawPayload): NormaliseResult {
    const r = payload.raw as AirQualityReading;
    const summaryEn = buildSummary(r);

    return {
      event: {
        eventId: `air-quality:${r.sensor_id}:${r.measured_at}`,
        class: "environmental",
        subclass: "air-quality",
        severity: inferSeverityFromAqi(r.aqi, r.aqi_category),
        summary: { en: summaryEn, uk: null },
        location: {
          lat: r.latitude,
          lon: r.longitude,
          precisionM: r.source === "purpleair" ? 100 : 1_000,
        },
        occurredAt: r.measured_at,
        reportedAt: new Date().toISOString(),
        sources: [
          {
            url:
              r.source === "purpleair"
                ? "https://www.purpleair.com/map"
                : "https://www.eea.europa.eu/themes/air",
            archiveUrl: null,
            fetchedAt: new Date().toISOString(),
            language: "en",
            contentHash: payload.external_id,
          },
        ],
        media: [],
        originalText: summaryEn,
      },
      sourceWeight: r.source === "eea" ? 0.88 : 0.75,
      language: "en",
    };
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    return this.client.healthCheck();
  }
}
