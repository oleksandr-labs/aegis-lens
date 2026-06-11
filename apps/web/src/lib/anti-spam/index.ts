/**
 * Public API for the anti-spam / bot-detection module.
 *
 * Import from this barrel to access all types, constants, and functions:
 *
 *   import { makeSpamDecision, checkHoneypot, isDisposableEmail } from "@/lib/anti-spam";
 */

// ── Types ─────────────────────────────────────────────────────────────────────
export type {
  SpamSignal,
  BotDecision,
  FormSubmission,
  ContentSubmission,
  AccountSignup,
  BotCheckResult,
} from "./types";

// ── Honeypot ──────────────────────────────────────────────────────────────────
export {
  HONEYPOT_FIELD_NAME,
  HONEYPOT_MIN_TIME_MS,
  checkHoneypot,
  getHoneypotFieldName,
} from "./honeypot";

// ── IP reputation ─────────────────────────────────────────────────────────────
export {
  BAD_ASN_LIST,
  checkIpReputation,
  isBadAsn,
  isPrivateIp,
} from "./ip-reputation";

// ── Content spam ──────────────────────────────────────────────────────────────
export {
  SPAM_LINK_THRESHOLD,
  REPETITIVE_PHRASE_MIN_LEN,
  AI_CONTENT_HEURISTICS,
  checkContentSpam,
  hasAiContentSignals,
} from "./content-spam";

// ── Account abuse ─────────────────────────────────────────────────────────────
export type { AccountAbuseCheckInput } from "./account-abuse";
export {
  MAX_ACCOUNTS_PER_IP,
  MAX_ACCOUNTS_PER_DEVICE,
  BEHAVIOR_SCORE_THRESHOLDS,
  isDisposableEmail,
  computeBehaviorScore,
  checkAccountAbuse,
} from "./account-abuse";

// ── WAF rules ─────────────────────────────────────────────────────────────────
export type {
  WafRule,
  CloudflareWafRules,
  TurnstileAction,
} from "./waf-rules";
export {
  WAF_CONFIG_SPEC,
  TURNSTILE_ACTIONS,
} from "./waf-rules";

// ── Decision engine ───────────────────────────────────────────────────────────
export type { SpamDecisionInput } from "./decision-engine";
export {
  DECISION_THRESHOLDS,
  makeSpamDecision,
} from "./decision-engine";
