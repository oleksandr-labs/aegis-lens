/**
 * Qdrant dense vector search client.
 *
 * Used for semantic (embedding-based) retrieval in the hybrid search pipeline.
 * Per-org collection isolation enforced via collection naming convention.
 */

import type { SearchQuery, SearchHit } from "./types";

interface QdrantPoint {
  id: string;
  version: number;
  score: number;
  payload: {
    eventId: string;
    class: string;
    subclass?: string;
    severity: number;
    summary: { en?: string | null; uk?: string | null };
    location?: { lat: number; lon: number; precisionM: number } | null;
    occurredAt: string;
    sources: { url: string; language: string }[];
    orgId?: string;
    tier?: string;
  };
}

export interface DenseSearchResult {
  hits: SearchHit[];
  total: number;
}

export class QdrantClient {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey?: string,
  ) {}

  private collectionName(orgId?: string): string {
    return orgId ? `aegis_events_${orgId.replace(/-/g, "")}` : "aegis_events_public";
  }

  private async fetch<T>(path: string, body?: unknown, method = "POST"): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.apiKey) headers["api-key"] = this.apiKey;

    const res = await fetch(`${this.baseUrl}${path}`, {
      method: body ? method : "GET",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      throw new Error(`Qdrant ${res.status}: ${await res.text()}`);
    }
    return res.json() as Promise<T>;
  }

  async searchByVector(
    embedding: number[],
    query: SearchQuery,
  ): Promise<DenseSearchResult> {
    const collection = this.collectionName(query.orgId);
    const limit = Math.min(query.limit ?? 20, 100);

    const filters = this.buildFilter(query);

    const resp = await this.fetch<{ result: QdrantPoint[]; status: string }>(
      `/collections/${collection}/points/search`,
      {
        vector: embedding,
        limit,
        with_payload: true,
        filter: filters,
        score_threshold: 0.5,
      },
    );

    const hits: SearchHit[] = (resp.result ?? []).map((p) => ({
      id: p.id,
      score: p.score,
      eventId: p.payload.eventId,
      class: p.payload.class,
      subclass: p.payload.subclass,
      severity: p.payload.severity,
      summary: p.payload.summary,
      location: p.payload.location,
      occurredAt: p.payload.occurredAt,
      sources: p.payload.sources,
      highlights: {},
    }));

    return { hits, total: hits.length };
  }

  private buildFilter(query: SearchQuery): Record<string, unknown> | undefined {
    const must: unknown[] = [];

    if (query.classes?.length) {
      must.push({ key: "class", match: { any: query.classes } });
    }
    if (query.severities?.length) {
      must.push({ key: "severity", match: { any: query.severities } });
    }
    if (query.verifiedOnly) {
      must.push({ key: "verificationState", match: { value: "verified" } });
    }
    if (query.dateRange) {
      const range: Record<string, string> = {};
      if (query.dateRange.from) range.gte = query.dateRange.from;
      if (query.dateRange.to) range.lte = query.dateRange.to;
      must.push({ key: "occurredAt", range });
    }
    if (query.geo) {
      must.push({
        key: "location",
        geo_radius: {
          center: { lat: query.geo.lat, lon: query.geo.lon },
          radius: query.geo.radiusKm * 1000,
        },
      });
    }

    return must.length > 0 ? { must } : undefined;
  }

  async upsertPoint(
    orgId: string | undefined,
    id: string,
    vector: number[],
    payload: Record<string, unknown>,
  ): Promise<void> {
    const collection = this.collectionName(orgId);
    await this.fetch(`/collections/${collection}/points`, {
      points: [{ id, vector, payload }],
    });
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    try {
      await this.fetch<{ status: string }>("/", undefined, "GET");
      return { healthy: true };
    } catch (err) {
      return { healthy: false, message: String(err) };
    }
  }
}
