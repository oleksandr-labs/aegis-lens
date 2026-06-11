/**
 * NASA FIRMS (Fire Information for Resource Management System) integration.
 * Data source: MODIS + VIIRS NRT (Near Real-Time) active fire data.
 * Latency: ~3 hours after satellite overpass.
 *
 * API docs: https://firms.modaps.eosdis.nasa.gov/api/
 */

export interface FIRMSConfig {
  apiKey: string;
  /** MODIS or VIIRS_SNPP or VIIRS_NOAA20 */
  source?: FIRMSSource;
  /** Days to fetch (1–10). Default: 1 */
  dayRange?: number;
  /** Bounding box: "west,south,east,north" */
  area?: string;
}

export type FIRMSSource = "MODIS_NRT" | "VIIRS_SNPP_NRT" | "VIIRS_NOAA20_NRT";

export interface FIRMSFirePoint {
  latitude: number;
  longitude: number;
  /** Brightness temperature (MODIS) or brightness (VIIRS), Kelvin */
  brightness: number;
  /** Acquisition date, YYYY-MM-DD */
  acq_date: string;
  /** Acquisition time, HHMM UTC */
  acq_time: string;
  /** FIRMS confidence: nominal = high, l = low, h = high, n = nominal */
  confidence: string;
  /** Estimated fire radiative power (MW) */
  frp: number;
  /** Day (D) or Night (N) */
  daynight: "D" | "N";
  /** Satellite */
  satellite: string;
  instrument: string;
}

export interface FIRMSFirePointNormalized {
  latitude: number;
  longitude: number;
  brightness_k: number;
  acquired_at: string; // ISO-8601
  /** 0-1 */
  confidence: number;
  frp_mw: number;
  is_day: boolean;
  satellite: string;
  instrument: string;
  source: FIRMSSource;
}

const BASE_URL = "https://firms.modaps.eosdis.nasa.gov/api/area/csv";

const CONFIDENCE_MAP: Record<string, number> = {
  h: 0.9,
  n: 0.7,
  l: 0.4,
  "100": 0.95,
  "90": 0.85,
  "80": 0.75,
  "60": 0.6,
  "40": 0.4,
};

function normalizeConfidence(raw: string): number {
  return CONFIDENCE_MAP[raw.toLowerCase()] ?? 0.5;
}

function parseAcquisitionDate(date: string, time: string): string {
  const hh = time.slice(0, 2).padStart(2, "0");
  const mm = time.slice(2, 4).padStart(2, "0");
  return `${date}T${hh}:${mm}:00Z`;
}

function parseCSV(csv: string): FIRMSFirePoint[] {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const vals = line.split(",");
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h] = vals[i]?.trim() ?? ""));
    return {
      latitude: parseFloat(obj.latitude),
      longitude: parseFloat(obj.longitude),
      brightness: parseFloat(obj.brightness ?? obj.bright_ti4 ?? "0"),
      acq_date: obj.acq_date,
      acq_time: obj.acq_time,
      confidence: obj.confidence,
      frp: parseFloat(obj.frp ?? "0"),
      daynight: (obj.daynight as "D" | "N") ?? "D",
      satellite: obj.satellite ?? "",
      instrument: obj.instrument ?? "",
    };
  });
}

export class FIRMSClient {
  private readonly source: FIRMSSource;
  private readonly dayRange: number;
  private readonly area: string;

  constructor(private readonly config: FIRMSConfig) {
    this.source = config.source ?? "VIIRS_SNPP_NRT";
    this.dayRange = config.dayRange ?? 1;
    // Default: Ukraine bounding box
    this.area = config.area ?? "22.0,44.0,40.0,52.5";
  }

  async fetchActive(): Promise<FIRMSFirePointNormalized[]> {
    const url = `${BASE_URL}/${this.config.apiKey}/${this.source}/${this.area}/${this.dayRange}`;
    const res = await fetch(url, {
      headers: { Accept: "text/csv" },
    });

    if (!res.ok) {
      throw new Error(`FIRMS API error ${res.status}: ${await res.text()}`);
    }

    const csv = await res.text();
    const raw = parseCSV(csv);

    return raw.map((r): FIRMSFirePointNormalized => ({
      latitude: r.latitude,
      longitude: r.longitude,
      brightness_k: r.brightness,
      acquired_at: parseAcquisitionDate(r.acq_date, r.acq_time),
      confidence: normalizeConfidence(r.confidence),
      frp_mw: r.frp,
      is_day: r.daynight === "D",
      satellite: r.satellite,
      instrument: r.instrument,
      source: this.source,
    }));
  }

  /**
   * Filter out likely industrial / false positives by checking against a
   * known industrial site bounding boxes list.
   * In production, replace with a proper geospatial database query.
   */
  filterFalsePositives(
    points: FIRMSFirePointNormalized[],
    industrialBBoxes: Array<[number, number, number, number]> = [],
  ): FIRMSFirePointNormalized[] {
    return points.filter((p) => {
      for (const [west, south, east, north] of industrialBBoxes) {
        if (p.longitude >= west && p.longitude <= east && p.latitude >= south && p.latitude <= north) {
          return false;
        }
      }
      return true;
    });
  }
}
