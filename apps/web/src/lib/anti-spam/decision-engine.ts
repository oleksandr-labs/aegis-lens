import "server-only";

/**
 * Central decision engine — aggregates all anti-spam sub-checks and
 * returns a single BotDecision for the request.
 *
 * Usage:
 *   const decision = makeSpamDecision({ form: submissionData });
 *   if (decision !== "allow") rejectRequest(decision);
 */

import { checkHoneypot } from "./honeypot";
import { checkIpReputation } from "./ip-reputation";
import { checkContentSpam } from "./content-spam";
import { checkAccountAbuse, computeBehaviorScore } from "./account-abuse";

import type {
  AccountAbuseCheckInput,
  BotDecision,
  ContentSubmission,
  FormSubmission,
  SpamSignal,
} from "./types";

// ── Thresholds ────────────────────────────────────────────────────────────────

/** Score thresholds that drive the final decision. */
export const DECISION_THRESHOLDS = {
  block:      80,
  quarantine: 60,
  captcha:    40,
} as const;

// ── Input shape ───────────────────────────────────────────────────────────────

/**
 * At least one of the three optional sub-inputs must be supplied.
 * The engine runs every check for which data is present.
 */
export interface SpamDecisionInput {
  /** Form-level data (honeypot, time-on-form, IP/ASN). */
  form?: FormSubmission;
  /** Content-level data (review / comment text and links). */
  content?: ContentSubmission;
  /** Account-level data (email, IP, existing-account count). */
  account?: AccountAbuseCheckInput;
}

// ── Engine ────────────────────────────────────────────────────────────────────

/**
 * Aggregate all available checks and return the most restrictive decision.
 *
 * Score accumulation:
 *  - Each sub-check contributes its signals to a shared set.
 *  - Immediate hard-stops (honeypot) short-circuit to "block" before scoring.
 *  - Final score → decision using DECISION_THRESHOLDS.
 */
export function makeSpamDecision(input: SpamDecisionInput): BotDecision {
  const allSignals: SpamSignal[] = [];

  // ── Form checks ────────────────────────────────────────────────────────────
  if (input.form) {
    const { form } = input;

    // Honeypot — hard block, skip further scoring.
    const honeypot = checkHoneypot(form);
    if (honeypot.triggered) {
      return "block";
    }

    // IP / ASN reputation.
    const ipRep = checkIpReputation(form.ipAddress, form.asnNumber);
    if (!ipRep.clean) {
      allSignals.push(...ipRep.signals);
    }
  }

  // ── Content checks ────────────────────────────────────────────────────────
  if (input.content) {
    const contentResult = checkContentSpam(input.content);
    allSignals.push(...contentResult.signals);

    // If content check alone already recommends block, honour it immediately.
    if (contentResult.decision === "block") {
      return "block";
    }
  }

  // ── Account checks ────────────────────────────────────────────────────────
  if (input.account) {
    const accountResult = checkAccountAbuse(input.account);
    allSignals.push(...accountResult.signals);

    if (accountResult.decision === "block") {
      return "block";
    }
  }

  // ── Aggregate score → decision ────────────────────────────────────────────
  const uniqueSignals = [...new Set(allSignals)] as SpamSignal[];
  const score = computeBehaviorScore(uniqueSignals);

  if (score >= DECISION_THRESHOLDS.block)      return "block";
  if (score >= DECISION_THRESHOLDS.quarantine) return "quarantine";
  if (score >= DECISION_THRESHOLDS.captcha)    return "captcha";
  return "allow";
}
