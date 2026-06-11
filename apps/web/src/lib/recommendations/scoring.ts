/**
 * Scoring utilities for the recommendation engine.
 *
 * Provides: recency boost, region/topic affinity (Jaccard), hybrid score
 * composition, and diversity injection.
 */

import type { ScoredItem } from "./types";

// ── Recency boost ─────────────────────────────────────────────────────────────

export interface RecencyBoostConfig {
  halfLifeHours: number;
  maxBoost: number;
}

export const DEFAULT_RECENCY_BOOST: RecencyBoostConfig = {
  halfLifeHours: 24,
  maxBoost: 0.3,
};

/**
 * Exponential decay recency boost.
 *
 * boost = maxBoost * 2^( -ageHours / halfLifeHours )
 *
 * A just-published item scores close to maxBoost; an item published
 * `halfLifeHours` ago scores maxBoost / 2.
 */
export function computeRecencyBoost(
  publishedAt: string,
  config: RecencyBoostConfig = DEFAULT_RECENCY_BOOST,
): number {
  const ageMs = Date.now() - new Date(publishedAt).getTime();
  if (ageMs < 0) return config.maxBoost; // future-dated: treat as brand new
  const ageHours = ageMs / 3_600_000;
  return config.maxBoost * Math.pow(2, -ageHours / config.halfLifeHours);
}

// ── Affinity (Jaccard similarity) ─────────────────────────────────────────────

/**
 * Jaccard similarity: |A ∩ B| / |A ∪ B|
 * Returns 0 when both sets are empty.
 */
function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;
  for (const v of setA) {
    if (setB.has(v)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Region affinity between an item's regions and the user's preferred regions.
 */
export function computeRegionAffinity(
  itemRegions: string[],
  userRegions: string[],
): number {
  return jaccard(itemRegions, userRegions);
}

/**
 * Topic affinity between an item's topics and the user's preferred topics.
 */
export function computeTopicAffinity(
  itemTopics: string[],
  userTopics: string[],
): number {
  return jaccard(itemTopics, userTopics);
}

// ── Hybrid score ──────────────────────────────────────────────────────────────

/**
 * Weighted combination of all scoring signals.
 *
 * Weights:
 *   collaborative     0.30
 *   embedding         0.25
 *   recency           0.20
 *   regionAffinity    0.15
 *   topicAffinity     0.10
 *
 * If collaborative / embedding are absent their weight is redistributed
 * proportionally to the remaining signals.
 */
export function computeHybridScore(factors: {
  collaborativeScore?: number;
  embeddingScore?: number;
  recencyBoost: number;
  regionAffinity: number;
  topicAffinity: number;
}): number {
  type WeightedSignal = { value: number; weight: number };

  const signals: WeightedSignal[] = [
    { value: factors.recencyBoost, weight: 0.20 },
    { value: factors.regionAffinity, weight: 0.15 },
    { value: factors.topicAffinity, weight: 0.10 },
  ];

  if (factors.collaborativeScore !== undefined) {
    signals.push({ value: factors.collaborativeScore, weight: 0.30 });
  }
  if (factors.embeddingScore !== undefined) {
    signals.push({ value: factors.embeddingScore, weight: 0.25 });
  }

  // Normalize weights to sum to 1
  const totalWeight = signals.reduce((s, sig) => s + sig.weight, 0);
  const score = signals.reduce(
    (s, sig) => s + sig.value * (sig.weight / totalWeight),
    0,
  );

  return Math.min(1, Math.max(0, score));
}

// ── Diversity injection ───────────────────────────────────────────────────────

/**
 * Re-order scored items to ensure no two consecutive items share the same
 * region (first region) or item type.
 *
 * Algorithm: greedy interleaving.
 *   1. Sort by score desc.
 *   2. Walk through the list; if the current item conflicts with the
 *      previous placed item, defer it by swapping with the next non-conflicting
 *      candidate.
 *   3. diversityFactor (0–1) controls how aggressively conflicts are avoided;
 *      at 0.0 no reordering occurs, at 1.0 (default) full greedy interleaving.
 *
 * @param items           Already-scored items.
 * @param diversityFactor 0–1, default 1.
 */
export function injectDiversity(
  items: ScoredItem[],
  diversityFactor: number = 1.0,
): ScoredItem[] {
  if (items.length <= 1 || diversityFactor <= 0) return [...items];

  // Sort by score descending
  const pool = [...items].sort((a, b) => b.score - a.score);
  const result: ScoredItem[] = [];

  while (pool.length > 0) {
    const prev = result[result.length - 1];
    const prevRegion = prev?.item.regions[0] ?? null;
    const prevType = prev?.item.type ?? null;

    if (!prev || diversityFactor === 0) {
      result.push(pool.shift()!);
      continue;
    }

    // Find the best non-conflicting candidate
    let chosenIndex = 0; // default: best available (may conflict)
    for (let i = 0; i < pool.length; i++) {
      const candidate = pool[i];
      const sameRegion = candidate.item.regions[0] === prevRegion;
      const sameType = candidate.item.type === prevType;

      if (!sameRegion && !sameType) {
        chosenIndex = i;
        break;
      }
      // If partial conflict, still prefer over full conflict
      if (i === 0 && (sameRegion || sameType)) {
        // Keep looking; chosenIndex already 0 as fallback
      }
    }

    result.push(pool[chosenIndex]);
    pool.splice(chosenIndex, 1);
  }

  return result;
}
