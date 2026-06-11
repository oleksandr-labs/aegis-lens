/**
 * Coordinated-inauthentic-behavior (CIB) heuristics.
 *
 * Detects signs that a set of accounts are acting in concert to push a claim —
 * the structural fingerprint of an info-op — using only behavioural metadata,
 * never the *content's* truth value:
 *
 *   1. Account age — clusters of brand-new accounts amplifying the same claim.
 *   2. Posting cadence — near-simultaneous or robotically regular posting.
 *   3. Text near-duplication — copy-paste / lightly-spun identical messaging.
 *   4. Source-graph structure — many accounts, few origin points (re-share trees).
 *
 * This is a heuristic baseline. A production CIB pipeline would add network
 * embedding + temporal point-process models; the interface here is stable so
 * that can be swapped in. Output is a neutral MisinfoSignal: coordination is a
 * *risk indicator*, not proof a claim is false. Never auto-actioned.
 */

import type { MisinfoSignal } from "./types";

/** Behavioural metadata for one account participating in a claim's spread. */
export interface AccountActivity {
  accountId: string;
  /** Account creation time, ISO-8601 (if known). */
  createdAt?: string;
  /** Time this account posted about the claim, ISO-8601. */
  postedAt: string;
  /** Normalized post text (lowercased, whitespace-collapsed) for dedup. */
  normalizedText?: string;
  /** The accountId this post re-shares from, if it is a re-share. */
  resharedFrom?: string;
}

export interface CoordinatedBehaviorOptions {
  /** Accounts younger than this (days) at post time count as "fresh". */
  freshAccountMaxAgeDays?: number;
  /** Share of fresh accounts that triggers the age signal. */
  freshAccountShareThreshold?: number;
  /** Posts landing within this window (s) count as a synchronized burst. */
  burstWindowSec?: number;
  /** Share of posts inside the tightest burst window to flag cadence. */
  burstShareThreshold?: number;
  /** Jaccard token overlap ≥ this counts two texts as near-duplicates. */
  textDuplicateJaccard?: number;
  /** Minimum participating accounts before any signal fires. */
  minAccounts?: number;
}

const CIB_DEFAULTS: Required<CoordinatedBehaviorOptions> = {
  freshAccountMaxAgeDays: 14,
  freshAccountShareThreshold: 0.5,
  burstWindowSec: 120,
  burstShareThreshold: 0.6,
  textDuplicateJaccard: 0.8,
  minAccounts: 5,
};

function jaccard(a: string, b: string): number {
  const sa = new Set(a.split(/\s+/).filter(Boolean));
  const sb = new Set(b.split(/\s+/).filter(Boolean));
  if (sa.size === 0 || sb.size === 0) return 0;
  let inter = 0;
  for (const t of sa) if (sb.has(t)) inter++;
  return inter / (sa.size + sb.size - inter);
}

export interface CoordinationBreakdown {
  freshAccountShare: number;
  burstShare: number;
  duplicateTextShare: number;
  /** Origin concentration: 1 - (distinct origins / accounts). */
  reshareConcentration: number;
}

/**
 * Analyze a set of accounts amplifying the same claim/narrative.
 * Returns a MisinfoSignal if coordination indicators are present, plus a
 * transparent breakdown so the score is explainable/appealable.
 */
export function detectCoordinatedBehavior(
  activities: AccountActivity[],
  options: CoordinatedBehaviorOptions = {},
): { signal: MisinfoSignal | null; breakdown: CoordinationBreakdown } {
  const opts = { ...CIB_DEFAULTS, ...options };
  const n = activities.length;

  const empty: CoordinationBreakdown = {
    freshAccountShare: 0,
    burstShare: 0,
    duplicateTextShare: 0,
    reshareConcentration: 0,
  };

  if (n < opts.minAccounts) return { signal: null, breakdown: empty };

  // ── 1. Fresh-account share ──────────────────────────────────────────────────
  let freshCount = 0;
  for (const a of activities) {
    if (!a.createdAt) continue;
    const ageDays = (Date.parse(a.postedAt) - Date.parse(a.createdAt)) / 86_400_000;
    if (!Number.isNaN(ageDays) && ageDays >= 0 && ageDays <= opts.freshAccountMaxAgeDays) {
      freshCount++;
    }
  }
  const freshAccountShare = freshCount / n;

  // ── 2. Posting-cadence burst (largest cluster within burstWindow) ────────────
  const times = activities
    .map((a) => Date.parse(a.postedAt))
    .filter((t) => !Number.isNaN(t))
    .sort((x, y) => x - y);
  const windowMs = opts.burstWindowSec * 1000;
  let maxInWindow = 0;
  for (let i = 0; i < times.length; i++) {
    let j = i;
    while (j < times.length && times[j] - times[i] <= windowMs) j++;
    maxInWindow = Math.max(maxInWindow, j - i);
  }
  const burstShare = times.length > 0 ? maxInWindow / times.length : 0;

  // ── 3. Text near-duplication (largest near-dup group) ────────────────────────
  const texts = activities.map((a) => a.normalizedText).filter(Boolean) as string[];
  let maxDupGroup = 0;
  for (let i = 0; i < texts.length; i++) {
    let group = 1;
    for (let j = 0; j < texts.length; j++) {
      if (i !== j && jaccard(texts[i], texts[j]) >= opts.textDuplicateJaccard) group++;
    }
    maxDupGroup = Math.max(maxDupGroup, group);
  }
  const duplicateTextShare = texts.length > 0 ? maxDupGroup / texts.length : 0;

  // ── 4. Re-share concentration ────────────────────────────────────────────────
  const origins = new Set(
    activities.map((a) => a.resharedFrom ?? a.accountId),
  );
  const reshareConcentration = 1 - origins.size / n;

  const breakdown: CoordinationBreakdown = {
    freshAccountShare: parseFloat(freshAccountShare.toFixed(2)),
    burstShare: parseFloat(burstShare.toFixed(2)),
    duplicateTextShare: parseFloat(duplicateTextShare.toFixed(2)),
    reshareConcentration: parseFloat(reshareConcentration.toFixed(2)),
  };

  // ── Aggregate signal ─────────────────────────────────────────────────────────
  const triggers: string[] = [];
  if (freshAccountShare >= opts.freshAccountShareThreshold) {
    triggers.push(`${Math.round(freshAccountShare * 100)}% of accounts are <${opts.freshAccountMaxAgeDays}d old`);
  }
  if (burstShare >= opts.burstShareThreshold) {
    triggers.push(`${Math.round(burstShare * 100)}% of posts within a ${opts.burstWindowSec}s window`);
  }
  if (duplicateTextShare >= 0.5) {
    triggers.push(`${Math.round(duplicateTextShare * 100)}% of posts share near-identical text`);
  }
  if (reshareConcentration >= 0.6) {
    triggers.push(`re-shares trace back to few origins (concentration ${reshareConcentration.toFixed(2)})`);
  }

  if (triggers.length === 0) return { signal: null, breakdown };

  // Confidence = weighted blend of the active indicators, capped at 0.8.
  const raw =
    0.3 * Math.min(1, freshAccountShare / opts.freshAccountShareThreshold) +
    0.3 * Math.min(1, burstShare / opts.burstShareThreshold) +
    0.25 * Math.min(1, duplicateTextShare / 0.5) +
    0.15 * Math.min(1, reshareConcentration / 0.6);
  const confidence = Math.min(0.8, raw);

  return {
    signal: {
      flag: "coordinated_behavior",
      confidence: parseFloat(confidence.toFixed(2)),
      explanation:
        `Possible coordinated activity: ${triggers.join("; ")}. ` +
        `Coordination indicates organized amplification, not necessarily falsehood — surface for review.`,
      sourceIds: activities.map((a) => a.accountId),
    },
    breakdown,
  };
}
