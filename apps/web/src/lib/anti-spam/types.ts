/**
 * Core types for the anti-spam / bot-detection module.
 *
 * All checks flow through these shared primitives so every sub-module
 * stays type-safe and can be composed in decision-engine.ts.
 */

// ── Signal enum ───────────────────────────────────────────────────────────────

export type SpamSignal =
  | "honeypot_triggered"
  | "fast_submission"
  | "bad_asn"
  | "bad_ip_rep"
  | "disposable_email"
  | "review_spam"
  | "ai_content"
  | "sockpuppet"
  | "mass_signup"
  | "bad_behavior_score";

// ── Decision enum ─────────────────────────────────────────────────────────────

/** What the engine ultimately does with a request. */
export type BotDecision =
  | "allow"
  | "captcha"
  | "block"
  | "quarantine"
  | "shadow_ban";

// ── Input shapes ──────────────────────────────────────────────────────────────

/** Data collected from any web form submission. */
export interface FormSubmission {
  /** Value of the CSS-hidden honeypot field (empty string if untouched). */
  honeypotValue: string | null;
  /** How long the user spent on the form before submitting (milliseconds). */
  timeOnFormMs: number;
  /** Submitting client IP address. */
  ipAddress: string;
  /** BGP Autonomous System Number of the client, when available. */
  asnNumber?: number;
  /** Raw User-Agent header value. */
  userAgent: string;
  /** Domain portion of the submitter's email, when present. */
  emailDomain?: string;
}

/** Data from a review / comment / post submission. */
export interface ContentSubmission {
  /** Plain-text body of the submission. */
  text: string;
  /** All hyperlinks extracted from the submission. */
  links: string[];
  /** Identifier of the submitting account. */
  authorId: string;
  /** Submitting client IP address. */
  ipAddress: string;
}

/** Data collected during new-account registration. */
export interface AccountSignup {
  /** Full email address supplied by the user. */
  email: string;
  /** Signing-up client IP address. */
  ipAddress: string;
  /** Optional browser fingerprint hash. */
  deviceFingerprint?: string;
  /** Raw User-Agent header value. */
  userAgent: string;
  /** Unix epoch milliseconds when the signup was received. */
  signupTimestampMs: number;
}

// ── Result shape ──────────────────────────────────────────────────────────────

/** The unified result returned by every check function. */
export interface BotCheckResult {
  /** Final verdict for this check. */
  decision: BotDecision;
  /** All triggered signals that contributed to the score. */
  signals: SpamSignal[];
  /** Aggregate abuse score (0–100). */
  score: number;
  /** Human-readable explanation, suitable for internal logs. */
  reason: string;
}
