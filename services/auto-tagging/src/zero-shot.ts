/**
 * Embedding-based zero-shot tag fallback.
 *
 * When keyword/class rules in `tagger.ts` produce nothing (or only low-coverage
 * top-level tags), this module proposes tags by *semantic similarity* between
 * the content text and each taxonomy node's label corpus (display names + aliases,
 * EN + UK). It never needs per-tag training data — hence "zero-shot".
 *
 * ── Codeable contract ───────────────────────────────────────────────────────
 * Real production wiring should call a hosted embedding model (Voyage, OpenAI,
 * a local bge-m3, …). That requires a paid key / GPU we can't assume here, so we
 * ship:
 *   1. A typed `Embedder` interface (the seam a real model plugs into).
 *   2. A deterministic, dependency-free `hashingEmbedder` baseline (feature-hashed
 *      character-trigram bag-of-words → L2-normalised vector). This gives real
 *      cosine-similarity behaviour offline and in CI.
 *   3. A confidence schema mapped onto the SAME 0–1 scale as keyword predictions,
 *      but capped + flagged `source: "zero_shot"` so downstream thresholding can
 *      treat it more cautiously.
 *
 * Set `AEGIS_EMBEDDINGS_PROVIDER` + provider key in env and inject a real
 * `Embedder` via `tagZeroShot(input, { embedder })` to upgrade in place.
 */

import { TAXONOMY, TaxonomyNode } from "./taxonomy";
import type { TagPrediction, TaggingInput, TaggingResult } from "./tagger";

/** Pluggable embedding seam. A real model implements `embed`. */
export interface Embedder {
  /** Stable identifier for provenance/eval (e.g. "hashing-768", "voyage-3"). */
  id: string;
  /** Embed a batch of strings into fixed-length L2-normalised vectors. */
  embed(texts: string[]): Promise<number[][]>;
}

/** Tuning knobs for the zero-shot pass. */
export interface ZeroShotOptions {
  embedder?: Embedder;
  /** Minimum cosine similarity to emit a candidate (0–1). Default 0.18. */
  minSimilarity?: number;
  /** Hard cap on confidence emitted by zero-shot (keeps it below keyword). Default 0.7. */
  maxConfidence?: number;
  /** Max candidate tags to return. Default 5. */
  topK?: number;
  /** Restrict to these levels (default: sub + micro, i.e. [1, 2]). */
  levels?: Array<0 | 1 | 2>;
}

const DIM = 768;

/** Character n-grams (trigrams + whole words) used as hashing features. */
function features(text: string): string[] {
  const norm = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
  const out: string[] = [];
  for (const word of norm.split(" ")) {
    if (!word) continue;
    out.push(`w:${word}`);
    const padded = `  ${word}  `;
    for (let i = 0; i < padded.length - 2; i++) out.push(`t:${padded.slice(i, i + 3)}`);
  }
  return out;
}

/** Deterministic FNV-1a hash → bucket index. */
function bucket(token: string, dim: number): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < token.length; i++) {
    h ^= token.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) % dim;
}

/** Feature-hashing bag-of-words embedder — deterministic, offline, dependency-free. */
export const hashingEmbedder: Embedder = {
  id: `hashing-${DIM}`,
  async embed(texts: string[]): Promise<number[][]> {
    return texts.map((t) => {
      const v = new Array<number>(DIM).fill(0);
      for (const f of features(t)) {
        const idx = bucket(f, DIM);
        // signed hashing reduces collision bias
        v[idx] += bucket(`sign:${f}`, 2) === 0 ? 1 : -1;
      }
      // L2 normalise
      let norm = 0;
      for (const x of v) norm += x * x;
      norm = Math.sqrt(norm) || 1;
      return v.map((x) => x / norm);
    });
  },
};

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot; // both already L2-normalised
}

/** The label corpus a node is matched against (display names + aliases, EN+UK). */
function labelCorpus(node: TaxonomyNode): string {
  return [node.displayName.en, node.displayName.uk, ...(node.aliases ?? [])].join(" ");
}

// Cache node embeddings per embedder id (keyed by embedder so swaps don't collide).
const _nodeVecCache = new Map<string, Promise<{ node: TaxonomyNode; vec: number[] }[]>>();

async function nodeVectors(embedder: Embedder, levels: Array<0 | 1 | 2>) {
  const cacheKey = `${embedder.id}:${levels.join(",")}`;
  let entry = _nodeVecCache.get(cacheKey);
  if (!entry) {
    entry = (async () => {
      const nodes = TAXONOMY.filter((n) => !n.deprecated && levels.includes(n.level));
      const vecs = await embedder.embed(nodes.map(labelCorpus));
      return nodes.map((node, i) => ({ node, vec: vecs[i] }));
    })();
    _nodeVecCache.set(cacheKey, entry);
  }
  return entry;
}

function ancestorPath(id: string): string[] {
  const parts = id.split(".");
  return parts.map((_, i) => parts.slice(0, i + 1).join("."));
}

/**
 * Zero-shot tag prediction via embedding similarity.
 * Returns predictions on the standard `TagPrediction` shape with `source: "zero_shot"`.
 */
export async function tagZeroShot(
  input: TaggingInput,
  opts: ZeroShotOptions = {},
): Promise<TagPrediction[]> {
  const embedder = opts.embedder ?? hashingEmbedder;
  const minSim = opts.minSimilarity ?? 0.18;
  const maxConf = opts.maxConfidence ?? 0.7;
  const topK = opts.topK ?? 5;
  const levels = opts.levels ?? [1, 2];

  const text = [input.text, input.titleEn ?? "", input.titleUk ?? ""].join(" ").trim();
  if (!text) return [];

  const [queryVec] = await embedder.embed([text]);
  const nodes = await nodeVectors(embedder, levels);

  const scored = nodes
    .map(({ node, vec }) => ({ node, sim: cosine(queryVec, vec) }))
    .filter((s) => s.sim >= minSim)
    .sort((a, b) => b.sim - a.sim)
    .slice(0, topK);

  return scored.map(({ node, sim }) => ({
    tagId: node.id,
    // Map similarity (often 0.18–0.6 for this baseline) into a capped confidence band.
    confidence: Math.min(maxConf, Number((0.3 + sim * 0.6).toFixed(3))),
    source: "zero_shot" as const,
    path: ancestorPath(node.id),
  }));
}

/**
 * Convenience: take an existing keyword/class `TaggingResult` and, if it is empty
 * or only matched a single top-level node, enrich it with zero-shot candidates.
 * Keyword predictions always win on duplicate IDs.
 */
export async function withZeroShotFallback(
  input: TaggingInput,
  base: TaggingResult,
  opts: ZeroShotOptions = {},
): Promise<TaggingResult> {
  const onlyTopLevel = base.tags.every((t) => t.path.length <= 1);
  if (base.tags.length > 0 && !onlyTopLevel) return base;

  const zs = await tagZeroShot(input, opts);
  const byId = new Map<string, TagPrediction>(base.tags.map((t) => [t.tagId, t]));
  for (const p of zs) if (!byId.has(p.tagId)) byId.set(p.tagId, p);

  const tags = [...byId.values()].sort((a, b) => b.confidence - a.confidence);
  const allTagIds = new Set<string>();
  for (const t of tags) for (const id of t.path) allTagIds.add(id);
  return { tags, allTagIds: [...allTagIds] };
}
