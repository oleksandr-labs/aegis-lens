/**
 * Task (Common) — Author / channel reputation scoring.
 *
 * HOME CHOICE: this task is shared between YouTube (per-channel) and Reddit
 * (per-author). The *scoring math* is source-agnostic, so the generic engine
 * lives here (the youtube package has no extra deps and is the natural home for
 * "channel reputation"). Reddit gets a thin per-author wrapper in
 * `integrations/reddit/src/reputation.ts` that maps Reddit signals onto the same
 * `ReputationSignals`/`ReputationScore` contract defined here. This keeps one
 * formula and avoids duplicating the weighting logic in two packages.
 *
 * Reputation differs from the registry's static `reliability` (1–5): registry
 * reliability is an editorial allow-list weight; reputation here is a *dynamic*
 * score that blends that editorial prior with observed track-record signals
 * (account age, corroboration rate, retraction rate, engagement quality).
 */

/** Source-agnostic inputs to the reputation model. */
export interface ReputationSignals {
  /** Stable author/channel id. */
  authorId: string;
  /** Editorial prior from the curated registry (1–5), if listed; else undefined. */
  registryReliability?: 1 | 2 | 3 | 4 | 5;
  /** Account/channel age in days (older ⇒ more trust, with diminishing returns). */
  accountAgeDays?: number;
  /** Verified identity (blue check / official / journalist). */
  verified?: boolean;
  /** # of this author's claims later corroborated by independent sources. */
  corroboratedCount?: number;
  /** # of this author's claims later contradicted / debunked. */
  contradictedCount?: number;
  /** # of posts the author deleted/retracted after publishing. */
  retractionCount?: number;
  /** Total ingested items from this author (denominator for rates). */
  totalItems?: number;
}

export interface ReputationScore {
  authorId: string;
  /** Final 0–1 reputation. */
  score: number;
  /** Bucketed band for UI / gating. */
  band: "untrusted" | "low" | "moderate" | "high" | "trusted";
  /** Sub-scores for transparency. */
  components: {
    editorialPrior: number;
    track: number;
    longevity: number;
    identity: number;
  };
}

/** Weights for blending the sub-scores (sum to 1). */
export const REPUTATION_WEIGHTS = {
  editorialPrior: 0.4,
  track: 0.35,
  longevity: 0.15,
  identity: 0.1,
} as const;

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/** Compute a dynamic reputation score from blended signals. */
export function scoreReputation(s: ReputationSignals): ReputationScore {
  // Editorial prior: registry 1–5 → 0–1; unlisted authors get a neutral-low 0.3.
  const editorialPrior = s.registryReliability ? s.registryReliability / 5 : 0.3;

  // Track record: corroboration rate minus penalties for contradiction/retraction.
  const total = Math.max(s.totalItems ?? 0, (s.corroboratedCount ?? 0) + (s.contradictedCount ?? 0));
  const corroborationRate = total > 0 ? (s.corroboratedCount ?? 0) / total : 0;
  const contradictionRate = total > 0 ? (s.contradictedCount ?? 0) / total : 0;
  const retractionRate = total > 0 ? (s.retractionCount ?? 0) / total : 0;
  // Start neutral (0.5) when no track record exists yet.
  const track =
    total === 0
      ? 0.5
      : clamp01(0.5 + corroborationRate * 0.5 - contradictionRate * 0.8 - retractionRate * 0.4);

  // Longevity: saturating curve — 0 at 0d, ~0.9 at ~2y.
  const ageDays = s.accountAgeDays ?? 0;
  const longevity = clamp01(1 - Math.exp(-ageDays / 365));

  const identity = s.verified ? 1 : 0.3;

  const score = clamp01(
    editorialPrior * REPUTATION_WEIGHTS.editorialPrior +
      track * REPUTATION_WEIGHTS.track +
      longevity * REPUTATION_WEIGHTS.longevity +
      identity * REPUTATION_WEIGHTS.identity,
  );

  return {
    authorId: s.authorId,
    score: Math.round(score * 1000) / 1000,
    band: toBand(score),
    components: {
      editorialPrior: round3(editorialPrior),
      track: round3(track),
      longevity: round3(longevity),
      identity: round3(identity),
    },
  };
}

function toBand(score: number): ReputationScore["band"] {
  if (score < 0.25) return "untrusted";
  if (score < 0.45) return "low";
  if (score < 0.65) return "moderate";
  if (score < 0.85) return "high";
  return "trusted";
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/**
 * Maps a reputation score to the `sourceWeight` the canonical adapter expects
 * (so reputation can override / refine the static registry weight downstream).
 */
export function reputationToSourceWeight(score: ReputationScore): number {
  return score.score;
}
