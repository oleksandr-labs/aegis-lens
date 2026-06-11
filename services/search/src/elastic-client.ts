/**
 * Elasticsearch BM25 search client.
 *
 * Handles index management, document indexing, and lexical search queries
 * with locale-aware analyzers, highlighting, and faceted aggregations.
 */

import type { SearchQuery, SearchHit, SearchFacets } from "./types";
import { getAnalyzerForLocale, detectLocale } from "./analyzers";

const DEFAULT_INDEX = "aegis_events";

export interface ESSearchResult {
  hits: SearchHit[];
  total: number;
  facets?: SearchFacets;
}

interface ESHit {
  _id: string;
  _score: number;
  _source: {
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
  highlight?: Record<string, string[]>;
}

export class ElasticsearchClient {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey?: string,
    private readonly index = DEFAULT_INDEX,
  ) {}

  private async fetch<T>(path: string, body?: unknown, method = "POST"): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.apiKey) headers["Authorization"] = `ApiKey ${this.apiKey}`;

    const res = await fetch(`${this.baseUrl}${path}`, {
      method: body ? method : "GET",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      throw new Error(`Elasticsearch ${res.status}: ${await res.text()}`);
    }
    return res.json() as Promise<T>;
  }

  async search(query: SearchQuery): Promise<ESSearchResult> {
    const locale = query.locale ?? detectLocale(query.q);
    const analyzer = getAnalyzerForLocale(locale);
    const size = Math.min(query.limit ?? 20, 100);

    const esQuery = this.buildQuery(query, analyzer);
    const aggs = this.buildAggregations();
    const highlight = this.buildHighlight(analyzer);
    const sort = this.buildSort(query);

    const body: Record<string, unknown> = {
      query: esQuery,
      highlight,
      aggs,
      size,
      track_total_hits: true,
    };

    if (query.cursor) {
      try {
        body.search_after = JSON.parse(Buffer.from(query.cursor, "base64url").toString());
      } catch {
        // ignore invalid cursor
      }
    }

    if (sort) body.sort = sort;

    const resp = await this.fetch<{
      hits: { total: { value: number }; hits: ESHit[] };
      aggregations?: Record<string, { buckets: { key: string; doc_count: number }[] }>;
    }>(`/${this.index}/_search`, body);

    const hits = resp.hits.hits.map((h) => ({
      id: h._id,
      score: h._score,
      eventId: h._source.eventId,
      class: h._source.class,
      subclass: h._source.subclass,
      severity: h._source.severity,
      summary: h._source.summary,
      location: h._source.location,
      occurredAt: h._source.occurredAt,
      sources: h._source.sources,
      highlights: Object.fromEntries(
        Object.entries(h.highlight ?? {}).map(([field, frags]) => [field, frags[0] ?? ""]),
      ),
    }));

    return {
      hits,
      total: resp.hits.total.value,
      facets: this.parseAggregations(resp.aggregations),
    };
  }

  private buildQuery(query: SearchQuery, analyzer: string): Record<string, unknown> {
    const mustClauses: unknown[] = [
      {
        multi_match: {
          query: query.q,
          fields: ["summary.en^2", "summary.uk^2", "originalText", "location.placeName"],
          analyzer,
          type: "best_fields",
          fuzziness: "AUTO",
        },
      },
    ];

    const filterClauses: unknown[] = [];

    if (query.classes?.length) {
      filterClauses.push({ terms: { class: query.classes } });
    }
    if (query.severities?.length) {
      filterClauses.push({ terms: { severity: query.severities } });
    }
    if (query.sources?.length) {
      filterClauses.push({ terms: { "sources.url": query.sources } });
    }
    if (query.verifiedOnly) {
      filterClauses.push({ term: { verificationState: "verified" } });
    }
    if (query.dateRange) {
      filterClauses.push({
        range: {
          occurredAt: {
            ...(query.dateRange.from ? { gte: query.dateRange.from } : {}),
            ...(query.dateRange.to ? { lte: query.dateRange.to } : {}),
          },
        },
      });
    }

    // Tenant access control
    if (query.orgId) {
      filterClauses.push({
        bool: {
          should: [
            { term: { orgId: query.orgId } },
            { term: { tier: "public" } },
          ],
        },
      });
    }

    if (query.geo) {
      filterClauses.push({
        geo_distance: {
          distance: `${query.geo.radiusKm}km`,
          "location.coordinates": { lat: query.geo.lat, lon: query.geo.lon },
        },
      });
    }

    return {
      bool: {
        must: mustClauses,
        filter: filterClauses,
      },
    };
  }

  private buildAggregations(): Record<string, unknown> {
    return {
      classes: { terms: { field: "class", size: 20 } },
      severities: { terms: { field: "severity", size: 5 } },
      sources: { terms: { field: "sources.url", size: 10 } },
      date_histogram: {
        date_histogram: {
          field: "occurredAt",
          calendar_interval: "day",
          min_doc_count: 1,
        },
      },
    };
  }

  private buildHighlight(analyzer: string): Record<string, unknown> {
    return {
      pre_tags: ["<em>"],
      post_tags: ["</em>"],
      fields: {
        "summary.en": { number_of_fragments: 1, fragment_size: 200 },
        "summary.uk": { number_of_fragments: 1, fragment_size: 200 },
        originalText: { number_of_fragments: 2, fragment_size: 150 },
      },
    };
  }

  private buildSort(query: SearchQuery): unknown[] | undefined {
    if (!query.sort || query.sort === "score") return undefined;

    const order = query.sortOrder ?? "desc";
    const sorts: unknown[] = [];

    if (query.sort === "occurredAt") sorts.push({ occurredAt: { order } });
    else if (query.sort === "severity") sorts.push({ severity: { order } });

    if (query.geo && query.sort === "distance") {
      sorts.push({
        _geo_distance: {
          "location.coordinates": { lat: query.geo.lat, lon: query.geo.lon },
          order: "asc",
          unit: "km",
        },
      });
    }

    sorts.push({ _score: { order: "desc" } }, { occurredAt: { order: "desc" } });
    return sorts;
  }

  private parseAggregations(
    aggs?: Record<string, { buckets: { key: string | number; doc_count: number; key_as_string?: string }[] }>,
  ): SearchFacets | undefined {
    if (!aggs) return undefined;
    return {
      classes: (aggs.classes?.buckets ?? []).map((b) => ({ key: String(b.key), count: b.doc_count })),
      severities: (aggs.severities?.buckets ?? []).map((b) => ({ key: String(b.key), count: b.doc_count })),
      sources: (aggs.sources?.buckets ?? []).map((b) => ({ key: String(b.key), count: b.doc_count })),
      dateHistogram: (aggs.date_histogram?.buckets ?? []).map((b) => ({
        date: b.key_as_string ?? String(b.key),
        count: b.doc_count,
      })),
    };
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    try {
      await this.fetch<{ status: string }>("/_cluster/health", undefined, "GET");
      return { healthy: true };
    } catch (err) {
      return { healthy: false, message: String(err) };
    }
  }
}
