/**
 * Per-template uniqueness threshold (cosine similarity vs siblings).
 *
 * At programmatic scale the biggest duplicate-content risk is that two pages
 * from the same template (e.g. two `/threats/<slug>/in/<iso2>` pages) end up
 * textually near-identical. This module gives a dependency-free, deterministic
 * baseline: a hashing embedder (the "hashing trick") + cosine similarity, and
 * a per-template similarity ceiling above which a page is considered a
 * near-duplicate of one of its siblings.
 *
 * This is a baseline meant to run in CI / batch audits without a real embedding
 * model. When a real embedder is available (e.g. an API call producing dense
 * vectors), swap {@link embed} for it — {@link cosine} and
 * {@link findNearDuplicates} are model-agnostic and keep working.
 *
 * No network, pure functions — unit-testable.
 */

/** Template identifiers we generate at scale. Extend as new templates ship. */
export type TemplateId =
  | "region"
  | "country"
  | "entity"
  | "topic"
  | "threat"
  | "tool"
  | "company"
  | "industry"
  | "use-case"
  | "glossary"
  | "guide"
  | "compare"
  | "tag"
  | "sanctions"
  | "generic";

/**
 * Per-template cosine ceiling. If a page's cosine similarity to a sibling is at
 * or above this value, it is flagged as a near-duplicate.
 *
 * Templates whose pages are intentionally formulaic (compare, tag listings)
 * tolerate slightly higher similarity; long-form editorial templates (guide,
 * topic) demand more divergence.
 */
export const TEMPLATE_SIMILARITY_CEILING: Record<TemplateId, number> = {
  region: 0.82,
  country: 0.82,
  entity: 0.85,
  topic: 0.78,
  threat: 0.8,
  tool: 0.85,
  company: 0.88,
  industry: 0.82,
  "use-case": 0.8,
  glossary: 0.78,
  guide: 0.75,
  compare: 0.9,
  tag: 0.9,
  sanctions: 0.85,
  generic: 0.85,
};

/** Default ceiling when a template is not explicitly configured. */
export const DEFAULT_SIMILARITY_CEILING = 0.85;

export function ceilingFor(template: TemplateId): number {
  return TEMPLATE_SIMILARITY_CEILING[template] ?? DEFAULT_SIMILARITY_CEILING;
}

const DIMENSIONS = 256;

/** Cheap, stable FNV-1a 32-bit hash → bucket index in [0, DIMENSIONS). */
function bucket(token: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < token.length; i++) {
    h ^= token.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) % DIMENSIONS;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .split(/\s+/u)
    .filter((t) => t.length > 1);
}

/**
 * Hashing-trick embedder: term-frequency vector projected into a fixed-size
 * space, then L2-normalized so dot product == cosine. Deterministic and
 * language-agnostic (works for EN and UK alike).
 */
export function embed(text: string): Float64Array {
  const vec = new Float64Array(DIMENSIONS);
  for (const tok of tokenize(text)) {
    vec[bucket(tok)] += 1;
  }
  let norm = 0;
  for (let i = 0; i < DIMENSIONS; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < DIMENSIONS; i++) vec[i] /= norm;
  }
  return vec;
}

/** Cosine similarity of two L2-normalized vectors (== dot product). */
export function cosine(a: Float64Array, b: Float64Array): number {
  const n = Math.min(a.length, b.length);
  let dot = 0;
  for (let i = 0; i < n; i++) dot += a[i] * b[i];
  // Clamp tiny FP drift into [-1, 1].
  return Math.max(-1, Math.min(1, dot));
}

/** Convenience: cosine similarity directly from two raw texts. */
export function textSimilarity(a: string, b: string): number {
  return cosine(embed(a), embed(b));
}

export type PageDoc = {
  /** Canonical path or id — used to identify the page in reports. */
  id: string;
  /** Concatenated indexable text (title + body + meta). */
  text: string;
};

export type NearDuplicate = {
  id: string;
  /** Sibling it most closely resembles. */
  nearestId: string;
  similarity: number;
  ceiling: number;
};

/**
 * Compare each page against its template siblings and return those that meet or
 * exceed the per-template cosine ceiling (i.e. too similar to ship as-is).
 *
 * O(n²) within a template — fine for per-template batches in a CI audit.
 */
export function findNearDuplicates(
  pages: PageDoc[],
  template: TemplateId,
): NearDuplicate[] {
  const ceiling = ceilingFor(template);
  const vectors = pages.map((p) => embed(p.text));
  const flagged: NearDuplicate[] = [];

  for (let i = 0; i < pages.length; i++) {
    let bestSim = -1;
    let bestJ = -1;
    for (let j = 0; j < pages.length; j++) {
      if (i === j) continue;
      const sim = cosine(vectors[i], vectors[j]);
      if (sim > bestSim) {
        bestSim = sim;
        bestJ = j;
      }
    }
    if (bestJ >= 0 && bestSim >= ceiling) {
      flagged.push({
        id: pages[i].id,
        nearestId: pages[bestJ].id,
        similarity: bestSim,
        ceiling,
      });
    }
  }
  return flagged;
}

/** True if a page is sufficiently unique vs its single nearest sibling. */
export function isSufficientlyUnique(
  similarityToNearest: number,
  template: TemplateId,
): boolean {
  return similarityToNearest < ceilingFor(template);
}
