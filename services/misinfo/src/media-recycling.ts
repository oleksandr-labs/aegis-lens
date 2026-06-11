/**
 * Recycled-media detection (codeable contract + heuristic baseline).
 *
 * "Recycled media" = an image/video that was published earlier, in a different
 * context, then re-shared as if it depicts the current event. This is one of the
 * most common disinformation techniques in the Ukraine information space.
 *
 * Full production detection needs three signals:
 *   1. Exact hash (SHA-256) — byte-identical re-uploads.
 *   2. Perceptual hash (pHash / dHash) — re-encodes, crops, watermarks.
 *   3. Visual embeddings (CLIP-style) — semantic near-duplicates, heavy edits.
 *
 * Signals 2 and 3 require a CV model and a populated reference index that we do
 * not ship here. This module therefore defines the TYPED INTERFACE plus a
 * heuristic baseline that works on hashes that callers compute upstream (the
 * vision service / ingest pipeline). It NEVER asserts misinfo on its own — it
 * emits a neutral, evidence-based `MisinfoSignal` describing the prior match so
 * a human (or the disputed-badge aggregator) can weigh it. No auto-takedown.
 */

import type { MisinfoSignal } from "./types";

/** A media fingerprint produced upstream (vision service / ingest). */
export interface MediaFingerprint {
  /** Stable id of the media asset as referenced by the current event. */
  mediaId: string;
  /** Hex SHA-256 of the raw bytes (exact-dup detection). */
  sha256?: string;
  /**
   * 64-bit perceptual hash as a hex string (e.g. dHash/pHash output).
   * Compared via Hamming distance.
   */
  phash64?: string;
  /** Optional unit-normalized visual embedding (CLIP-style) for near-dup search. */
  embedding?: number[];
}

/** A prior appearance of the same/similar media, from the provenance index. */
export interface MediaPriorAppearance extends MediaFingerprint {
  /** When the media was first seen by us / on the open web (ISO-8601). */
  firstSeenAt: string;
  /** Where it was first seen (channel id, URL, archive link). */
  firstSeenSource?: string;
  /** Optional human label of the original context, e.g. "Syria 2018 / Beirut 2020". */
  knownContext?: { en: string; uk: string };
}

/**
 * Index of previously-seen media. In production this is backed by a vector DB
 * (embeddings) + a hash table (sha256/phash). Here it is an in-memory contract
 * with the same query surface, so callers/tests are stable across the swap.
 */
export interface MediaProvenanceIndex {
  /** Exact-byte match. */
  findBySha256(sha256: string): MediaPriorAppearance | null;
  /** Perceptual near-dups within `maxHamming` bits (of 64). */
  findByPhash(phash64: string, maxHamming: number): MediaPriorAppearance[];
  /** Embedding near-dups with cosine similarity ≥ `minCosine`. */
  findByEmbedding(embedding: number[], minCosine: number): MediaPriorAppearance[];
}

// ── Hamming distance on hex-encoded 64-bit hashes ────────────────────────────

const POPCOUNT = (() => {
  const t = new Uint8Array(256);
  for (let i = 0; i < 256; i++) t[i] = (i & 1) + t[i >> 1];
  return t;
})();

/** Hamming distance between two equal-length hex strings, bit-for-bit. */
export function hexHamming(a: string, b: string): number {
  if (a.length !== b.length) return Number.POSITIVE_INFINITY;
  let dist = 0;
  for (let i = 0; i < a.length; i += 2) {
    const byteA = parseInt(a.slice(i, i + 2), 16);
    const byteB = parseInt(b.slice(i, i + 2), 16);
    if (Number.isNaN(byteA) || Number.isNaN(byteB)) return Number.POSITIVE_INFINITY;
    dist += POPCOUNT[byteA ^ byteB];
  }
  return dist;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

// ── Reference in-memory index (default implementation) ───────────────────────

export class InMemoryMediaProvenanceIndex implements MediaProvenanceIndex {
  private readonly bySha = new Map<string, MediaPriorAppearance>();
  private readonly priors: MediaPriorAppearance[] = [];

  /** Register a known prior appearance (e.g. when we first ingest any media). */
  add(prior: MediaPriorAppearance): void {
    if (prior.sha256) this.bySha.set(prior.sha256, prior);
    this.priors.push(prior);
  }

  findBySha256(sha256: string): MediaPriorAppearance | null {
    return this.bySha.get(sha256) ?? null;
  }

  findByPhash(phash64: string, maxHamming: number): MediaPriorAppearance[] {
    return this.priors
      .filter((p) => p.phash64 && hexHamming(p.phash64, phash64) <= maxHamming)
      .sort(
        (x, y) =>
          hexHamming(x.phash64!, phash64) - hexHamming(y.phash64!, phash64),
      );
  }

  findByEmbedding(embedding: number[], minCosine: number): MediaPriorAppearance[] {
    return this.priors
      .filter((p) => p.embedding && cosineSimilarity(p.embedding, embedding) >= minCosine)
      .sort(
        (x, y) =>
          cosineSimilarity(y.embedding!, embedding) -
          cosineSimilarity(x.embedding!, embedding),
      );
  }
}

// ── Detection ────────────────────────────────────────────────────────────────

export interface RecycledMediaOptions {
  /** Max perceptual-hash Hamming distance (of 64 bits) to call a near-dup. */
  maxPhashHamming?: number;
  /** Min cosine similarity for embedding near-dups. */
  minEmbeddingCosine?: number;
  /**
   * Only treat a prior match as "recycled" if the prior was seen at least this
   * many ms BEFORE the current event's claimed time. Guards against flagging the
   * canonical first post of an event.
   */
  minAgeGapMs?: number;
}

const DEFAULTS: Required<RecycledMediaOptions> = {
  maxPhashHamming: 10, // ~16% of 64 bits — conservative
  minEmbeddingCosine: 0.94,
  minAgeGapMs: 6 * 3_600_000, // 6 hours older than the claim
};

/**
 * Check one piece of current-event media against the provenance index.
 * Returns a neutral MisinfoSignal when an older appearance is found, else null.
 *
 * Confidence ladder (deliberately conservative, never 1.0):
 *   exact sha256 older match → 0.85
 *   perceptual near-dup       → scaled 0.5..0.8 by Hamming closeness
 *   embedding near-dup        → scaled 0.4..0.7 by cosine
 */
export function detectRecycledMedia(
  current: MediaFingerprint,
  index: MediaProvenanceIndex,
  claimedAt: string,
  options: RecycledMediaOptions = {},
): MisinfoSignal | null {
  const opts = { ...DEFAULTS, ...options };
  const claimedMs = Date.parse(claimedAt);

  const olderEnough = (p: MediaPriorAppearance): boolean => {
    const priorMs = Date.parse(p.firstSeenAt);
    if (Number.isNaN(priorMs) || Number.isNaN(claimedMs)) return true; // can't time-gate → still report
    return claimedMs - priorMs >= opts.minAgeGapMs;
  };

  const describe = (p: MediaPriorAppearance, method: string, confidence: number): MisinfoSignal => {
    const ctx = p.knownContext
      ? ` Known prior context: ${p.knownContext.en}.`
      : "";
    return {
      flag: "recycled_media",
      confidence: parseFloat(confidence.toFixed(2)),
      explanation:
        `Media ${current.mediaId} matches an earlier appearance (${method}) ` +
        `first seen ${p.firstSeenAt}${p.firstSeenSource ? ` at ${p.firstSeenSource}` : ""}.${ctx} ` +
        `This does not prove misuse — older media can be legitimately re-shared; surface as a caveat only.`,
      sourceIds: p.firstSeenSource ? [p.firstSeenSource] : undefined,
    };
  };

  // 1. Exact byte match (strongest).
  if (current.sha256) {
    const exact = index.findBySha256(current.sha256);
    if (exact && exact.mediaId !== current.mediaId && olderEnough(exact)) {
      return describe(exact, "exact byte hash", 0.85);
    }
  }

  // 2. Perceptual near-duplicate.
  if (current.phash64) {
    const near = index
      .findByPhash(current.phash64, opts.maxPhashHamming)
      .filter((p) => p.mediaId !== current.mediaId && olderEnough(p));
    if (near.length > 0) {
      const best = near[0];
      const ham = hexHamming(best.phash64!, current.phash64);
      // closer (smaller Hamming) → higher confidence, bounded [0.5, 0.8]
      const confidence = 0.8 - (ham / opts.maxPhashHamming) * 0.3;
      return describe(best, `perceptual hash (Hamming ${ham})`, confidence);
    }
  }

  // 3. Embedding near-duplicate.
  if (current.embedding && current.embedding.length > 0) {
    const near = index
      .findByEmbedding(current.embedding, opts.minEmbeddingCosine)
      .filter((p) => p.mediaId !== current.mediaId && olderEnough(p));
    if (near.length > 0) {
      const best = near[0];
      const cos = cosineSimilarity(best.embedding!, current.embedding);
      // map cosine in [minCosine,1] → confidence [0.4,0.7]
      const span = 1 - opts.minEmbeddingCosine || 1e-6;
      const confidence = 0.4 + ((cos - opts.minEmbeddingCosine) / span) * 0.3;
      return describe(best, `visual embedding (cos ${cos.toFixed(3)})`, confidence);
    }
  }

  return null;
}
