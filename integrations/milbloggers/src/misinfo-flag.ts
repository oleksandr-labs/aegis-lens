/**
 * Auto-flag accounts that propagate CONFIRMED misinfo → downgrade reputation.
 *
 * This bridges the curated registry to the platform misinfo service
 * (`services/misinfo/`). When that service confirms a post as misinfo (a
 * DisputedBadge whose human review concluded `confirmed_misinfo`, or a
 * `low_source_reputation` signal), the propagating account takes a reputation
 * strike here.
 *
 * Conservative by design: we only downgrade on CONFIRMED misinfo (human-reviewed),
 * never on an un-reviewed automated suspicion. This mirrors the misinfo service's
 * own "never auto-retract, only caveat" stance (services/misinfo/src/disputed-badge.ts).
 */

import type { ReputationTracker } from "./reputation";
import type { Side } from "./types";

/**
 * Minimal shape mirrored from services/misinfo/src/types.ts so this package does
 * not hard-depend on the service at build time. The real service emits these.
 */
export interface MisinfoVerdict {
  /** Post that was reviewed. */
  postId: string;
  /** Account that propagated it. */
  accountId: string;
  side: Side;
  /** Outcome of HUMAN review in the misinfo service. */
  humanReviewStatus: "pending" | "cleared" | "confirmed_misinfo";
  /** Aggregate suspicion score from the DisputedBadge, 0–1. */
  suspicionScore: number;
  reviewedAt: string;
}

export interface MisinfoStrike {
  accountId: string;
  postId: string;
  side: Side;
  newReputation: number;
  at: string;
}

/**
 * Apply a misinfo verdict. Only `confirmed_misinfo` (human-reviewed) downgrades.
 * Returns the strike if one was applied, else null.
 */
export function applyMisinfoVerdict(
  verdict: MisinfoVerdict,
  reputation: ReputationTracker,
): MisinfoStrike | null {
  if (verdict.humanReviewStatus !== "confirmed_misinfo") return null;

  const updated = reputation.record(verdict.accountId, "misinfo_confirmed", verdict.side);
  return {
    accountId: verdict.accountId,
    postId: verdict.postId,
    side: verdict.side,
    newReputation: updated.score,
    at: new Date().toISOString(),
  };
}

/**
 * Accounts whose reputation has fallen below the suspension floor after strikes —
 * surfaced to editors for review or removal from the active pipeline.
 */
export function accountsForEditorialReview(
  reputation: ReputationTracker,
  suspensionFloor = 0.15,
): { accountId: string; side: Side; score: number }[] {
  return reputation
    .all()
    .filter((r) => r.misinfoStrikes > 0 && r.score < suspensionFloor)
    .map((r) => ({ accountId: r.accountId, side: r.side, score: r.score }));
}
