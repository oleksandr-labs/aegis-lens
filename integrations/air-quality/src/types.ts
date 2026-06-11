/**
 * Air quality integration types — PurpleAir + EEA.
 * Pollutants: PM2.5, PM10, O3 (ozone), NO2 (nitrogen dioxide).
 */

export type AirQualitySource = "purpleair" | "eea";

export interface AirQualityReading {
  /** Sensor / station ID */
  sensor_id: string;
  /** Source platform */
  source: AirQualitySource;
  /** Sensor name (public) */
  sensor_name: string;
  /** Latitude */
  latitude: number;
  /** Longitude */
  longitude: number;
  /** Measurement timestamp ISO-8601 */
  measured_at: string;
  /** PM2.5 concentration (µg/m³) */
  pm25?: number;
  /** PM10 concentration (µg/m³) */
  pm10?: number;
  /** Ozone concentration (µg/m³) */
  o3?: number;
  /** Nitrogen dioxide concentration (µg/m³) */
  no2?: number;
  /** AQI value (US EPA scale, 0–500) */
  aqi?: number;
  /** AQI category */
  aqi_category?: "good" | "moderate" | "unhealthy_sensitive" | "unhealthy" | "very_unhealthy" | "hazardous";
  /** Temperature (°C) — if reported */
  temperature?: number;
  /** Humidity (%) — if reported */
  humidity?: number;
  /** Country code (ISO 3166-1 alpha-2) */
  country_code?: string;
}

export interface AirQualityQueryBbox {
  /** West longitude */
  nwlng: number;
  /** South latitude */
  selat: number;
  /** East longitude */
  selng: number;
  /** North latitude */
  nwlat: number;
}

export interface AirQualityClient {
  fetchPurpleAir(bbox: AirQualityQueryBbox): Promise<AirQualityReading[]>;
  fetchEea(countryCode?: string): Promise<AirQualityReading[]>;
  healthCheck(): Promise<{ healthy: boolean; message?: string }>;
}
