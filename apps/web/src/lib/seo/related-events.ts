/**
 * Related-events ranking via lightweight feature-vector cosine similarity.
 *
 * The existing `/events/[id]/related` page uses three independent filters
 * (same class / same region / same 48h window). This module unifies those into
 * a single ranked list driven by a feature vector, so every event page can show
 * one "Related events" block ordered by relevance — the basis of the
 * internal-link cluster between event pages.
 *
 * Pure + deterministic (no embeddings service needed): the vector is built from
 * structured event fields. Integration point: when a real embedding store
 * lands, swap {@link eventVector} for the stored embedding and keep
 * {@link rankRelatedEvents} unchanged (it only needs a `vectorFor` fn).
 */

export type RelatableEvent = {
  eventId: string;
  class: string;
  subclass: string | null;
  /** ISO timestamp. */
  occurredAt: string;
  location: { lat: number; lon: number };
  dangerScore: number;
  tags?: string[];
};

export type Scored<T> = { item: T; score: number };

/** Days between two ISO timestamps (absolute). */
function dayGap(aIso: string, bIso: string): number {
  return Math.abs(Date.parse(aIso) - Date.parse(bIso)) / 86_400_000;
}

/** Great-circle-ish distance proxy in degrees (cheap, monotonic). */
function geoDist(a: RelatableEvent, b: RelatableEvent): number {
  const dLat = a.location.lat - b.location.lat;
  const dLon = a.location.lon - b.location.lon;
  return Math.sqrt(dLat * dLat + dLon * dLon);
}

/**
 * Build a sparse feature vector keyed by feature name. Keeps it interpretable:
 *   class:<cls>, subclass:<sub>, tag:<t>  → categorical one-hot (weighted)
 * Numeric proximity (time/geo) is handled separately in {@link similarity}
 * because cosine over one-hot alone can't express "near in space/time".
 */
export function eventVector(e: RelatableEvent): Map<string, number> {
  const v = new Map<string, number>();
  v.set(`class:${e.class}`, 1);
  if (e.subclass) v.set(`subclass:${e.subclass}`, 0.7);
  for (const t of e.tags ?? []) v.set(`tag:${t}`, 0.5);
  return v;
}

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const [k, va] of a) {
    na += va * va;
    const vb = b.get(k);
    if (vb !== undefined) dot += va * vb;
  }
  for (const vb of b.values()) nb += vb * vb;
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export type SimilarityWeights = {
  /** Categorical cosine weight. */
  vector: number;
  /** Temporal proximity weight (decays over `timeHalfLifeDays`). */
  time: number;
  /** Geographic proximity weight (decays over `geoHalfLifeDeg`). */
  geo: number;
  timeHalfLifeDays: number;
  geoHalfLifeDeg: number;
};

export const DEFAULT_WEIGHTS: SimilarityWeights = {
  vector: 0.6,
  time: 0.25,
  geo: 0.15,
  timeHalfLifeDays: 7,
  geoHalfLifeDeg: 2,
};

/** Exponential decay → 1 at distance 0, 0.5 at the half-life. */
function decay(distance: number, halfLife: number): number {
  if (halfLife <= 0) return distance === 0 ? 1 : 0;
  return Math.pow(0.5, distance / halfLife);
}

/** Combined similarity in [0,1]. */
export function similarity(
  a: RelatableEvent,
  b: RelatableEvent,
  w: SimilarityWeights = DEFAULT_WEIGHTS,
): number {
  const vec = cosine(eventVector(a), eventVector(b));
  const t = decay(dayGap(a.occurredAt, b.occurredAt), w.timeHalfLifeDays);
  const g = decay(geoDist(a, b), w.geoHalfLifeDeg);
  const total = w.vector + w.time + w.geo || 1;
  return (w.vector * vec + w.time * t + w.geo * g) / total;
}

/**
 * Rank related events for `target` from a candidate pool. Excludes the target
 * itself and any zero-similarity items. Stable tie-break on recency.
 */
export function rankRelatedEvents(
  target: RelatableEvent,
  pool: RelatableEvent[],
  limit = 6,
  w: SimilarityWeights = DEFAULT_WEIGHTS,
): Scored<RelatableEvent>[] {
  return pool
    .filter((e) => e.eventId !== target.eventId)
    .map((e) => ({ item: e, score: similarity(target, e, w) }))
    .filter((s) => s.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        Date.parse(b.item.occurredAt) - Date.parse(a.item.occurredAt),
    )
    .slice(0, limit);
}
