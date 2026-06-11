/**
 * Cluster KPIs — maturity scoring, build cadence, staleness detection
 * Ukrainian MAP / Aegis Lens — Topical Authority Strategy
 */

import type { ContentClusterId } from "../../content/types";
import type { ClusterKpi, ClusterRefreshPolicy } from "./types";

export interface ClusterKpiTarget {
  clusterId: ContentClusterId;
  /** Target organic share of voice (0–1) */
  targetShareOfVoice: number;
  /** Target quarter string, e.g. "2026-Q3" */
  targetQuarter: string;
}

/** Build-out cadence: aim to complete one mature cluster per quarter */
export const CLUSTER_BUILD_CADENCE = {
  clustersPerQuarter: 1,
  description: "Build out 1 mature cluster / quarter",
} as const;

export interface ClusterMaturityResult {
  mature: boolean;
  /** 0–100 composite score */
  score: number;
  blockers: string[];
}

/**
 * Computes whether a cluster has reached maturity.
 *
 * Maturity criteria (all must be satisfied):
 *  - postCount >= 15
 *  - organicShareOfVoice > 0.05  (i.e. >5%)
 *  - missingSubtopics.length < 5
 */
export function computeClusterMaturity(kpi: ClusterKpi): ClusterMaturityResult {
  const blockers: string[] = [];

  const POST_COUNT_MIN = 15;
  const SOV_MIN = 0.05;
  const MISSING_MAX = 5;

  if (kpi.postCount < POST_COUNT_MIN) {
    blockers.push(
      `Post count too low: ${kpi.postCount} / ${POST_COUNT_MIN} required`
    );
  }

  if (kpi.organicShareOfVoice <= SOV_MIN) {
    blockers.push(
      `Organic share-of-voice too low: ${(kpi.organicShareOfVoice * 100).toFixed(1)}% ≤ ${SOV_MIN * 100}% threshold`
    );
  }

  if (kpi.missingSubtopics.length >= MISSING_MAX) {
    blockers.push(
      `Too many missing sub-topics: ${kpi.missingSubtopics.length} (must be < ${MISSING_MAX})`
    );
  }

  // Score: weighted contribution from each criterion (total 100)
  const postScore = Math.min(kpi.postCount / POST_COUNT_MIN, 1) * 40;
  const sovScore = Math.min(kpi.organicShareOfVoice / SOV_MIN, 1) * 40;
  const coverageScore =
    Math.max(0, 1 - kpi.missingSubtopics.length / MISSING_MAX) * 20;

  const score = Math.round(postScore + sovScore + coverageScore);
  const mature = blockers.length === 0;

  return { mature, score, blockers };
}

/**
 * Returns the slugs/titles of stale content items within a cluster.
 *
 * An item is considered stale if it appears in `kpi.coveredSubtopics` and
 * the last audit date exceeds `policy.staleThresholdDays` from `now`.
 *
 * NOTE: In production this would query per-post `lastUpdatedAt`; here we use
 * `kpi.lastAuditedAt` as a proxy for the entire cluster's freshness.
 */
export function getStaleClusterItems(
  kpi: ClusterKpi,
  policy: ClusterRefreshPolicy,
  now: Date = new Date()
): string[] {
  if (!policy.autoFlagStale) {
    return [];
  }

  const lastAudit = new Date(kpi.lastAuditedAt);
  const daysSinceAudit =
    (now.getTime() - lastAudit.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceAudit < policy.staleThresholdDays) {
    return [];
  }

  // All currently covered sub-topics are considered potentially stale
  return [...kpi.coveredSubtopics];
}
