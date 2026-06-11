/**
 * Task (Common) — Author / channel reputation scoring (Reddit per-author side).
 *
 * The generic, source-agnostic reputation engine lives in
 * `integrations/youtube/src/reputation.ts` (see its header for the home-choice
 * rationale). This module is the thin Reddit adapter: it maps Reddit-specific
 * signals (account-age from `created_utc`, comment/post karma, verified status,
 * subreddit moderation strictness) onto the shared `ReputationSignals` contract
 * and re-exports the scorer so Reddit callers don't import across packages by
 * accident.
 */

import {
  scoreReputation,
  reputationToSourceWeight,
  type ReputationSignals,
  type ReputationScore,
} from "../../youtube/src/reputation";
import type { RedditSubreddit } from "./types";

export type { ReputationSignals, ReputationScore };
export { reputationToSourceWeight };

/** Reddit-specific account facts used to derive reputation signals. */
export interface RedditAuthorFacts {
  authorId: string; // username
  /** UNIX seconds of account creation (Reddit `created_utc`). */
  accountCreatedUtc?: number;
  /** Combined link+comment karma (a coarse longevity/trust proxy). */
  totalKarma?: number;
  /** Reddit "verified" / employee / special distinguish. */
  verified?: boolean;
  /** Corroboration track record, if the platform has accumulated it. */
  corroboratedCount?: number;
  contradictedCount?: number;
  retractionCount?: number;
  totalItems?: number;
}

/**
 * Build the shared `ReputationSignals` from Reddit facts. The subreddit the
 * author posts in supplies the editorial prior (a stricter, higher-reliability
 * subreddit lends its moderation weight to the author).
 */
export function redditSignals(
  facts: RedditAuthorFacts,
  subreddit?: RedditSubreddit,
  now: number = Date.now(),
): ReputationSignals {
  const accountAgeDays =
    facts.accountCreatedUtc !== undefined
      ? Math.max(0, (now / 1000 - facts.accountCreatedUtc) / 86_400)
      : undefined;

  return {
    authorId: facts.authorId,
    registryReliability: subreddit?.reliability,
    accountAgeDays,
    // High karma OR explicit verification → treat identity as established.
    verified: facts.verified ?? (facts.totalKarma ?? 0) > 50_000,
    corroboratedCount: facts.corroboratedCount,
    contradictedCount: facts.contradictedCount,
    retractionCount: facts.retractionCount,
    totalItems: facts.totalItems,
  };
}

/** Convenience: score a Reddit author directly from their facts. */
export function scoreRedditAuthor(
  facts: RedditAuthorFacts,
  subreddit?: RedditSubreddit,
  now: number = Date.now(),
): ReputationScore {
  return scoreReputation(redditSignals(facts, subreddit, now));
}
