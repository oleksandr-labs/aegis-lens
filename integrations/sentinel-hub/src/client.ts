/**
 * Sentinel Hub Process API client.
 * Docs: https://docs.sentinel-hub.com/api/latest/
 *
 * Handles OAuth2 token management + Process API requests for evalscript execution.
 */

export interface SentinelHubConfig {
  clientId: string;
  clientSecret: string;
  /** Default: https://services.sentinel-hub.com */
  baseUrl?: string;
  /** Processing unit budget alert threshold */
  puBudgetAlert?: number;
}

export type DataCollection =
  | "SENTINEL2_L2A"
  | "SENTINEL2_L1C"
  | "SENTINEL1_GRD"
  | "MODIS"
  | "LANDSAT_OT_L2";

export interface BBox {
  west: number;
  south: number;
  east: number;
  north: number;
  crs?: string;
}

export interface ProcessRequest {
  bbox: BBox;
  time_range: { from: string; to: string };
  collection: DataCollection;
  evalscript: string;
  width?: number;
  height?: number;
  format?: "image/png" | "image/jpeg" | "image/tiff";
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

export class SentinelHubClient {
  private readonly base: string;
  private token: string | null = null;
  private tokenExpiry = 0;

  constructor(private readonly config: SentinelHubConfig) {
    this.base = config.baseUrl ?? "https://services.sentinel-hub.com";
  }

  private async getToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiry - 60_000) {
      return this.token;
    }

    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    const res = await fetch(`${this.base}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!res.ok) throw new Error(`Sentinel Hub auth failed: ${res.status}`);
    const data: TokenResponse = await res.json();
    this.token = data.access_token;
    this.tokenExpiry = Date.now() + data.expires_in * 1000;
    return this.token;
  }

  /** Execute a Process API request and return raw image bytes */
  async process(req: ProcessRequest): Promise<Uint8Array> {
    const token = await this.getToken();

    const body = {
      input: {
        bounds: {
          bbox: [req.bbox.west, req.bbox.south, req.bbox.east, req.bbox.north],
          properties: { crs: req.bbox.crs ?? "http://www.opengis.net/def/crs/EPSG/0/4326" },
        },
        data: [
          {
            type: req.collection,
            dataFilter: { timeRange: { from: req.time_range.from, to: req.time_range.to } },
          },
        ],
      },
      output: {
        width: req.width ?? 512,
        height: req.height ?? 512,
        responses: [{ identifier: "default", format: { type: req.format ?? "image/png" } }],
      },
      evalscript: req.evalscript,
    };

    const res = await fetch(`${this.base}/api/v1/process`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: req.format ?? "image/png",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`Sentinel Hub Process API error ${res.status}: ${await res.text()}`);
    return new Uint8Array(await res.arrayBuffer());
  }

  /** Statistical API for time-series aggregation */
  async statistics(params: {
    bbox: BBox;
    time_range: { from: string; to: string };
    collection: DataCollection;
    evalscript: string;
    aggregation_period: "P1D" | "P7D" | "P1M";
  }): Promise<StatisticsResponse> {
    const token = await this.getToken();

    const body = {
      input: {
        bounds: {
          bbox: [params.bbox.west, params.bbox.south, params.bbox.east, params.bbox.north],
        },
        data: [
          {
            type: params.collection,
            dataFilter: { timeRange: { from: params.time_range.from, to: params.time_range.to } },
          },
        ],
      },
      aggregation: {
        timeRange: { from: params.time_range.from, to: params.time_range.to },
        aggregationInterval: { of: params.aggregation_period },
        evalscript: params.evalscript,
      },
    };

    const res = await fetch(`${this.base}/api/v1/statistics`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`Sentinel Hub Statistics API error ${res.status}`);
    return res.json() as Promise<StatisticsResponse>;
  }
}

export interface StatisticsResponse {
  data: Array<{
    interval: { from: string; to: string };
    outputs: Record<string, { bands: Record<string, { stats: BandStats }> }>;
  }>;
}

export interface BandStats {
  min: number;
  max: number;
  mean: number;
  stDev: number;
  sampleCount: number;
  noDataCount: number;
}
