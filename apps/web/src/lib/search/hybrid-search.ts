/**
 * Hybrid retrieval orchestration — Elastic (lexical) + Qdrant (semantic) + PostGIS (geo).
 *
 * Sprint 2.70 — Search infra completion.
 *
 * Architecture:
 *   1. Fan-out search to all three backends in parallel.
 *   2. Merge per-backend ranked lists with Reciprocal Rank Fusion (RRF, k=60).
 *   3. Return a unified HybridSearchResult with per-backend score breakdown.
 *
 * The three backend methods are stubs that return empty arrays until the
 * respective services (Elasticsearch, Qdrant, PostGIS FTS) are provisioned.
 * Wire them up by replacing the stub bodies and injecting clients via the
 * HybridSearchService constructor.
 */

import type { GeoFilter, CustomTimeRange } from "./advanced-filters";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SearchBackend = "elastic" | "qdrant" | "postgis";

export interface SearchQuery {
  text: string;
  locale: "en" | "uk" | "ru";
  geoFilter?: GeoFilter;
  eventTypes?: string[];
  timeRange?: CustomTimeRange;
  limit?: number;
  offset?: number;
}

export interface SearchHit {
  eventId: string;
  /** Combined RRF fusion score. */
  score: number;
  /** Per-backend raw scores before fusion. */
  scoreBreakdown: Partial<Record<SearchBackend, number>>;
  snippet_en?: string;
  snippet_uk?: string;
  /** HTML snippet with <mark> highlights. */
  highlight?: string;
}

export interface HybridSearchResult {
  hits: SearchHit[];
  total: number;
  /** Wall-clock milliseconds for the complete search. */
  queryMs: number;
  backendsQueried: SearchBackend[];
  /** Any synonyms / transliteration variants injected into the query. */
  synonymsExpanded: string[];
}

// ---------------------------------------------------------------------------
// RRF (Reciprocal Rank Fusion)
// ---------------------------------------------------------------------------

/**
 * Merge multiple ranked lists using Reciprocal Rank Fusion.
 *
 * For each hit its RRF score is:
 *   score += 1 / (k + rank)
 *
 * where rank is 1-based and k is a constant that dampens the influence of
 * top-ranked hits (default k=60, as in the Elasticsearch implementation).
 */
function rrfFusion(results: SearchHit[][], k = 60): SearchHit[] {
  const scoreMap = new Map<string, SearchHit>();

  for (const list of results) {
    list.forEach((hit, zeroBasedRank) => {
      const rank = zeroBasedRank + 1;
      const rrf = 1 / (k + rank);

      const existing = scoreMap.get(hit.eventId);
      if (existing) {
        existing.score += rrf;
        // Merge per-backend score breakdowns.
        for (const [backend, s] of Object.entries(hit.scoreBreakdown) as [
          SearchBackend,
          number,
        ][]) {
          existing.scoreBreakdown[backend] =
            (existing.scoreBreakdown[backend] ?? 0) + s;
        }
        // Keep best snippets.
        if (!existing.snippet_en && hit.snippet_en)
          existing.snippet_en = hit.snippet_en;
        if (!existing.snippet_uk && hit.snippet_uk)
          existing.snippet_uk = hit.snippet_uk;
        if (!existing.highlight && hit.highlight)
          existing.highlight = hit.highlight;
      } else {
        scoreMap.set(hit.eventId, {
          ...hit,
          score: rrf,
          scoreBreakdown: { ...hit.scoreBreakdown },
        });
      }
    });
  }

  return Array.from(scoreMap.values()).sort((a, b) => b.score - a.score);
}

// ---------------------------------------------------------------------------
// HybridSearchService
// ---------------------------------------------------------------------------

export class HybridSearchService {
  /**
   * Fan-out to all three backends in parallel, then fuse with RRF.
   */
  async search(
    query: SearchQuery,
    synonymsExpanded: string[] = [],
  ): Promise<HybridSearchResult> {
    const t0 = Date.now();
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;

    const [elasticHits, qdrantHits, postgisHits] = await Promise.all([
      this._elasticSearch(query),
      this._qdrantSearch(query),
      this._postgisSearch(query),
    ]);

    const backendsQueried: SearchBackend[] = [];
    const resultSets: SearchHit[][] = [];

    if (elasticHits.length > 0 || true) {
      backendsQueried.push("elastic");
      resultSets.push(elasticHits);
    }
    if (qdrantHits.length > 0 || true) {
      backendsQueried.push("qdrant");
      resultSets.push(qdrantHits);
    }
    if (postgisHits.length > 0 || true) {
      backendsQueried.push("postgis");
      resultSets.push(postgisHits);
    }

    const fused = this._rrfFusion(resultSets, 60);
    const total = fused.length;
    const hits = fused.slice(offset, offset + limit);

    return {
      hits,
      total,
      queryMs: Date.now() - t0,
      backendsQueried,
      synonymsExpanded,
    };
  }

  // ── Backend stubs ─────────────────────────────────────────────────────────

  /**
   * Lexical search via Elasticsearch.
   * STUB — replace body with an `esClient.search(...)` call once Elastic is
   * provisioned.  The stub returns an empty array so the service degrades
   * gracefully during development.
   */
  async _elasticSearch(_query: SearchQuery): Promise<SearchHit[]> {
    // TODO: inject esClient and implement:
    // const { hits } = await esClient.search({ index: "aegis-events", body: { ... } });
    // return hits.hits.map(h => ({ eventId: h._id, score: h._score, ... }));
    return [];
  }

  /**
   * Semantic / vector search via Qdrant.
   * STUB — replace body with a qdrantClient.search() call once Qdrant is
   * provisioned and an embedding model is wired in.
   */
  async _qdrantSearch(_query: SearchQuery): Promise<SearchHit[]> {
    // TODO: embed query.text with the project embedding model, then:
    // const results = await qdrantClient.search("aegis-events", { vector, limit: 50 });
    // return results.map(r => ({ eventId: r.id as string, score: r.score, ... }));
    return [];
  }

  /**
   * Geographic + full-text search via PostGIS.
   * STUB — replace body with a pg `SELECT … <-> ST_Point(?) …` query.
   */
  async _postgisSearch(_query: SearchQuery): Promise<SearchHit[]> {
    // TODO: build a parameterized SQL with tsvector full-text + PostGIS
    // ST_DWithin for the optional geoFilter, then map rows to SearchHit.
    return [];
  }

  // ── RRF wrapper (public for testing) ─────────────────────────────────────

  _rrfFusion(results: SearchHit[][], k: number): SearchHit[] {
    return rrfFusion(results, k);
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

export const hybridSearch = new HybridSearchService();
