/**
 * Embedding-space drift detection (new topic emerging).
 *
 * Beyond volume spikes, a *qualitatively new* kind of report is itself an early
 * signal — a topic the baseline has never seen. We track a rolling reference set
 * of recent event embeddings per region; an incoming embedding that sits far
 * from every reference point (low max cosine similarity to neighbours) is
 * "novel" and may indicate an emerging topic.
 *
 * This is a nearest-neighbour novelty heuristic, not a clustering model — it is
 * cheap, online, and explainable. Embeddings are produced upstream (NLP service).
 * No external dependencies.
 */

export interface DriftConfig {
  /** Max reference embeddings retained per region (ring buffer). */
  referenceSize?: number;
  /**
   * Novelty threshold: if the best cosine similarity to the reference set is
   * BELOW this, the point is "novel". Lower = stricter (fewer novelty flags).
   */
  noveltySimilarityThreshold?: number;
  /** Min reference points before novelty can fire (warm-up). */
  minReference?: number;
}

const D_DEFAULTS: Required<DriftConfig> = {
  referenceSize: 256,
  noveltySimilarityThreshold: 0.55,
  minReference: 30,
};

export interface DriftResult {
  /** True if the incoming embedding is novel vs the reference set. */
  isNovel: boolean;
  /** Best cosine similarity found against the reference set (0 if empty). */
  maxSimilarity: number;
  /** Mean similarity to the reference set (drift magnitude proxy). */
  meanSimilarity: number;
  /** Reference set size at evaluation time. */
  referenceSize: number;
}

function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

/**
 * Per-region rolling embedding-drift detector.
 * Call `observe()` for every incoming event embedding; it returns whether the
 * point is novel, THEN folds the point into the reference set.
 */
export class EmbeddingDriftDetector {
  private readonly refs = new Map<string, number[][]>();
  private readonly opts: Required<DriftConfig>;

  constructor(config: DriftConfig = {}) {
    this.opts = { ...D_DEFAULTS, ...config };
  }

  /** Evaluate novelty for a region, then add the embedding to the reference set. */
  observe(region: string, embedding: number[]): DriftResult {
    const result = this.evaluate(region, embedding);
    this.add(region, embedding);
    return result;
  }

  /** Evaluate novelty without mutating the reference set. */
  evaluate(region: string, embedding: number[]): DriftResult {
    const ref = this.refs.get(region) ?? [];
    if (embedding.length === 0 || ref.length < this.opts.minReference) {
      return { isNovel: false, maxSimilarity: 0, meanSimilarity: 0, referenceSize: ref.length };
    }
    let max = -1;
    let sum = 0;
    for (const r of ref) {
      const s = cosine(embedding, r);
      if (s > max) max = s;
      sum += s;
    }
    const meanSimilarity = sum / ref.length;
    return {
      isNovel: max < this.opts.noveltySimilarityThreshold,
      maxSimilarity: parseFloat(max.toFixed(3)),
      meanSimilarity: parseFloat(meanSimilarity.toFixed(3)),
      referenceSize: ref.length,
    };
  }

  /** Add an embedding to a region's rolling reference set. */
  add(region: string, embedding: number[]): void {
    if (embedding.length === 0) return;
    let ref = this.refs.get(region);
    if (!ref) {
      ref = [];
      this.refs.set(region, ref);
    }
    ref.push(embedding);
    if (ref.length > this.opts.referenceSize) ref.shift();
  }

  regions(): string[] {
    return [...this.refs.keys()];
  }
}
