/**
 * Per-account reputation scoring for curated milbloggers.
 *
 * Each account starts from an EDITORIAL prior (the `reputation` seed in
 * registry.ts). At runtime the score evolves as posts are verified, disputed,
 * or retracted — and is downgraded when the account propagates confirmed
 * misinfo (see misinfo-flag.ts).
 *
 * Formula mirrors services/misinfo/src/source-reputation.ts (Laplace-smoothed),
 * but is seeded from the editorial prior rather than a cold 0.5 start.
 *
 * Scores are transparent and appealable: every change is logged.
 */

import type { MilbloggerAccount, Side } from "./types";

const LAPLACE_PRIOR = 5;

export interface AccountReputation {
  accountId: string;
  side: Side;
  /** Current score 0–1. */
  score: number;
  /** Editorial seed the account was admitted with. */
  editorialPrior: number;
  totalPosts: number;
  verifiedPosts: number;
  disputedPosts: number;
  retractedPosts: number;
  /** Confirmed-misinfo strikes (drives downgrades). */
  misinfoStrikes: number;
  lastUpdatedAt: string;
}

export interface ReputationChange {
  accountId: string;
  from: number;
  to: number;
  reason: string;
  at: string;
}

/** Laplace-smoothed score, anchored toward the editorial prior. */
export function computeAccountScore(
  rep: Omit<AccountReputation, "score" | "lastUpdatedAt">,
): number {
  const total = rep.totalPosts + LAPLACE_PRIOR;
  // Prior contributes a soft positive mass proportional to the editorial seed.
  const positive = rep.verifiedPosts + LAPLACE_PRIOR * rep.editorialPrior;
  const negative = rep.retractedPosts * 2 + rep.disputedPosts + rep.misinfoStrikes * 3;
  const raw = (positive - negative) / total;
  return Math.max(0, Math.min(1, raw));
}

export class ReputationTracker {
  private readonly reps = new Map<string, AccountReputation>();
  private readonly log: ReputationChange[] = [];

  /** Seed every account from its editorial prior in the registry. */
  seedFrom(accounts: MilbloggerAccount[]): void {
    for (const a of accounts) {
      if (this.reps.has(a.id)) continue;
      this.reps.set(a.id, {
        accountId: a.id,
        side: a.side,
        score: a.reputation,
        editorialPrior: a.reputation,
        totalPosts: 0,
        verifiedPosts: 0,
        disputedPosts: 0,
        retractedPosts: 0,
        misinfoStrikes: 0,
        lastUpdatedAt: new Date().toISOString(),
      });
    }
  }

  record(
    accountId: string,
    outcome: "ingested" | "verified" | "disputed" | "retracted" | "misinfo_confirmed",
    side: Side = "int",
  ): AccountReputation {
    const existing = this.reps.get(accountId) ?? {
      accountId,
      side,
      score: 0.5,
      editorialPrior: 0.5,
      totalPosts: 0,
      verifiedPosts: 0,
      disputedPosts: 0,
      retractedPosts: 0,
      misinfoStrikes: 0,
      lastUpdatedAt: new Date().toISOString(),
    };

    const updated: AccountReputation = { ...existing };
    updated.totalPosts++;
    if (outcome === "verified") updated.verifiedPosts++;
    if (outcome === "disputed") updated.disputedPosts++;
    if (outcome === "retracted") updated.retractedPosts++;
    if (outcome === "misinfo_confirmed") updated.misinfoStrikes++;

    const from = existing.score;
    updated.score = computeAccountScore(updated);
    updated.lastUpdatedAt = new Date().toISOString();
    this.reps.set(accountId, updated);

    if (updated.score !== from) {
      this.log.push({
        accountId,
        from,
        to: updated.score,
        reason: outcome,
        at: updated.lastUpdatedAt,
      });
    }
    return updated;
  }

  get(accountId: string): AccountReputation | null {
    return this.reps.get(accountId) ?? null;
  }

  /** Accounts below threshold — candidates for editorial review / suspension. */
  lowReputation(threshold = 0.3): AccountReputation[] {
    return [...this.reps.values()].filter((r) => r.score < threshold);
  }

  changeLog(): ReputationChange[] {
    return [...this.log];
  }

  all(): AccountReputation[] {
    return [...this.reps.values()];
  }
}
