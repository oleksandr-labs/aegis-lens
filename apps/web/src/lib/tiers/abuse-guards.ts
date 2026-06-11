import "server-only";

/**
 * Abuse and cost guards for the free tier.
 *
 * Prevents:
 *   - Account farming per IP / device fingerprint
 *   - Disposable-email signups
 *   - Automated scraping via anonymous access
 *
 * Запобігає масовій реєстрації, одноразовим email та автоматичному скрапінгу.
 */

import type { Tier } from "./constants";

// ── Constants ─────────────────────────────────────────────────────────────────

/** Maximum free accounts allowed from a single IP address. */
export const MAX_FREE_ACCOUNTS_PER_IP = 3;

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface AbuseCheckInput {
  /** Caller's IP address (from x-forwarded-for / x-real-ip). */
  ipAddress: string;
  /** Optional browser fingerprint (canvas hash, UA, timezone composite). */
  deviceFingerprint?: string;
  /** Email domain being registered, e.g. "gmail.com" or "mailinator.com". */
  emailDomain?: string;
  /** Number of existing free accounts already linked to this IP. */
  accountCount: number;
  /** Tier of the action being attempted. */
  tier: Tier;
}

export interface AbuseCheckResult {
  allowed: boolean;
  /** Human-readable reason when not allowed. */
  reason?: string;
  /** Recommended enforcement action. */
  action?: "block" | "captcha" | "quarantine";
}

// ── Disposable-email heuristics ───────────────────────────────────────────────

/**
 * Common disposable-email domain patterns and known throwaway services.
 * This is a heuristic — extend with a fuller blocklist in production.
 *
 * Евристика для одноразових поштових сервісів.
 */
const DISPOSABLE_DOMAIN_PATTERNS: RegExp[] = [
  /mailinator/i,
  /guerrillamail/i,
  /throwam/i,
  /tempmail/i,
  /sharklasers/i,
  /guerrillamailblock/i,
  /grr\.la/i,
  /spam4\.me/i,
  /trashmail/i,
  /dispostable/i,
  /maildrop/i,
  /yopmail/i,
  /fakeinbox/i,
  /10minutemail/i,
  /minute60mail/i,
  /getairmail/i,
  /spamgourmet/i,
  /anonaddy/i,
  /simplelogin/i, // relay services — require extra verification, not full block
];

const HARD_BLOCKED_DOMAINS = new Set<string>([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "throwam.com",
  "tempmail.com",
  "yopmail.com",
  "trashmail.com",
  "dispostable.com",
  "maildrop.cc",
  "fakeinbox.com",
  "10minutemail.com",
  "spam4.me",
  "sharklasers.com",
  "grr.la",
]);

/**
 * Returns `true` if the domain matches known disposable-email services.
 *
 * @param domain — just the domain part, e.g. "mailinator.com"
 */
export function isDisposableEmailDomain(domain: string): boolean {
  const normalized = domain.toLowerCase().trim();
  if (HARD_BLOCKED_DOMAINS.has(normalized)) return true;
  return DISPOSABLE_DOMAIN_PATTERNS.some((re) => re.test(normalized));
}

// ── Main abuse guard ──────────────────────────────────────────────────────────

/**
 * Run all abuse checks in order of severity.
 *
 * Short-circuits on first violation — most severe checks first.
 *
 * Запускає всі перевірки зловживань у порядку від найважчого до легкого.
 */
export function checkAbuseGuards(input: AbuseCheckInput): AbuseCheckResult {
  const { ipAddress, deviceFingerprint, emailDomain, accountCount, tier } =
    input;

  // 1. IP account farming — hard block
  if (accountCount >= MAX_FREE_ACCOUNTS_PER_IP) {
    return {
      allowed: false,
      reason: `Maximum ${MAX_FREE_ACCOUNTS_PER_IP} free accounts per IP address reached (${ipAddress}).`,
      action: "block",
    };
  }

  // 2. Disposable email domain — block before account is created
  if (emailDomain && isDisposableEmailDomain(emailDomain)) {
    return {
      allowed: false,
      reason: `Disposable email domain "${emailDomain}" is not allowed. Please use a permanent email address.`,
      action: "block",
    };
  }

  // 3. Device fingerprint matches a known-blocked device — quarantine
  //    Production: cross-check fingerprint against quarantine list in DB.
  //    Here we only check for obviously invalid/empty fingerprints.
  if (deviceFingerprint !== undefined && deviceFingerprint.trim() === "") {
    return {
      allowed: false,
      reason: "Invalid device fingerprint. Browser may be misconfigured or scripted.",
      action: "captcha",
    };
  }

  // 4. Anonymous users attempting paid-tier actions — require sign-in
  if (tier === "anonymous") {
    // Anonymous users are always subject to rate limiting; no account block needed here.
    // Specific routes enforce the "must sign in for Copilot" rule via middleware.
    return { allowed: true };
  }

  return { allowed: true };
}
