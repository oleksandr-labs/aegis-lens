/**
 * TASK 2 — Verification threshold.
 *
 * A movement report may only be considered verified when it has:
 *   - ≥ 2 INDEPENDENT sources (distinct domains, not the same outlet re-posted), AND
 *   - at least one piece of MEDIA corroboration (photo / video / satellite).
 *
 * Fail-closed: missing either condition → not verified, with typed reasons.
 */

export interface VerificationThreshold {
  /** Minimum count of independent sources. */
  minIndependentSources: number;
  /** Whether media corroboration is mandatory. */
  requireMediaCorroboration: boolean;
}

export const DEFAULT_VERIFICATION_THRESHOLD: VerificationThreshold = {
  minIndependentSources: 2,
  requireMediaCorroboration: true,
};

export type VerificationFailReason =
  | "insufficient_independent_sources"
  | "no_media_corroboration";

export interface VerificationResult {
  verified: boolean;
  independentSourceCount: number;
  hasMediaCorroboration: boolean;
  reasons: VerificationFailReason[];
}

/**
 * Count INDEPENDENT sources by unique registrable host. Two URLs on the same
 * host count once (a single outlet is not two independent sources).
 */
export function countIndependentSources(sourceUrls: string[] = []): number {
  const hosts = new Set<string>();
  for (const url of sourceUrls) {
    try {
      const h = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
      if (h) hosts.add(h);
    } catch {
      // Unparseable URL is not a usable independent source — skip.
    }
  }
  return hosts.size;
}

/** Check a report's sources + media against the verification threshold. */
export function checkVerification(
  input: { sourceUrls?: string[]; mediaUrls?: string[] },
  threshold: VerificationThreshold = DEFAULT_VERIFICATION_THRESHOLD,
): VerificationResult {
  const independentSourceCount = countIndependentSources(input.sourceUrls);
  const hasMediaCorroboration = !!input.mediaUrls && input.mediaUrls.length > 0;

  const reasons: VerificationFailReason[] = [];
  if (independentSourceCount < threshold.minIndependentSources) {
    reasons.push("insufficient_independent_sources");
  }
  if (threshold.requireMediaCorroboration && !hasMediaCorroboration) {
    reasons.push("no_media_corroboration");
  }

  return {
    verified: reasons.length === 0,
    independentSourceCount,
    hasMediaCorroboration,
    reasons,
  };
}
