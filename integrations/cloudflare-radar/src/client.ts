/**
 * Cloudflare Radar API client for internet outage detection.
 *
 * Used by the Communications Outages layer (TODO/layers/TODO_communications_outages.md).
 *
 * Key endpoints used:
 *   - /radar/ranking/internet_quality — country-level internet quality index
 *   - /radar/attacks/layer7/summary — DDoS / attack traffic (proxy for targeting)
 *   - /radar/bgp/hijacks/events — BGP hijack events
 *   - /radar/entities/asns/ip — ASN info for an IP
 *
 * API docs: https://developers.cloudflare.com/api/operations/radar-get-ranking-internet-quality
 * Auth: Bearer token (CF_RADAR_API_TOKEN)
 */

export interface RadarInternetQuality {
  asn: number;
  asnName: string;
  location: string;
  speed: number;         // Mbps (median download)
  latency: number;       // ms (p75)
  jitter: number;        // ms
  availability: number;  // 0–100
  timestamp: string;
}

export interface RadarBgpHijackEvent {
  id: string;
  prefix: string;
  originAsn: number;
  hijackAsn: number;
  detectedAt: string;
  country?: string;
  isPeer: boolean;
}

export interface RadarCountryOutageSignal {
  countryCode: string;
  countryName: string;
  /** Availability score 0–100; <70 = significant degradation */
  availability: number;
  /** Traffic drop % from baseline (negative = drop) */
  trafficDeltaPct?: number;
  bgpHijacks: number;
  detectedAt: string;
}

export interface RadarClientConfig {
  apiToken: string;
  baseUrl?: string;
  timeoutMs?: number;
}

const BASE_URL = "https://api.cloudflare.com/client/v4";

export class CloudflareRadarClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(private readonly config: RadarClientConfig) {
    this.baseUrl = config.baseUrl ?? BASE_URL;
    this.timeoutMs = config.timeoutMs ?? 15_000;
  }

  /** Get internet quality for a country (ISO 3166-1 alpha-2) */
  async getCountryQuality(countryCode: string): Promise<RadarInternetQuality[]> {
    const params = new URLSearchParams({
      location: countryCode,
      format: "json",
      limit: "10",
    });
    const data = await this.get<{ result: { data: RadarInternetQuality[] } }>(
      `/radar/ranking/internet_quality?${params}`,
    );
    return data.result?.data ?? [];
  }

  /** Get recent BGP hijack events (relevant for outage detection) */
  async getBgpHijacks(params?: { since?: string; limit?: number }): Promise<RadarBgpHijackEvent[]> {
    const p = new URLSearchParams({
      format: "json",
      limit: String(params?.limit ?? 50),
    });
    if (params?.since) p.set("dateStart", params.since);

    const data = await this.get<{ result: { events: RadarBgpHijackEvent[] } }>(
      `/radar/bgp/hijacks/events?${p}`,
    );
    return data.result?.events ?? [];
  }

  /** Compute outage signals for Ukraine and neighboring countries */
  async getUkraineOutageSignals(): Promise<RadarCountryOutageSignal[]> {
    const countries = ["UA", "PL", "MD", "SK", "HU", "RO"];
    const results: RadarCountryOutageSignal[] = [];

    const countryNames: Record<string, string> = {
      UA: "Ukraine", PL: "Poland", MD: "Moldova", SK: "Slovakia", HU: "Hungary", RO: "Romania",
    };

    for (const code of countries) {
      try {
        const quality = await this.getCountryQuality(code);
        if (quality.length === 0) continue;

        const avgAvailability =
          quality.reduce((s, q) => s + q.availability, 0) / quality.length;

        results.push({
          countryCode: code,
          countryName: countryNames[code] ?? code,
          availability: Math.round(avgAvailability),
          detectedAt: new Date().toISOString(),
          bgpHijacks: 0,
        });
      } catch {
        // Skip country on API failure
      }
    }

    return results;
  }

  private async get<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.config.apiToken}`,
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new CloudflareRadarError(response.status, await response.text());
      }

      return response.json() as Promise<T>;
    } finally {
      clearTimeout(timer);
    }
  }
}

export class CloudflareRadarError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string,
  ) {
    super(`Cloudflare Radar API error ${status}: ${body.slice(0, 200)}`);
    this.name = "CloudflareRadarError";
  }
}
