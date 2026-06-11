/**
 * MODIS NRT + VIIRS I-Band 375m extended types.
 * Extends the base NASA FIRMS integration (@ua-map/integration-nasa-firms).
 *
 * MODIS: 1km resolution, ~3hr latency
 * VIIRS I-Band: 375m resolution, ~3hr latency — higher spatial precision
 *
 * Docs: https://firms.modaps.eosdis.nasa.gov/api/
 */

/** MODIS NRT (Near Real-Time) active fire record */
export interface ModisNrtRecord {
  /** Latitude of fire pixel centroid */
  latitude: number;
  /** Longitude of fire pixel centroid */
  longitude: number;
  /** Brightness temperature Channel 21/22 (Kelvin) */
  brightness: number;
  /** Scan size (km) along-scan */
  scan: number;
  /** Track size (km) along-track */
  track: number;
  /** Acquisition date YYYY-MM-DD */
  acq_date: string;
  /** Acquisition time HHMM UTC */
  acq_time: string;
  /** Satellite (Terra or Aqua) */
  satellite: "Terra" | "Aqua";
  /** Instrument (MODIS) */
  instrument: "MODIS";
  /** Confidence: 0–100 */
  confidence: number;
  /** Version of MODIS processing */
  version: string;
  /** Brightness temperature Channel 31 (Kelvin) */
  bright_t31: number;
  /** Fire Radiative Power (MW) */
  frp: number;
  /** Day or Night */
  daynight: "D" | "N";
  /** Acquisition timestamp ISO-8601 */
  acquired_at: string;
}

/** VIIRS I-Band 375m NRT active fire record */
export interface ViirsNrtRecord {
  /** Latitude of fire pixel centroid */
  latitude: number;
  /** Longitude of fire pixel centroid */
  longitude: number;
  /** Brightness temperature I-4 channel (Kelvin) */
  bright_ti4: number;
  /** Scan size (km) along-scan */
  scan: number;
  /** Track size (km) along-track */
  track: number;
  /** Acquisition date YYYY-MM-DD */
  acq_date: string;
  /** Acquisition time HHMM UTC */
  acq_time: string;
  /** Satellite (NOAA-20, NOAA-21, NPP) */
  satellite: string;
  /** Instrument (VIIRS) */
  instrument: "VIIRS";
  /** Confidence: nominal | low | high */
  confidence: "nominal" | "low" | "high";
  /** Version */
  version: string;
  /** Brightness temperature I-5 channel (Kelvin) */
  bright_ti5: number;
  /** Fire Radiative Power (MW) */
  frp: number;
  /** Day or Night */
  daynight: "D" | "N";
  /** Acquisition timestamp ISO-8601 */
  acquired_at: string;
}

export type NrtSource = "MODIS_NRT" | "VIIRS_NOAA20_NRT" | "VIIRS_NOAA21_NRT" | "VIIRS_SNPP_NRT";

export interface NasaFirmsExtendedConfig {
  apiKey: string;
  /** Bounding box "west,south,east,north" — defaults to Ukraine */
  area?: string;
  /** Days to fetch (1–10) */
  dayRange?: number;
  /** Which sources to poll */
  sources?: NrtSource[];
}
