import "server-only";

/**
 * Account-level abuse detection.
 *
 * Checks for disposable emails, mass-signup patterns, and computes a
 * weighted behavior score from accumulated signals.
 *
 * NOTE: existingAccountCount must be supplied by the caller from the DB —
 * this module is stateless and performs no database queries itself.
 */

import type { BotCheckResult, SpamSignal } from "./types";

// ── Constants ─────────────────────────────────────────────────────────────────

/** Maximum legitimate accounts allowed from a single IP. */
export const MAX_ACCOUNTS_PER_IP = 3 as const;

/** Maximum legitimate accounts allowed from a single device fingerprint. */
export const MAX_ACCOUNTS_PER_DEVICE = 3 as const;

/** Score thresholds that map to each BotDecision. */
export const BEHAVIOR_SCORE_THRESHOLDS = {
  block:      80,
  quarantine: 60,
  captcha:    40,
} as const;

// ── Disposable-email domains ──────────────────────────────────────────────────

/**
 * Known disposable / temporary email service patterns.
 * Checked as exact domain matches or suffix patterns.
 */
const DISPOSABLE_EXACT_DOMAINS: ReadonlySet<string> = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamail.biz",
  "guerrillamail.de",
  "guerrillamail.info",
  "10minutemail.com",
  "10minutemail.net",
  "10minutemail.org",
  "throwam.com",
  "yopmail.com",
  "yopmail.fr",
  "tempmail.com",
  "tempmail.net",
  "dispostable.com",
  "sharklasers.com",
  "guerrillamailblock.com",
  "grr.la",
  "spam4.me",
  "trashmail.com",
  "trashmail.me",
  "trashmail.net",
  "trashmail.org",
  "mailnull.com",
  "spamgourmet.com",
  "spamgourmet.net",
  "spamgourmet.org",
  "spamgourmet.com",
  "maildrop.cc",
  "discard.email",
  "fakeinbox.com",
  "mailnesia.com",
  "mailnull.com",
  "spamfree24.org",
  "spamfree.eu",
  "spamhere.net",
  "spaml.de",
  "spammotel.com",
  "spamspot.com",
  "spamstack.net",
  "spaml.de",
  "crapmail.org",
  "getonemail.com",
  "getonemail.net",
  "inboxalias.com",
  "mailbidon.com",
  "mailbiz.biz",
  "mailblocks.com",
  "mailbucket.org",
  "mailcatch.com",
  "mailexcite.com",
  "mailfreeonline.com",
  "mailguard.me",
  "mailhazard.com",
  "mailhazard.us",
  "mailimport.com",
  "mailinator2.com",
  "mailme.ir",
  "mailme24.com",
  "mailmoth.com",
  "mailnew.com",
  "mailnowfree.com",
  "mailnull.com",
  "mailpick.biz",
  "mailplease.com",
  "mailproxsy.com",
  "mailquack.com",
  "mailrock.biz",
  "mailseal.de",
  "mailshell.com",
  "mailsiphon.com",
  "mailslapping.com",
  "mailslite.com",
  "mailspeed.net",
  "mailspam.me",
  "mailsuckz.com",
  "mailtemporary.com",
  "mailternative.com",
  "mailtome.de",
  "mailtothis.com",
  "mailtrash.net",
  "mailtv.net",
  "mailtv.tv",
  "mailzilla.com",
  "mailzilla.org",
  "mailzilla.orgmbx.cc",
  "mfsa.ru",
  "mguard.net",
  "moncourrier.fr.nf",
  "monemail.fr.nf",
  "monmail.fr.nf",
  "mt2009.com",
  "mt2014.com",
  "mt2015.com",
  "mytrashmail.com",
  "noblepioneer.com",
  "nomail.pw",
  "nomail.xl.cx",
  "nomail2me.com",
  "nospam.ze.tc",
  "nospam4.us",
  "nospamfor.us",
  "nospamthanks.info",
  "notmailinator.com",
  "nowmymail.com",
  "nwldx.com",
  "objectmail.com",
  "obobbo.com",
  "odaymail.com",
  "odnorazovaya.ru",
  "oneoffemail.com",
  "oneoffmail.com",
  "onewaymail.com",
  "online.ms",
  "onlinemail.io",
  "oopi.org",
  "ordinaryamerican.net",
  "ownmail.net",
  "ownsys.com",
  "pecinan.com",
  "pecinan.net",
  "pecinan.org",
  "pepbot.com",
  "pfui.ru",
  "pimpedupmyspace.com",
  "plexolan.de",
  "pookmail.com",
  "proxymail.eu",
]);

/** Disposable-email domain name patterns (substring match on the domain). */
const DISPOSABLE_DOMAIN_PATTERNS: RegExp[] = [
  /^mailinator/i,
  /^trashmail/i,
  /^temp(mail)?/i,
  /^disposable/i,
  /^throwaway/i,
  /^yopmail/i,
  /^guerrilla/i,
  /^10minute/i,
  /spam/i,
  /^fakemailgen/i,
  /^junk/i,
  /throwam/i,
];

// ── Public helpers ────────────────────────────────────────────────────────────

/**
 * Returns `true` when the email address belongs to a known disposable /
 * temporary email service.
 */
export function isDisposableEmail(email: string): boolean {
  const lower = email.toLowerCase().trim();
  const atIndex = lower.lastIndexOf("@");
  if (atIndex === -1) return false;

  const domain = lower.slice(atIndex + 1);
  if (DISPOSABLE_EXACT_DOMAINS.has(domain)) return true;
  return DISPOSABLE_DOMAIN_PATTERNS.some((re) => re.test(domain));
}

// ── Signal-weight map ─────────────────────────────────────────────────────────

/**
 * How many score points each signal contributes.
 * Weights are additive; total is capped at 100.
 */
const SIGNAL_WEIGHTS: Record<SpamSignal, number> = {
  honeypot_triggered:  40,
  fast_submission:     30,
  bad_asn:             20,
  bad_ip_rep:          25,
  disposable_email:    35,
  review_spam:         25,
  ai_content:          20,
  sockpuppet:          50,
  mass_signup:         40,
  bad_behavior_score:  30,
};

/**
 * Computes a 0–100 abuse score by summing the weights of all supplied signals.
 */
export function computeBehaviorScore(signals: SpamSignal[]): number {
  const raw = signals.reduce((acc, s) => acc + (SIGNAL_WEIGHTS[s] ?? 10), 0);
  return Math.min(raw, 100);
}

// ── Input type ────────────────────────────────────────────────────────────────

/** Input for checkAccountAbuse. */
export interface AccountAbuseCheckInput {
  /** IP address used during signup. */
  ipAddress: string;
  /** Optional browser/device fingerprint hash. */
  deviceFingerprint?: string;
  /** Count of existing accounts already linked to this IP or fingerprint. */
  existingAccountCount: number;
  /** Email address supplied at signup. */
  email: string;
}

// ── Main check ────────────────────────────────────────────────────────────────

/**
 * Evaluates an account signup for abuse signals.
 *
 * @returns BotCheckResult — decision, signals, score, and reason.
 */
export function checkAccountAbuse(input: AccountAbuseCheckInput): BotCheckResult {
  const { existingAccountCount, email } = input;
  const signals: SpamSignal[] = [];
  const reasons: string[] = [];

  // Disposable / throwaway email.
  if (isDisposableEmail(email)) {
    signals.push("disposable_email");
    reasons.push(`Email domain "${email.split("@")[1]}" is a known disposable service.`);
  }

  // Too many accounts from this IP / device.
  if (existingAccountCount >= MAX_ACCOUNTS_PER_IP) {
    signals.push("mass_signup");
    reasons.push(
      `${existingAccountCount} existing accounts exceed the per-IP limit of ${MAX_ACCOUNTS_PER_IP}.`,
    );
  }

  const score = computeBehaviorScore(signals);

  const decision =
    score >= BEHAVIOR_SCORE_THRESHOLDS.block      ? "block"
    : score >= BEHAVIOR_SCORE_THRESHOLDS.quarantine ? "quarantine"
    : score >= BEHAVIOR_SCORE_THRESHOLDS.captcha    ? "captcha"
    : "allow";

  return {
    decision,
    signals,
    score,
    reason: reasons.length > 0 ? reasons.join(" ") : "Account signup passed abuse checks.",
  };
}
