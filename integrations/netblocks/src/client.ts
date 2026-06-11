/**
 * NetBlocks client — fetches internet shutdown / throttling incidents.
 *
 * NetBlocks publishes incidents via:
 *   1. REST API (partner access) — https://api.netblocks.net/v2/incidents
 *   2. RSS / public alerts — https://netblocks.org/reports
 *
 * In production: poll the REST API every 5 minutes.
 * Demo mode: returns seeded incidents for UA/RU/BY.
 */

import type { NetBlocksIncident, NetBlocksApiResponse } from "./types";

// Demo seed data — simulates the NetBlocks API response
const DEMO_INCIDENTS: NetBlocksIncident[] = [
  {
    incidentId: "NB-UA-2024-001",
    type: "internet_outage",
    status: "ongoing",
    country: "UA",
    affectedNetworks: ["Kyivstar", "Vodafone Ukraine"],
    severityFraction: 0.3,
    startedAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
    resolvedAt: null,
    summary: "Significant internet disruption detected in eastern Ukraine affecting major mobile operators.",
    summaryUk: "Значні перебої в інтернеті виявлено на сході України у мобільних операторів.",
    sourceUrl: "https://netblocks.org",
  },
  {
    incidentId: "NB-UA-2024-002",
    type: "bgp_anomaly",
    status: "monitoring",
    country: "UA",
    affectedNetworks: ["AS6849 (Ukrtelecom)"],
    severityFraction: 0.15,
    startedAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
    resolvedAt: null,
    summary: "BGP route anomaly observed for Ukrtelecom (AS6849) — possible route leak.",
    summaryUk: "BGP аномалія для Укртелекому (AS6849) — можливий витік маршруту.",
    sourceUrl: "https://netblocks.org",
  },
  {
    incidentId: "NB-UA-2024-003",
    type: "internet_outage",
    status: "resolved",
    country: "UA",
    affectedNetworks: ["Kharkiv Oblast regional ISPs"],
    severityFraction: 0.6,
    startedAt: new Date(Date.now() - 48 * 3600_000).toISOString(),
    resolvedAt: new Date(Date.now() - 44 * 3600_000).toISOString(),
    summary: "Major internet outage in Kharkiv Oblast — 60% connectivity loss for 4 hours following infrastructure damage.",
    summaryUk: "Масштабний збій інтернету в Харківській області — 60% втрата зв'язку протягом 4 годин.",
    sourceUrl: "https://netblocks.org",
  },
];

export class NetBlocksClient {
  constructor(
    private readonly apiKey: string | null = null,
    private readonly baseUrl = "https://api.netblocks.net/v2",
  ) {}

  /**
   * Fetch active + recent incidents for specified countries.
   * Falls back to demo data if no API key configured.
   */
  async getIncidents(opts: {
    countries?: string[];
    statusFilter?: "ongoing" | "resolved" | "monitoring";
  } = {}): Promise<NetBlocksApiResponse> {
    if (!this.apiKey) {
      return this.getDemoIncidents(opts);
    }

    try {
      const params = new URLSearchParams();
      if (opts.countries?.length) params.set("countries", opts.countries.join(","));
      if (opts.statusFilter) params.set("status", opts.statusFilter);

      const res = await fetch(`${this.baseUrl}/incidents?${params}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        throw new Error(`NetBlocks API error: ${res.status}`);
      }

      const data = await res.json() as { incidents: NetBlocksIncident[] };
      return { incidents: data.incidents, fetchedAt: new Date().toISOString() };
    } catch {
      return this.getDemoIncidents(opts);
    }
  }

  private getDemoIncidents(opts: { countries?: string[]; statusFilter?: string }): NetBlocksApiResponse {
    let incidents = DEMO_INCIDENTS;
    if (opts.countries?.length) {
      incidents = incidents.filter((i) => opts.countries!.includes(i.country));
    }
    if (opts.statusFilter) {
      incidents = incidents.filter((i) => i.status === opts.statusFilter);
    }
    return { incidents, fetchedAt: new Date().toISOString() };
  }
}
