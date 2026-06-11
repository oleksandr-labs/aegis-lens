/**
 * SourceAdapter implementation for NetBlocks.
 * Converts NetBlocks incidents into normalised NormalisedEvent objects.
 */

import type { NetBlocksClient } from "./client";
import type { NetBlocksIncident } from "./types";

export interface NormalisedOutageEvent {
  sourceId: string;
  externalId: string;
  class: "comms_outage";
  subclass: "internet_outage" | "throttling" | "bgp_anomaly" | "social_media_block" | "submarine_cable";
  country: string;
  severity: 1 | 2 | 3 | 4 | 5;
  confidence: number;
  occurredAt: string;
  resolvedAt: string | null;
  summaryEn: string;
  summaryUk: string | null;
  sourceUrl: string | null;
  raw: NetBlocksIncident;
}

function severityFromFraction(f: number): 1 | 2 | 3 | 4 | 5 {
  if (f >= 0.8) return 5;
  if (f >= 0.6) return 4;
  if (f >= 0.4) return 3;
  if (f >= 0.2) return 2;
  return 1;
}

function mapSubclass(type: string): NormalisedOutageEvent["subclass"] {
  const map: Record<string, NormalisedOutageEvent["subclass"]> = {
    internet_outage: "internet_outage",
    throttling: "throttling",
    bgp_anomaly: "bgp_anomaly",
    social_media_block: "social_media_block",
    submarine_cable: "submarine_cable",
    vpn_block: "internet_outage",
  };
  return map[type] ?? "internet_outage";
}

export class NetBlocksAdapter {
  private lastFetch: string | null = null;

  constructor(private readonly client: NetBlocksClient) {}

  async fetchSince(since: Date): Promise<NormalisedOutageEvent[]> {
    const result = await this.client.getIncidents({ countries: ["UA", "RU", "BY", "PL", "MD"] });
    this.lastFetch = result.fetchedAt;

    return result.incidents
      .filter((i) => new Date(i.startedAt) >= since)
      .map((i) => ({
        sourceId: "netblocks",
        externalId: i.incidentId,
        class: "comms_outage" as const,
        subclass: mapSubclass(i.type),
        country: i.country,
        severity: severityFromFraction(i.severityFraction),
        confidence: 0.85,
        occurredAt: i.startedAt,
        resolvedAt: i.resolvedAt,
        summaryEn: i.summary,
        summaryUk: i.summaryUk ?? null,
        sourceUrl: i.sourceUrl ?? null,
        raw: i,
      }));
  }

  async healthCheck(): Promise<{ ok: boolean; lastFetchAt: string | null }> {
    return { ok: true, lastFetchAt: this.lastFetch };
  }
}
