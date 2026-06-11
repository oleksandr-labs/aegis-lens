/**
 * Embedding-based "related items" — baseline hashing embedder + cosine.
 *
 * No model, no network: we use the classic feature-hashing ("hashing trick")
 * bag-of-tokens embedder. It is deterministic, dependency-free, and good
 * enough to surface topically-related pages for internal linking. When a real
 * vector source (e.g. a sentence-transformer service or pgvector column)
 * lands, swap `embed()` for it — the cosine + ranking layer is reusable.
 *
 * Locale-preserving is the CALLER's job (pass only same-locale candidates);
 * this module is pure math over text.
 */

const DIM = 256;

/** FNV-1a 32-bit hash — stable across runs/platforms. */
function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Lowercase, split on non-letter/number (Unicode-aware), drop tiny tokens. */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length >= 2);
}

/**
 * Hashing-trick embedding: each token hashes to a dimension and a sign,
 * accumulating into a fixed-width vector, then L2-normalized. Signed hashing
 * reduces collision bias. Returns a unit vector (or zeros for empty input).
 */
export function embed(text: string, dim: number = DIM): Float64Array {
  const v = new Float64Array(dim);
  for (const tok of tokenize(text)) {
    const h = fnv1a(tok);
    const idx = h % dim;
    const sign = (h & 1) === 0 ? 1 : -1;
    v[idx] += sign;
  }
  let norm = 0;
  for (let i = 0; i < dim; i++) norm += v[i] * v[i];
  norm = Math.sqrt(norm);
  if (norm > 0) for (let i = 0; i < dim; i++) v[i] /= norm;
  return v;
}

/** Cosine similarity of two equal-length vectors (assumes finite values). */
export function cosine(a: Float64Array, b: Float64Array): number {
  const n = Math.min(a.length, b.length);
  let dot = 0;
  for (let i = 0; i < n; i++) dot += a[i] * b[i];
  return dot; // inputs from embed() are unit vectors → dot == cosine
}

export interface EmbeddableDoc {
  /** Page url (locale-prefixed). */
  url: string;
  /** Concatenated title + summary + tags — the text we embed. */
  text: string;
}

export interface RelatedResult {
  url: string;
  score: number;
}

/**
 * Rank `candidates` by cosine similarity to `target`. Excludes the target
 * itself and anything at/below `minScore`. Caller pre-filters by locale.
 */
export function relatedByEmbedding(
  target: EmbeddableDoc,
  candidates: EmbeddableDoc[],
  opts: { limit?: number; minScore?: number } = {},
): RelatedResult[] {
  const { limit = 10, minScore = 0.05 } = opts;
  const tv = embed(target.text);
  const scored: RelatedResult[] = [];
  for (const c of candidates) {
    if (c.url === target.url) continue;
    const score = cosine(tv, embed(c.text));
    if (score > minScore) scored.push({ url: c.url, score });
  }
  scored.sort((a, b) => b.score - a.score || a.url.localeCompare(b.url));
  return scored.slice(0, limit);
}
