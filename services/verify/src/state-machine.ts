/**
 * Verification state machine for canonical events.
 *
 * States:
 *   ingested → enriched → corroborated → verified
 *                      ↘                ↘
 *                       disputed ←------→ retracted
 *
 * Transitions are guarded by thresholds; all transitions are logged.
 */

export type VState = "ingested" | "enriched" | "corroborated" | "verified" | "disputed" | "retracted";

export interface Transition {
  from: VState;
  to: VState;
  actor: string;
  reason: string;
  timestamp: string;
}

export interface StateTransitionResult {
  allowed: boolean;
  newState?: VState;
  transition?: Transition;
  error?: string;
}

/** Which transitions are valid */
const ALLOWED: Partial<Record<VState, VState[]>> = {
  ingested: ["enriched", "retracted"],
  enriched: ["corroborated", "disputed", "retracted"],
  corroborated: ["verified", "disputed", "retracted"],
  verified: ["disputed", "retracted"],
  disputed: ["corroborated", "verified", "retracted"],
  retracted: [], // terminal
};

export function canTransition(from: VState, to: VState): boolean {
  return (ALLOWED[from] ?? []).includes(to);
}

export function transition(
  currentState: VState,
  targetState: VState,
  actor: string,
  reason: string,
): StateTransitionResult {
  if (!canTransition(currentState, targetState)) {
    return {
      allowed: false,
      error: `Transition ${currentState} → ${targetState} is not allowed.`,
    };
  }

  const t: Transition = {
    from: currentState,
    to: targetState,
    actor,
    reason,
    timestamp: new Date().toISOString(),
  };

  return { allowed: true, newState: targetState, transition: t };
}

/**
 * Determines the target state based on automated scoring.
 * Does NOT write; returns the recommended transition for the pipeline to apply.
 */
export function recommendTransition(
  currentState: VState,
  confidence: number,
  sourceCount: number,
  hasHITLApproval: boolean,
  thresholds: VerificationThresholds,
): VState | null {
  if (currentState === "retracted") return null;

  if (hasHITLApproval && canTransition(currentState, "verified")) {
    return "verified";
  }

  if (currentState === "enriched" && sourceCount >= thresholds.corroborationMinSources && confidence >= thresholds.corroborationMinConfidence) {
    return "corroborated";
  }

  if (currentState === "corroborated" && confidence >= thresholds.verificationMinConfidence && sourceCount >= thresholds.verificationMinSources) {
    return "verified";
  }

  if (confidence < thresholds.disputeMaxConfidence && currentState !== "ingested") {
    return "disputed";
  }

  return null;
}

export interface VerificationThresholds {
  corroborationMinSources: number;
  corroborationMinConfidence: number;
  verificationMinSources: number;
  verificationMinConfidence: number;
  disputeMaxConfidence: number;
}

export const DEFAULT_THRESHOLDS: VerificationThresholds = {
  corroborationMinSources: 2,
  corroborationMinConfidence: 0.6,
  verificationMinSources: 3,
  verificationMinConfidence: 0.8,
  disputeMaxConfidence: 0.25,
};
