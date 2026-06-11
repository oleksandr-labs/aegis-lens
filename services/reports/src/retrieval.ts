/**
 * Retrieval pipeline for report generation.
 *
 * Merges results from Qdrant (vector search), Elasticsearch (full-text),
 * and Postgres (structured) using Reciprocal Rank Fusion (RRF) scoring.
 *
 * All source backends are stubbed — wire real clients when infra is ready.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type RetrievalSource = "qdrant" | "elastic" | "postgres";

export interface RetrievalQuery {
  reportId: string;
  sectionType: string;
  regions: string[];
  timeRange: { from: string; to: string };
  maxDocs: number;
  sources: RetrievalSource[];
}

export interface RetrievedDocument {
  id: string;
  source: RetrievalSource;
  score: number;
  content: string;
  citations: string[];
  locale: string;
}

// ── RRF Configuration ─────────────────────────────────────────────────────────

/**
 * Per-source weights and RRF smoothing constant k.
 * Higher weight = more influence in final ranking.
 */
export const RETRIEVAL_CONFIG = {
  /** Reciprocal Rank Fusion constant (standard: 60) */
  rrfK: 60,
  sourceWeights: {
    qdrant: 1.2,   // semantic similarity — good for context-rich sections
    elastic: 1.0,  // keyword precision — good for entity/location queries
    postgres: 0.8, // structured metadata — good for time-bounded filtering
  } satisfies Record<RetrievalSource, number>,
  /** Per-source fetch multiplier before merging */
  fetchMultiplier: 3,
} as const;

// ── Source-specific stub fetchers ─────────────────────────────────────────────

/**
 * Qdrant vector search stub.
 * Replace with: new QdrantClient({ url: process.env.QDRANT_URL }).search(...)
 */
async function fetchFromQdrant(
  _query: RetrievalQuery,
): Promise<RetrievedDocument[]> {
  // TODO: wire QdrantClient — collection: "aegis_events"
  // Dense embedding via process.env.EMBEDDING_MODEL
  return [];
}

/**
 * Elasticsearch full-text search stub.
 * Replace with: new Client({ node: process.env.ELASTIC_URL }).search(...)
 */
async function fetchFromElastic(
  _query: RetrievalQuery,
): Promise<RetrievedDocument[]> {
  // TODO: wire @elastic/elasticsearch Client
  // Index: "aegis-events-*", query: multi_match on content + region filter
  return [];
}

/**
 * Postgres structured query stub.
 * Replace with: prisma.event.findMany({ where: { ... } })
 */
async function fetchFromPostgres(
  _query: RetrievalQuery,
): Promise<RetrievedDocument[]> {
  // TODO: wire Prisma/pg client
  // Filter by: regions, timeRange, sectionType → eventClass affinity
  return [];
}

// ── RRF Scoring ───────────────────────────────────────────────────────────────

interface RankedDoc {
  doc: RetrievedDocument;
  rrfScore: number;
}

/**
 * Compute Reciprocal Rank Fusion score across multiple ranked lists.
 * RRF(d) = sum_over_sources( weight_s / (k + rank_s(d)) )
 */
function computeRRF(
  rankedLists: Array<{ source: RetrievalSource; docs: RetrievedDocument[] }>,
  k: number,
  weights: Record<RetrievalSource, number>,
): RankedDoc[] {
  const scoreMap = new Map<string, RankedDoc>();

  for (const { source, docs } of rankedLists) {
    const weight = weights[source];
    docs.forEach((doc, rankIndex) => {
      const rrfContribution = weight / (k + rankIndex + 1);
      const existing = scoreMap.get(doc.id);
      if (existing) {
        existing.rrfScore += rrfContribution;
      } else {
        scoreMap.set(doc.id, { doc: { ...doc }, rrfScore: rrfContribution });
      }
    });
  }

  return Array.from(scoreMap.values()).sort((a, b) => b.rrfScore - a.rrfScore);
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Retrieve documents for a report section by merging results from all
 * configured sources using RRF scoring.
 *
 * Results are sorted by descending RRF score. When all backends return
 * empty arrays (stub state), returns [].
 */
export async function retrieveForReport(
  query: RetrievalQuery,
): Promise<RetrievedDocument[]> {
  const activeSources = query.sources.length > 0
    ? query.sources
    : (Object.keys(RETRIEVAL_CONFIG.sourceWeights) as RetrievalSource[]);

  // Fetch from all active sources in parallel — fail-soft per source
  const sourceResults = await Promise.allSettled(
    activeSources.map(async (source) => {
      const docs = await (
        source === "qdrant"   ? fetchFromQdrant(query)   :
        source === "elastic"  ? fetchFromElastic(query)  :
        /* postgres */          fetchFromPostgres(query)
      );
      return { source, docs };
    }),
  );

  const rankedLists: Array<{ source: RetrievalSource; docs: RetrievedDocument[] }> = [];
  for (const result of sourceResults) {
    if (result.status === "fulfilled") {
      rankedLists.push(result.value);
    }
    // Silently skip failed sources — partial results are better than none
  }

  const fused = computeRRF(
    rankedLists,
    RETRIEVAL_CONFIG.rrfK,
    RETRIEVAL_CONFIG.sourceWeights,
  );

  // Re-project RRF scores back onto the doc.score field and truncate
  return fused.slice(0, query.maxDocs).map(({ doc, rrfScore }) => ({
    ...doc,
    score: rrfScore,
  }));
}
