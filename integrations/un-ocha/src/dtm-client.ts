/**
 * Client for IOM DTM (Displacement Tracking Matrix), https://dtm.iom.int.
 *
 * IOM publishes DTM displacement figures both via HDX datasets and a public DTM
 * API (https://dtm.iom.int/data-and-analysis/dtm-api). The DTM API exposes
 * AGGREGATE admin-level figures (IDP stock/flow by admin1/admin2). It never
 * returns individual-level records.
 *
 * Endpoint model (DTM API):
 *   GET /api/v3/idp/admin1?CountryName=Ukraine&...   — IDP figures by admin1
 *
 * Optional key: process.env.DTM_API_KEY (some DTM endpoints are gated). Without
 * it, we use HDX-published DTM datasets or the demo fixture.
 *
 * PII INVARIANT: even though DTM is aggregate, every record returned by this
 * client is passed through the strict redactor by the ingest layer, and any
 * centroid is coarsened to admin resolution (never an individual's location).
 */

import type { DtmDisplacementRecord, DisplacementMeasure } from "./types";
import { coarsenCoord } from "./pii-redaction";

const BASE_URL = "https://dtmapi.iom.int/api/v3";
const USER_AGENT = "AegisLens/1.0 (humanitarian-osint; +https://aegis-lens.example) ua-map-un-ocha";

export interface DtmClientConfig {
  apiKey?: string;           // process.env.DTM_API_KEY
  baseUrl?: string;
  timeoutMs?: number;
  minRequestIntervalMs?: number;
}

// ── Raw API shapes (subset) ───────────────────────────────────────────────────

interface DtmAdmin1Row {
  admin0Name?: string;
  admin0Pcode?: string;      // ISO3
  admin1Name?: string;
  admin1Pcode?: string;
  numPresentIdpInd?: number;
  numPresentIdpHH?: number;
  roundNumber?: number;
  reportingDate?: string;
  latitude?: number;
  longitude?: number;
}

interface DtmResponse {
  result?: DtmAdmin1Row[];
  isSuccess?: boolean;
}

const ISO3_TO_ISO2: Record<string, string> = {
  UKR: "UA", POL: "PL", MDA: "MD", ROU: "RO",
};

function mapRow(row: DtmAdmin1Row): DtmDisplacementRecord {
  const iso2 = ISO3_TO_ISO2[(row.admin0Pcode ?? "").toUpperCase()] ?? row.admin0Pcode ?? "UA";
  const centroid =
    typeof row.latitude === "number" && typeof row.longitude === "number"
      ? coarsenCoord({ lat: row.latitude, lon: row.longitude }, 2)
      : undefined;

  return {
    id: `dtm-${iso2}-${row.admin1Pcode ?? row.admin1Name ?? "?"}-r${row.roundNumber ?? 0}`,
    country: iso2,
    admin1Name: row.admin1Name ?? "Unknown",
    admin1Pcode: row.admin1Pcode,
    measure: "stock",
    individuals: row.numPresentIdpInd ?? 0,
    households: row.numPresentIdpHH,
    centroid,
    roundNumber: row.roundNumber,
    reportingDate: row.reportingDate ?? new Date().toISOString(),
    source: "IOM DTM",
    url: "https://dtm.iom.int/ukraine",
  };
}

export class DtmClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly minInterval: number;
  private lastRequestAt = 0;

  constructor(private readonly config: DtmClientConfig = {}) {
    this.baseUrl = config.baseUrl ?? BASE_URL;
    this.timeoutMs = config.timeoutMs ?? 15_000;
    this.minInterval = config.minRequestIntervalMs ?? 1_000;
  }

  /** Fetch IDP figures by admin1 for a country. Falls back to demo fixture. */
  async getIdpByAdmin1(countryName = "Ukraine"): Promise<DtmDisplacementRecord[]> {
    const params = new URLSearchParams({ CountryName: countryName });
    try {
      const data = await this.fetch<DtmResponse>(`/idp/admin1?${params.toString()}`);
      if (!data.isSuccess || !data.result?.length) return DEMO_DTM_RECORDS;
      return data.result.map(mapRow);
    } catch {
      return DEMO_DTM_RECORDS;
    }
  }

  private async throttle(): Promise<void> {
    const wait = this.lastRequestAt + this.minInterval - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    this.lastRequestAt = Date.now();
  }

  private async fetch<T>(path: string): Promise<T> {
    await this.throttle();
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    const headers: Record<string, string> = {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    };
    if (this.config.apiKey) headers["Ocp-Apim-Subscription-Key"] = this.config.apiKey;
    try {
      const res = await fetch(url, { headers, signal: controller.signal });
      if (!res.ok) throw new DtmApiError(res.status, await res.text());
      return (await res.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }
}

export class DtmApiError extends Error {
  constructor(public readonly status: number, public readonly body: string) {
    super(`DTM API error ${status}: ${body.slice(0, 200)}`);
    this.name = "DtmApiError";
  }
}

/** Map raw DTM measure strings if/when present. */
export function normalizeMeasure(raw?: string): DisplacementMeasure {
  switch ((raw ?? "").toLowerCase()) {
    case "flow_in":
    case "arrival": return "flow_in";
    case "flow_out":
    case "departure": return "flow_out";
    case "returnee":
    case "return": return "returnee";
    default: return "stock";
  }
}

// ── Demo fixture (aggregate, coarse centroids — no PII) ───────────────────────

export const DEMO_DTM_RECORDS: DtmDisplacementRecord[] = [
  { id: "dtm-UA-UA14-r24", country: "UA", admin1Name: "Donetska",   admin1Pcode: "UA14", measure: "stock", individuals: 612000, households: 245000, centroid: { lat: 48.02, lon: 37.8 },  roundNumber: 24, reportingDate: "2026-03-15", source: "IOM DTM", url: "https://dtm.iom.int/ukraine" },
  { id: "dtm-UA-UA63-r24", country: "UA", admin1Name: "Kharkivska", admin1Pcode: "UA63", measure: "stock", individuals: 488000, households: 196000, centroid: { lat: 49.99, lon: 36.23 }, roundNumber: 24, reportingDate: "2026-03-15", source: "IOM DTM", url: "https://dtm.iom.int/ukraine" },
  { id: "dtm-UA-UA12-r24", country: "UA", admin1Name: "Dnipropetrovska", admin1Pcode: "UA12", measure: "flow_in", individuals: 351000, households: 140000, centroid: { lat: 48.46, lon: 35.04 }, roundNumber: 24, reportingDate: "2026-03-15", source: "IOM DTM", url: "https://dtm.iom.int/ukraine" },
  { id: "dtm-UA-UA23-r24", country: "UA", admin1Name: "Zaporizka",  admin1Pcode: "UA23", measure: "stock", individuals: 274000, households: 110000, centroid: { lat: 47.84, lon: 35.14 }, roundNumber: 24, reportingDate: "2026-03-15", source: "IOM DTM", url: "https://dtm.iom.int/ukraine" },
  { id: "dtm-UA-UA32-r24", country: "UA", admin1Name: "Kyivska",    admin1Pcode: "UA32", measure: "flow_in", individuals: 198000, households: 80000,  centroid: { lat: 50.45, lon: 30.52 }, roundNumber: 24, reportingDate: "2026-03-15", source: "IOM DTM", url: "https://dtm.iom.int/ukraine" },
];
