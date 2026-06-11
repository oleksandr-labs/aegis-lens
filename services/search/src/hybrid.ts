/**
 * Hybrid search: combine BM25 (lexical) + dense (semantic) scores using
 * Reciprocal Rank Fusion (RRF), with optional geo boost.
 *
 * RRF formula: score(d) = Σ 1 / (k + rank(d)) for each result list
 * Default k=60 per the original paper (Cormack et al. 2009).
 */

import type { SearchHit, SearchResult, SearchQuery } from "./types";
import type { ElasticsearchClient } from "./elastic-client";
import type { QdrantClient } from "./qdrant-client";

const RRF_K = 60;

function haversineKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function rrfScore(rank: number): number {
  return 1 / (RRF_K + rank + 1);
}

function geoBoost(hit: SearchHit, geo: { lat: number; lon: number }): number {
  if (!hit.location) return 1;
  const distKm = haversineKm(hit.location.lat, hit.location.lon, geo.lat, geo.lon);
  hit.distanceKm = distKm;
  // Boost decays: 2× boost at 0 km → 1× at 50 km
  return 1 + Math.max(0, 1 - distKm / 50);
}

export class HybridSearch {
  constructor(
    private readonly elastic: ElasticsearchClient,
    private readonly qdrant: QdrantClient,
    private readonly embedFn: (text: string) => Promise<number[]>,
  ) {}

  async search(query: SearchQuery): Promise<SearchResult> {
    const startMs = Date.now();
    const limit = Math.min(query.limit ?? 20, 100);

    const lexicalWeight = query.lexicalWeight ?? 0.6;
    const semanticWeight = query.semanticWeight ?? 0.4;
    const geoWeight = query.geoWeight ?? (query.geo ? 0.3 : 0);

    // Run lexical and semantic searches in parallel
    const [lexResult, embedding] = await Promise.all([
      this.elastic.search({ ...query, limit: limit * 3 }),
      this.embedFn(query.q).catch(() => null),
    ]);

    let semHits: SearchHit[] = [];
    if (embedding) {
      const semResult = await this.qdrant
        .searchByVector(embedding, { ...query, limit: limit * 3 })
        .catch(() => ({ hits: [], total: 0 }));
      semHits = semResult.hits;
    }

    // Build RRF score map
    const scores = new Map<string, { score: number; hit: SearchHit }>();

    lexResult.hits.forEach((hit, rank) => {
      const rrf = rrfScore(rank) * lexicalWeight;
      const existing = scores.get(hit.eventId);
      if (existing) {
        existing.score += rrf;
      } else {
        scores.set(hit.eventId, { score: rrf, hit });
      }
    });

    semHits.forEach((hit, rank) => {
      const rrf = rrfScore(rank) * semanticWeight;
      const existing = scores.get(hit.eventId);
      if (existing) {
        existing.score += rrf;
        // Merge highlights from lexical result
        if (Object.keys(existing.hit.highlights).length === 0) {
          existing.hit.highlights = hit.highlights;
        }
      } else {
        scores.set(hit.eventId, { score: rrf, hit });
      }
    });

    // Apply geo boost
    if (query.geo && geoWeight > 0) {
      for (const entry of scores.values()) {
        entry.score *= 1 + (geoBoost(entry.hit, query.geo) - 1) * geoWeight;
      }
    }

    // Sort by combined score, paginate
    const sorted = [...scores.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    const hits = sorted.map(({ score, hit }) => ({ ...hit, score }));

    const total = Math.max(lexResult.total, semHits.length);
    const nextCursor =
      hits.length === limit
        ? Buffer.from(JSON.stringify({ offset: limit })).toString("base64url")
        : undefined;

    return {
      hits,
      total,
      facets: lexResult.facets,
      nextCursor,
      tookMs: Date.now() - startMs,
    };
  }

  async healthCheck(): Promise<{ elastic: boolean; qdrant: boolean }> {
    const [eHealth, qHealth] = await Promise.all([
      this.elastic.healthCheck(),
      this.qdrant.healthCheck(),
    ]);
    return { elastic: eHealth.healthy, qdrant: qHealth.healthy };
  }
}
