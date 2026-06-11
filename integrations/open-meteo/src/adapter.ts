/**
 * Open-Meteo weather adapter.
 *
 * Polls all Ukraine monitoring points and yields severe-weather events.
 * Normal weather conditions are not yielded — only actionable signals.
 */

import type { SourceAdapter, RawPayload, NormaliseResult } from "../../ingest/src/adapter";
import { OpenMeteoClient } from "./client";
import { UKRAINE_MONITORING_POINTS, WMO_CODES } from "./types";
import type { WeatherPoint } from "./types";

/** WMO codes that represent operationally significant weather */
const SEVERE_CODES = new Set([45, 48, 55, 65, 75, 82, 95, 96, 99]);
const HIGH_WIND_KMH = 50;
const LOW_VISIBILITY_M = 1000;

function isSevere(point: WeatherPoint): boolean {
  const c = point.current;
  return (
    SEVERE_CODES.has(c.weatherCode) ||
    c.windSpeed10m > HIGH_WIND_KMH ||
    c.windGusts10m > HIGH_WIND_KMH * 1.3 ||
    c.visibility < LOW_VISIBILITY_M
  );
}

function inferSeverity(point: WeatherPoint): 0 | 1 | 2 | 3 {
  const c = point.current;
  if (c.weatherCode >= 95) return 3; // thunderstorm + hail
  if (c.windGusts10m > 80 || c.weatherCode === 82) return 3;
  if (c.windSpeed10m > 60 || c.weatherCode >= 75) return 2;
  return 1;
}

export class OpenMeteoAdapter implements SourceAdapter {
  /** Location name → ISO timestamp of last yielded event */
  private readonly cursors = new Map<string, string>();

  constructor(private readonly client: OpenMeteoClient) {}

  async *fetchSince(since: Date): AsyncGenerator<RawPayload> {
    for (const point of UKRAINE_MONITORING_POINTS) {
      try {
        const weather = await this.client.getCurrentWeather(point.lat, point.lon);

        if (!isSevere(weather)) continue;

        const lastYielded = this.cursors.get(point.name);
        if (lastYielded) {
          // Debounce: don't re-yield same storm within 1 hour
          const elapsed = Date.now() - new Date(lastYielded).getTime();
          if (elapsed < 3_600_000) continue;
        }

        const externalId = `${point.name}:${weather.current.time}`;
        this.cursors.set(point.name, new Date().toISOString());

        yield {
          source_id: "open-meteo",
          external_id: externalId,
          collected_at: new Date().toISOString(),
          raw: { point, weather },
        };
      } catch {
        // Skip on error
      }
    }
  }

  normalise(payload: RawPayload): NormaliseResult {
    const { point, weather } = payload.raw as {
      point: (typeof UKRAINE_MONITORING_POINTS)[0];
      weather: WeatherPoint;
    };

    const c = weather.current;
    const conditionEn = WMO_CODES[c.weatherCode] ?? "unknown";
    const summaryEn = `Severe weather in ${point.name}: ${conditionEn.replace(/_/g, " ")}, wind ${c.windSpeed10m} km/h, gusts ${c.windGusts10m} km/h`;

    return {
      event: {
        eventId: `weather:${payload.external_id}`,
        class: "environmental",
        subclass: "severe_weather",
        severity: inferSeverity(weather),
        summary: { en: summaryEn, uk: null },
        location: {
          lat: point.lat,
          lon: point.lon,
          precisionM: 5000,
        },
        occurredAt: c.time,
        reportedAt: new Date().toISOString(),
        sources: [
          {
            url: "https://open-meteo.com",
            archiveUrl: null,
            fetchedAt: new Date().toISOString(),
            language: "en",
            contentHash: payload.external_id,
          },
        ],
        media: [],
        originalText: summaryEn,
      },
      sourceWeight: 0.9,
      language: "en",
    };
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    return this.client.healthCheck();
  }
}
