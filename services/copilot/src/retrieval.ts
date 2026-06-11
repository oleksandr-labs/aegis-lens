/**
 * Hybrid retrieval for the copilot context block: dense RAG (Qdrant) + lexical
 * (Elasticsearch), fused with Reciprocal Rank Fusion (RRF).
 *
 * ── Codeable contract ───────────────────────────────────────────────────────
 * Qdrant and Elasticsearch are live network services we can't assume are
 * reachable in CI / offline. So we ship:
 *   - typed `VectorIndex` and `LexicalIndex` seams that a real Qdrant/Elastic
 *     client implements,
 *   - dependency-free in-memory baselines (`InMemoryVectorIndex`,
 *     `InMemoryLexicalIndex`) that give real ranking behaviour offline,
 *   - `hybridSearch()` that queries both and fuses by RRF, returning candidates
 *     with provenance so the copilot can ground + cite each one.
 *
 * Wire real backends via env (documented in COMPLIANCE.md):
 *   QDRANT_URL / QDRANT_API_KEY, ELASTIC_URL / ELASTIC_API_KEY.
 */

/** A retrievable chunk derived from a canonical event. */
export interface RetrievableEvent {
  eventId: string;
  /** Text used for lexical + dense indexing (title + summary, EN/UK). */
  text: string;
  /** Precomputed embedding for dense search (optional for lexical-only). */
  vector?: number[];
  /** Carried through to citations. */
  meta?: {
    class?: string;
    country?: string;
    occurredAt?: string;
    confidence?: number;
    sourceUrl?: string;
  };
}

export interface RetrievalHit {
  eventId: string;
  score: number;
  retriever: "dense" | "lexical" | "hybrid";
  text: string;
  meta?: RetrievableEvent["meta"];
}

export interface VectorIndex {
  id: string;
  search(queryVector: number[], topK: number): Promise<RetrievalHit[]>;
}

export interface LexicalIndex {
  id: string;
  search(query: string, topK: number): Promise<RetrievalHit[]>;
}

// ── In-memory baselines (offline / CI) ───────────────────────────────────────

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom ? dot / denom : 0;
}

/** Brute-force cosine vector index — stand-in for Qdrant offline. */
export class InMemoryVectorIndex implements VectorIndex {
  id = "in-memory-vector";
  constructor(private readonly docs: RetrievableEvent[]) {}
  async search(queryVector: number[], topK: number): Promise<RetrievalHit[]> {
    return this.docs
      .filter((d) => d.vector && d.vector.length)
      .map((d) => ({
        eventId: d.eventId,
        score: cosine(queryVector, d.vector!),
        retriever: "dense" as const,
        text: d.text,
        meta: d.meta,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

/** Naive BM25-flavoured TF scorer — stand-in for Elasticsearch offline. */
export class InMemoryLexicalIndex implements LexicalIndex {
  id = "in-memory-lexical";
  constructor(private readonly docs: RetrievableEvent[]) {}
  async search(query: string, topK: number): Promise<RetrievalHit[]> {
    const terms = tokenize(query);
    if (!terms.length) return [];
    const df = new Map<string, number>();
    const docTokens = this.docs.map((d) => {
      const toks = tokenize(d.text);
      for (const t of new Set(toks)) df.set(t, (df.get(t) ?? 0) + 1);
      return toks;
    });
    const N = this.docs.length || 1;
    return this.docs
      .map((d, i) => {
        const toks = docTokens[i];
        const tf = new Map<string, number>();
        for (const t of toks) tf.set(t, (tf.get(t) ?? 0) + 1);
        let score = 0;
        for (const term of terms) {
          const f = tf.get(term) ?? 0;
          if (!f) continue;
          const idf = Math.log(1 + N / ((df.get(term) ?? 0) + 0.5));
          score += idf * (f / (f + 1)); // saturating TF
        }
        return { eventId: d.eventId, score, retriever: "lexical" as const, text: d.text, meta: d.meta };
      })
      .filter((h) => h.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

function tokenize(s: string): string[] {
  return (s.toLowerCase().match(/[\p{L}\p{N}]{2,}/gu) ?? []);
}

// ── Reciprocal Rank Fusion ────────────────────────────────────────────────────

export interface HybridOptions {
  topK?: number;
  /** RRF constant; 60 is the canonical default. */
  rrfK?: number;
}

/**
 * Fuse dense + lexical result lists by Reciprocal Rank Fusion.
 * RRF score(d) = Σ 1 / (k + rank_i(d)). Backend-agnostic and score-scale-free.
 */
export function reciprocalRankFusion(
  lists: RetrievalHit[][],
  opts: HybridOptions = {},
): RetrievalHit[] {
  const k = opts.rrfK ?? 60;
  const topK = opts.topK ?? 10;
  const fused = new Map<string, RetrievalHit>();
  const scores = new Map<string, number>();

  for (const list of lists) {
    list.forEach((hit, rank) => {
      scores.set(hit.eventId, (scores.get(hit.eventId) ?? 0) + 1 / (k + rank + 1));
      if (!fused.has(hit.eventId)) fused.set(hit.eventId, { ...hit, retriever: "hybrid" });
    });
  }

  return [...fused.values()]
    .map((h) => ({ ...h, score: Number((scores.get(h.eventId) ?? 0).toFixed(6)) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Run dense + lexical retrieval in parallel and fuse.
 * `queryVector` may be omitted to run lexical-only (e.g. when no embedder is set).
 */
export async function hybridSearch(
  params: {
    query: string;
    queryVector?: number[];
    vectorIndex?: VectorIndex;
    lexicalIndex: LexicalIndex;
  },
  opts: HybridOptions = {},
): Promise<RetrievalHit[]> {
  const topK = opts.topK ?? 10;
  const perRetriever = Math.max(topK * 2, 20);

  const tasks: Promise<RetrievalHit[]>[] = [
    params.lexicalIndex.search(params.query, perRetriever),
  ];
  if (params.vectorIndex && params.queryVector) {
    tasks.push(params.vectorIndex.search(params.queryVector, perRetriever));
  }

  const lists = await Promise.all(tasks);
  return reciprocalRankFusion(lists, opts);
}
