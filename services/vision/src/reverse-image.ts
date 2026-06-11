/**
 * Reverse image search (Verification cluster).
 *
 * Two backends, fused:
 *   1. TinEye commercial API  — finds where else an image has appeared on the web,
 *      with first-seen dates (great for catching recycled/old footage).
 *   2. Custom embeddings index — our own corpus of previously-ingested OSINT media,
 *      searched by nearest-neighbour over image embeddings (target: EVA-CLIP/DINOv2).
 *
 * Both are delivered as the codeable contract: a typed client + a HEURISTIC /
 * stub fallback so the pipeline is usable without the paid key or trained encoder.
 *
 * === MODEL WEIGHTS + PAID KEY PENDING ===
 *  - The embedding encoder (`img-embed-v0`) is a stub; until weights ship the index
 *    falls back to a 64-bit perceptual hash (pHash) Hamming-distance match, which
 *    catches near-duplicates and simple crops but not semantic similarity.
 *  - TinEye requires `TINEYE_API_KEY` (read from process.env — never hardcode). With
 *    no key, `searchTinEye` returns an empty result and a `keyMissing` note.
 * See COMPLIANCE.md for TinEye ToS / attribution + index-retention policy.
 */

import { ReverseImageMatch, ReverseImageResult } from "./types";

// ── Perceptual hash (pHash) — dependency-free near-duplicate fallback ────────────

/**
 * Compute a 64-bit perceptual hash from a pre-extracted 8x8 grayscale luma grid.
 * The caller supplies the downscaled luma (0–255) — image decoding/resizing lives
 * in the worker, not here, to keep this package pure-TS and dependency-free.
 */
export function pHash(luma8x8: number[]): bigint {
  if (luma8x8.length !== 64) {
    throw new Error("pHash expects a 64-value (8x8) luma grid");
  }
  const mean = luma8x8.reduce((a, b) => a + b, 0) / 64;
  let bits = 0n;
  for (let i = 0; i < 64; i++) {
    if (luma8x8[i] >= mean) bits |= 1n << BigInt(i);
  }
  return bits;
}

/** Hamming distance between two 64-bit pHashes (0 = identical, 64 = opposite). */
export function hammingDistance(a: bigint, b: bigint): number {
  let x = a ^ b;
  let count = 0;
  while (x) { count += Number(x & 1n); x >>= 1n; }
  return count;
}

/** Convert Hamming distance (0–64) to a 0–1 similarity. */
export function hammingSimilarity(distance: number): number {
  return parseFloat((1 - distance / 64).toFixed(3));
}

// ── Custom embeddings index ──────────────────────────────────────────────────────

export interface IndexedMedia {
  mediaId: string;
  url: string;
  /** pHash for fallback matching. */
  phash: bigint;
  /** Embedding vector (when img-embed-v0 ships). Empty while stub. */
  embedding?: number[];
  firstSeenAt: string; // ISO-8601
  sourceTitle?: string;
}

/**
 * In-memory vector/pHash index. Production should back this with a real ANN store
 * (pgvector / Qdrant / FAISS). Interface stays the same.
 */
export class ReverseImageIndex {
  private items: IndexedMedia[] = [];

  add(item: IndexedMedia): void { this.items.push(item); }
  size(): number { return this.items.length; }

  /** Cosine similarity between two equal-length vectors. */
  private static cosine(a: number[], b: number[]): number {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
    if (na === 0 || nb === 0) return 0;
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
  }

  /**
   * Search the index. Uses embedding cosine similarity when the query has an
   * embedding AND indexed items do too; otherwise falls back to pHash Hamming.
   */
  search(query: { phash: bigint; embedding?: number[] }, topK = 5, minSimilarity = 0.7): ReverseImageMatch[] {
    const scored = this.items.map((it) => {
      let similarity: number;
      if (query.embedding && it.embedding && query.embedding.length === it.embedding.length) {
        similarity = parseFloat(ReverseImageIndex.cosine(query.embedding, it.embedding).toFixed(3));
      } else {
        similarity = hammingSimilarity(hammingDistance(query.phash, it.phash));
      }
      return { it, similarity };
    });
    return scored
      .filter((s) => s.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map(({ it, similarity }) => ({
        url: it.url,
        sourceTitle: it.sourceTitle,
        publishedAt: it.firstSeenAt,
        similarity,
        isEarlierOccurrence: false, // resolved in fuse() against the query's claimed date
      }));
  }
}

// ── TinEye client (paid API contract) ────────────────────────────────────────────

export interface TinEyeOptions {
  /** Polite override; default reads process.env.TINEYE_API_KEY. */
  apiKey?: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

export interface TinEyeSearchResult {
  matches: ReverseImageMatch[];
  keyMissing: boolean;
  note?: string;
}

/**
 * Query TinEye for prior web appearances of an image.
 * Without a key (or in test/dev), returns an empty result with `keyMissing: true`.
 */
export async function searchTinEye(imageUrl: string, opts: TinEyeOptions = {}): Promise<TinEyeSearchResult> {
  const apiKey = opts.apiKey ?? process.env.TINEYE_API_KEY;
  if (!apiKey) {
    return { matches: [], keyMissing: true, note: "TINEYE_API_KEY not set — reverse web search skipped (stub mode)." };
  }
  const base = opts.baseUrl ?? "https://api.tineye.com/rest";
  const doFetch = opts.fetchImpl ?? fetch;
  try {
    const res = await doFetch(`${base}/search/?image_url=${encodeURIComponent(imageUrl)}`, {
      headers: { "x-api-key": apiKey, "user-agent": "AegisLens/1.0 (+osint-verification)" },
    });
    if (!res.ok) return { matches: [], keyMissing: false, note: `TinEye HTTP ${res.status}` };
    const data = (await res.json()) as { results?: { matches?: Array<{ backlinks?: Array<{ url: string; crawl_date?: string }>; score?: number }> } };
    const matches: ReverseImageMatch[] = [];
    for (const m of data.results?.matches ?? []) {
      for (const bl of m.backlinks ?? []) {
        matches.push({
          url: bl.url,
          publishedAt: bl.crawl_date,
          similarity: typeof m.score === "number" ? m.score / 100 : 0.8,
          isEarlierOccurrence: false,
        });
      }
    }
    return { matches, keyMissing: false };
  } catch (e) {
    return { matches: [], keyMissing: false, note: `TinEye request failed: ${(e as Error).message}` };
  }
}

// ── Fusion ────────────────────────────────────────────────────────────────────────

/**
 * Fuse TinEye + index matches into a single ReverseImageResult, resolving the
 * earliest known occurrence. If any match predates the claimed publish date, that
 * match is flagged `isEarlierOccurrence` — the core "is this recycled footage?" signal.
 */
export function fuseReverseImage(
  mediaId: string,
  claimedPublishedAt: string | undefined,
  tineye: ReverseImageMatch[],
  indexMatches: ReverseImageMatch[],
  startMs: number,
): ReverseImageResult {
  const all = [...tineye, ...indexMatches];
  const claimedMs = claimedPublishedAt ? new Date(claimedPublishedAt).getTime() : undefined;
  for (const m of all) {
    if (claimedMs != null && m.publishedAt) {
      m.isEarlierOccurrence = new Date(m.publishedAt).getTime() < claimedMs - 24 * 3600 * 1000;
    }
  }
  const dated = all.filter((m) => m.publishedAt).sort((a, b) => new Date(a.publishedAt!).getTime() - new Date(b.publishedAt!).getTime());
  return {
    mediaId,
    matches: all.sort((a, b) => b.similarity - a.similarity),
    earliestOccurrence: dated[0],
    processingMs: Date.now() - startMs,
  };
}
