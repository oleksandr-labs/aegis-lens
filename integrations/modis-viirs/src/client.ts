/**
 * NASA FIRMS Extended Client — MODIS NRT + VIIRS I-Band 375m.
 *
 * Extends the base @ua-map/integration-nasa-firms FIRMSClient pattern.
 * MODIS: Terra + Aqua satellites, 1km pixels
 * VIIRS: NOAA-20/21 and Suomi-NPP, 375m pixels
 *
 * API docs: https://firms.modaps.eosdis.nasa.gov/api/
 * Rate limit: none documented; recommended 1 req/min per source
 */

import type {
  ModisNrtRecord,
  ViirsNrtRecord,
  NrtSource,
  NasaFirmsExtendedConfig,
} from "./types";

const BASE_URL = "https://firms.modaps.eosdis.nasa.gov/api/area/csv";
const UKRAINE_BBOX = "22.0,44.0,40.0,52.5";

const VIIRS_CONFIDENCE_MAP: Record<string, ViirsNrtRecord["confidence"]> = {
  n: "nominal",
  l: "low",
  h: "high",
};

function parseAcqDateTime(date: string, time: string): string {
  const t = time.padStart(4, "0");
  return `${date}T${t.slice(0, 2)}:${t.slice(2, 4)}:00Z`;
}

function parseCSVToRecords(csv: string): Record<string, string>[] {
  const lines = csv.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const vals = line.split(",");
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h] = (vals[i] ?? "").trim()));
    return obj;
  });
}

export class NasaFirmsExtendedClient {
  private readonly area: string;
  private readonly dayRange: number;
  private readonly sources: NrtSource[];
  private lastRequestAt = 0;
  private readonly REQUEST_INTERVAL_MS = 60_000; // 1 req/min per source

  constructor(private readonly config: NasaFirmsExtendedConfig) {
    this.area = config.area ?? UKRAINE_BBOX;
    this.dayRange = config.dayRange ?? 1;
    this.sources = config.sources ?? [
      "MODIS_NRT",
      "VIIRS_SNPP_NRT",
      "VIIRS_NOAA20_NRT",
    ];
  }

  private async throttle(): Promise<void> {
    const elapsed = Date.now() - this.lastRequestAt;
    if (elapsed < this.REQUEST_INTERVAL_MS) {
      await new Promise<void>((r) =>
        setTimeout(r, this.REQUEST_INTERVAL_MS - elapsed),
      );
    }
    this.lastRequestAt = Date.now();
  }

  private async fetchCsv(source: NrtSource): Promise<string> {
    await this.throttle();
    const url = `${BASE_URL}/${this.config.apiKey}/${source}/${this.area}/${this.dayRange}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "AegisLens/1.0", Accept: "text/csv" },
    });
    if (!res.ok) {
      throw new Error(`FIRMS API ${res.status} for ${source}: ${await res.text()}`);
    }
    return res.text();
  }

  async fetchModisNrt(): Promise<ModisNrtRecord[]> {
    const csv = await this.fetchCsv("MODIS_NRT");
    const rows = parseCSVToRecords(csv);

    return rows.map((r): ModisNrtRecord => ({
      latitude: parseFloat(r.latitude),
      longitude: parseFloat(r.longitude),
      brightness: parseFloat(r.brightness),
      scan: parseFloat(r.scan ?? "1"),
      track: parseFloat(r.track ?? "1"),
      acq_date: r.acq_date,
      acq_time: r.acq_time,
      satellite: r.satellite === "Aqua" ? "Aqua" : "Terra",
      instrument: "MODIS",
      confidence: parseFloat(r.confidence ?? "0"),
      version: r.version ?? "",
      bright_t31: parseFloat(r.bright_t31 ?? "0"),
      frp: parseFloat(r.frp ?? "0"),
      daynight: r.daynight === "N" ? "N" : "D",
      acquired_at: parseAcqDateTime(r.acq_date, r.acq_time),
    }));
  }

  async fetchViirsNrt(source: Extract<NrtSource, "VIIRS_SNPP_NRT" | "VIIRS_NOAA20_NRT" | "VIIRS_NOAA21_NRT"> = "VIIRS_SNPP_NRT"): Promise<ViirsNrtRecord[]> {
    const csv = await this.fetchCsv(source);
    const rows = parseCSVToRecords(csv);

    return rows.map((r): ViirsNrtRecord => ({
      latitude: parseFloat(r.latitude),
      longitude: parseFloat(r.longitude),
      bright_ti4: parseFloat(r.bright_ti4 ?? r.brightness ?? "0"),
      scan: parseFloat(r.scan ?? "0.375"),
      track: parseFloat(r.track ?? "0.375"),
      acq_date: r.acq_date,
      acq_time: r.acq_time,
      satellite: r.satellite ?? source.replace("_NRT", ""),
      instrument: "VIIRS",
      confidence: VIIRS_CONFIDENCE_MAP[r.confidence?.toLowerCase()] ?? "nominal",
      version: r.version ?? "",
      bright_ti5: parseFloat(r.bright_ti5 ?? "0"),
      frp: parseFloat(r.frp ?? "0"),
      daynight: r.daynight === "N" ? "N" : "D",
      acquired_at: parseAcqDateTime(r.acq_date, r.acq_time),
    }));
  }

  async fetchAll(): Promise<{ modis: ModisNrtRecord[]; viirs: ViirsNrtRecord[] }> {
    const modis: ModisNrtRecord[] = [];
    const viirs: ViirsNrtRecord[] = [];

    for (const source of this.sources) {
      try {
        if (source === "MODIS_NRT") {
          modis.push(...(await this.fetchModisNrt()));
        } else {
          viirs.push(
            ...(await this.fetchViirsNrt(source as Extract<NrtSource, "VIIRS_SNPP_NRT" | "VIIRS_NOAA20_NRT" | "VIIRS_NOAA21_NRT">)),
          );
        }
      } catch {
        // Fail-soft per source
      }
    }

    return { modis, viirs };
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    try {
      await this.fetchModisNrt();
      return { healthy: true };
    } catch (err) {
      return { healthy: false, message: String(err) };
    }
  }
}
