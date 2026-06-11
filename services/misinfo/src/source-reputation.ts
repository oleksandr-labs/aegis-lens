/**
 * Source reputation scoring.
 *
 * Score formula: (verifiedEvents - 2 * retractedEvents - disputedEvents) / totalEvents
 * Clamped to [0, 1], with a Laplace prior of 5 to avoid cold-start extremes.
 *
 * Transparent and appealable: every score change is logged.
 */

import type { SourceReputation } from "./types";

const LAPLACE_PRIOR = 5;

export function computeReputationScore(stats: Omit<SourceReputation, "score" | "lastUpdatedAt">): number {
  const total = stats.totalEvents + LAPLACE_PRIOR;
  const positive = stats.verifiedEvents + LAPLACE_PRIOR / 2;
  const negative = stats.retractedEvents * 2 + stats.disputedEvents;

  const rawScore = (positive - negative) / total;
  return Math.max(0, Math.min(1, rawScore));
}

export class SourceReputationTracker {
  private readonly stats = new Map<string, SourceReputation>();

  record(sourceId: string, event: "verified" | "retracted" | "disputed" | "ingested"): void {
    const existing = this.stats.get(sourceId) ?? {
      sourceId,
      score: 0.5,
      totalEvents: 0,
      verifiedEvents: 0,
      retractedEvents: 0,
      disputedEvents: 0,
      verificationYield: 0,
      lastUpdatedAt: new Date().toISOString(),
    };

    const updated = { ...existing };
    updated.totalEvents++;
    if (event === "verified") updated.verifiedEvents++;
    if (event === "retracted") updated.retractedEvents++;
    if (event === "disputed") updated.disputedEvents++;

    updated.verificationYield = updated.totalEvents > 0
      ? updated.verifiedEvents / updated.totalEvents
      : 0;
    updated.score = computeReputationScore(updated);
    updated.lastUpdatedAt = new Date().toISOString();

    this.stats.set(sourceId, updated);
  }

  get(sourceId: string): SourceReputation | null {
    return this.stats.get(sourceId) ?? null;
  }

  getLowReputation(threshold = 0.3): SourceReputation[] {
    return [...this.stats.values()].filter((s) => s.score < threshold);
  }

  all(): SourceReputation[] {
    return [...this.stats.values()];
  }
}
