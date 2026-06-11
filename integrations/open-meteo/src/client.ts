/**
 * Open-Meteo API client.
 * Docs: https://open-meteo.com/en/docs
 *
 * Free tier, no API key required. 10,000 requests/day.
 * Rate limit: 600 requests/minute.
 */

import type { WeatherPoint, CurrentWeather, HourlyWeather, DailyWeather } from "./types";

const BASE_URL = "https://api.open-meteo.com/v1";

const CURRENT_VARIABLES = [
  "temperature_2m",
  "relative_humidity_2m",
  "wind_speed_10m",
  "wind_direction_10m",
  "wind_gusts_10m",
  "precipitation",
  "weather_code",
  "visibility",
  "cloud_cover",
  "pressure_msl",
].join(",");

const HOURLY_VARIABLES = [
  "temperature_2m",
  "precipitation",
  "wind_speed_10m",
  "wind_direction_10m",
  "visibility",
  "weather_code",
].join(",");

const DAILY_VARIABLES = [
  "temperature_2m_max",
  "temperature_2m_min",
  "precipitation_sum",
  "wind_speed_10m_max",
  "weather_code",
  "precipitation_probability_max",
].join(",");

interface RawResponse {
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  current?: Record<string, number | string>;
  hourly?: Record<string, (number | string)[]>;
  daily?: Record<string, (number | string)[]>;
}

export class OpenMeteoClient {
  private async fetch(params: Record<string, string>): Promise<RawResponse> {
    const url = new URL(`${BASE_URL}/forecast`);
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "AegisLens/1.0" },
    });

    if (!res.ok) {
      throw new Error(`Open-Meteo ${res.status}: ${await res.text()}`);
    }
    return res.json() as Promise<RawResponse>;
  }

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherPoint> {
    const raw = await this.fetch({
      latitude: String(lat),
      longitude: String(lon),
      current: CURRENT_VARIABLES,
      timezone: "UTC",
    });

    return {
      lat: raw.latitude,
      lon: raw.longitude,
      elevation: raw.elevation,
      timezone: raw.timezone,
      current: this.parseCurrent(raw.current ?? {}),
    };
  }

  async getForecast(lat: number, lon: number, days = 7): Promise<WeatherPoint> {
    const raw = await this.fetch({
      latitude: String(lat),
      longitude: String(lon),
      current: CURRENT_VARIABLES,
      hourly: HOURLY_VARIABLES,
      daily: DAILY_VARIABLES,
      forecast_days: String(Math.min(days, 16)),
      timezone: "UTC",
    });

    return {
      lat: raw.latitude,
      lon: raw.longitude,
      elevation: raw.elevation,
      timezone: raw.timezone,
      current: this.parseCurrent(raw.current ?? {}),
      hourly: raw.hourly ? this.parseHourly(raw.hourly) : undefined,
      daily: raw.daily ? this.parseDaily(raw.daily) : undefined,
    };
  }

  private parseCurrent(c: Record<string, number | string>): CurrentWeather {
    return {
      time: String(c["time"] ?? new Date().toISOString()),
      temperature2m: Number(c["temperature_2m"] ?? 0),
      relativeHumidity2m: Number(c["relative_humidity_2m"] ?? 0),
      windSpeed10m: Number(c["wind_speed_10m"] ?? 0),
      windDirection10m: Number(c["wind_direction_10m"] ?? 0),
      windGusts10m: Number(c["wind_gusts_10m"] ?? 0),
      precipitation: Number(c["precipitation"] ?? 0),
      weatherCode: Number(c["weather_code"] ?? 0),
      visibility: Number(c["visibility"] ?? 10000),
      cloudCover: Number(c["cloud_cover"] ?? 0),
      pressureMsl: Number(c["pressure_msl"] ?? 1013),
    };
  }

  private parseHourly(h: Record<string, (number | string)[]>): HourlyWeather {
    return {
      time: (h["time"] ?? []).map(String),
      temperature2m: (h["temperature_2m"] ?? []).map(Number),
      precipitation: (h["precipitation"] ?? []).map(Number),
      windSpeed10m: (h["wind_speed_10m"] ?? []).map(Number),
      windDirection10m: (h["wind_direction_10m"] ?? []).map(Number),
      visibility: (h["visibility"] ?? []).map(Number),
      weatherCode: (h["weather_code"] ?? []).map(Number),
    };
  }

  private parseDaily(d: Record<string, (number | string)[]>): DailyWeather {
    return {
      time: (d["time"] ?? []).map(String),
      temperature2mMax: (d["temperature_2m_max"] ?? []).map(Number),
      temperature2mMin: (d["temperature_2m_min"] ?? []).map(Number),
      precipitationSum: (d["precipitation_sum"] ?? []).map(Number),
      windSpeed10mMax: (d["wind_speed_10m_max"] ?? []).map(Number),
      weatherCode: (d["weather_code"] ?? []).map(Number),
      precipitationProbabilityMax: (d["precipitation_probability_max"] ?? []).map(Number),
    };
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    try {
      await this.getCurrentWeather(50.45, 30.52); // Kyiv
      return { healthy: true };
    } catch (err) {
      return { healthy: false, message: String(err) };
    }
  }
}
