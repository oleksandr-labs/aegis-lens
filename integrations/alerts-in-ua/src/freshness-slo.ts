/**
 * Source freshness SLO per location (task 11).
 *
 * Distinct from latency-slo.ts (which measures source→device for a single
 * alert): freshness measures how STALE our last successful observation of a
 * location is. If we haven't heard from ANY source about an oblast within its
 * freshness budget, that location is "stale" and the UI must show degraded
 * confidence (we cannot assert "no alert" from silence).
 *
 * Budgets are per tier: a commercial/enterprise feed must refresh faster than a
 * free polling feed.
 */

import type { OblastCode, AlertsInUaTier } from "./types";

/** Max age (ms) a location's last observation may reach before "stale". */
export const FRESHNESS_BUDGET_MS: Record<AlertsInUaTier, number> = {
  free: 45_000,        // 3x the 15s poll cadence
  commercial: 12_000,
  enterprise: 6_000,
};

export type FreshnessState = "fresh" | "aging" | "stale";

export interface FreshnessReport {
  oblastCode: OblastCode;
  lastObservedAt: string;
  ageMs: number;
  budgetMs: number;
  state: FreshnessState;
}

export class FreshnessTracker {
  private lastObserved = new Map<OblastCode, number>();
  private readonly budgetMs: number;

  constructor(tier: AlertsInUaTier = "free") {
    this.budgetMs = FRESHNESS_BUDGET_MS[tier];
  }

  /** Record a successful observation of an oblast from any source. */
  observe(oblastCode: OblastCode, atMs = Date.now()): void {
    const prev = this.lastObserved.get(oblastCode) ?? 0;
    if (atMs > prev) this.lastObserved.set(oblastCode, atMs);
  }

  /** Freshness for one oblast (treats never-seen as maximally stale). */
  report(oblastCode: OblastCode, nowMs = Date.now()): FreshnessReport {
    const last = this.lastObserved.get(oblastCode);
    const ageMs = last === undefined ? Infinity : nowMs - last;
    return {
      oblastCode,
      lastObservedAt: last ? new Date(last).toISOString() : "never",
      ageMs: Number.isFinite(ageMs) ? ageMs : -1,
      budgetMs: this.budgetMs,
      state: this.classify(ageMs),
    };
  }

  /** All oblasts currently breaching their freshness budget. */
  staleOblasts(nowMs = Date.now()): OblastCode[] {
    const out: OblastCode[] = [];
    for (const [code, last] of this.lastObserved) {
      if (this.classify(nowMs - last) === "stale") out.push(code);
    }
    return out;
  }

  private classify(ageMs: number): FreshnessState {
    if (!Number.isFinite(ageMs) || ageMs > this.budgetMs) return "stale";
    if (ageMs > this.budgetMs * 0.6) return "aging";
    return "fresh";
  }
}
