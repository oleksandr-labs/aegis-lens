/**
 * Editorial vetting gate.
 *
 * NO account enters the registry without passing this gate. The cluster is
 * editorially curated — anonymous accounts WITHOUT a demonstrable track record
 * are rejected. RU-side accounts MUST carry an opposition label.
 *
 * This module encodes the admission CRITERIA as code so the standard is
 * auditable and identical for every editor. It does not auto-admit; it produces
 * a decision an editor signs off on.
 */

import type { MilbloggerAccount } from "./types";

export interface VettingCriteria {
  /** Minimum track-record description length (proxy for "documented"). */
  minTrackRecordChars: number;
  /** Minimum editorial reputation prior to admit at all. */
  minReputationPrior: number;
  /** Anonymous accounts must clear a higher reputation bar. */
  anonymousMinReputationPrior: number;
}

export const DEFAULT_CRITERIA: VettingCriteria = {
  minTrackRecordChars: 20,
  minReputationPrior: 0.2,
  anonymousMinReputationPrior: 0.6,
};

export interface VettingResult {
  accountId: string;
  admit: boolean;
  failures: string[];
  warnings: string[];
}

/**
 * Evaluate a candidate against the editorial criteria.
 * Returns admit=false with explicit failures if any hard rule is violated.
 */
export function vetAccount(
  candidate: MilbloggerAccount,
  criteria: VettingCriteria = DEFAULT_CRITERIA,
): VettingResult {
  const failures: string[] = [];
  const warnings: string[] = [];

  // Track record is mandatory and must be substantive.
  if (!candidate.trackRecord || candidate.trackRecord.trim().length < criteria.minTrackRecordChars) {
    failures.push("Missing or insufficient documented track record.");
  }

  // Anonymous-without-track-record is the explicit disqualifier.
  if (candidate.anonymous && candidate.reputation < criteria.anonymousMinReputationPrior) {
    failures.push(
      "Anonymous account without an established track record (does not clear the anonymous reputation bar).",
    );
  }

  if (candidate.reputation < criteria.minReputationPrior) {
    failures.push("Editorial reputation prior below admission floor.");
  }

  // No false equivalence: RU-side accounts MUST be labelled as opposition.
  if (candidate.side === "ru" && !candidate.oppositionLabel) {
    failures.push(
      "RU-side account is missing the mandatory opposition label (opposite-narrative tracking only).",
    );
  }

  // ua/int accounts must NOT carry an opposition label (would mislabel them).
  if (candidate.side !== "ru" && candidate.oppositionLabel) {
    failures.push("Non-RU account must not carry an opposition label.");
  }

  // Editor sign-off must be present.
  if (!candidate.vettedBy || !candidate.vettedAt) {
    failures.push("Missing editor sign-off (vettedBy / vettedAt).");
  }

  if (candidate.tags.length === 0) {
    warnings.push("No specialty tags assigned — routing/corroboration will be coarse.");
  }

  return {
    accountId: candidate.id,
    admit: failures.length === 0,
    failures,
    warnings,
  };
}

/** Vet a batch; returns only the admitted accounts plus the rejection report. */
export function vetBatch(
  candidates: MilbloggerAccount[],
  criteria: VettingCriteria = DEFAULT_CRITERIA,
): { admitted: MilbloggerAccount[]; rejected: VettingResult[] } {
  const admitted: MilbloggerAccount[] = [];
  const rejected: VettingResult[] = [];
  for (const c of candidates) {
    const result = vetAccount(c, criteria);
    if (result.admit) admitted.push(c);
    else rejected.push(result);
  }
  return { admitted, rejected };
}
