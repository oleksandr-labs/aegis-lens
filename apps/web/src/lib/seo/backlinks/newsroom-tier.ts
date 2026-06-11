/**
 * Newsroom subscription tier — free Observer access for verified press.
 * Verification: domain-check against known press outlet domains.
 */

import { PRESS_RELATIONSHIPS, type PressOutlet } from "./press-relationships";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NewsroomTierConfig {
  /** Percentage discount applied to subscription (100 = fully free). */
  discountPct: number;
  /** Tier ID granted on successful verification. */
  grantedTierId: string;
  /** Whether human verification is required in addition to domain check. */
  verificationRequired: boolean;
  /** Verification method used. */
  verificationMethod: "domain-check" | "manual" | "press-card";
}

export interface NewsroomVerificationResult {
  isVerified: boolean;
  matchedOutlet?: PressOutlet;
  reason: string;
}

// ── Config ────────────────────────────────────────────────────────────────────

/**
 * Default newsroom tier: 100% free (Observer) for verified press organisations.
 * Verification is automatic via email-domain check against PRESS_RELATIONSHIPS.
 */
export const NEWSROOM_TIER_CONFIG: NewsroomTierConfig = {
  discountPct: 100,
  grantedTierId: "newsroom-observer",
  verificationRequired: false,
  verificationMethod: "domain-check",
};

/**
 * Secondary tier for freelance journalists requiring manual press-card review.
 */
export const FREELANCE_JOURNALIST_TIER_CONFIG: NewsroomTierConfig = {
  discountPct: 100,
  grantedTierId: "newsroom-freelance",
  verificationRequired: true,
  verificationMethod: "press-card",
};

// ── Derived data ──────────────────────────────────────────────────────────────

/**
 * All domains extracted from PRESS_RELATIONSHIPS for fast email-domain lookup.
 * Only outlets with a `domain` field set are included.
 */
export const VERIFIED_PRESS_DOMAINS: Set<string> = new Set(
  PRESS_RELATIONSHIPS.filter((o): o is PressOutlet & { domain: string } => !!o.domain).map(
    (o) => o.domain.toLowerCase(),
  ),
);

// ── Functions ─────────────────────────────────────────────────────────────────

/**
 * Checks if an email address belongs to a verified press outlet.
 * Uses the domain portion of the email against VERIFIED_PRESS_DOMAINS.
 *
 * @example
 * isVerifiedPressEmail("editor@ft.com") // true
 * isVerifiedPressEmail("user@gmail.com") // false
 */
export function isVerifiedPressEmail(email: string): boolean {
  const parts = email.toLowerCase().split("@");
  if (parts.length !== 2) return false;
  const domain = parts[1];
  // Exact domain match
  if (VERIFIED_PRESS_DOMAINS.has(domain)) return true;
  // Sub-domain match: e.g. reporter@news.bbc.com → parent bbc.com
  for (const pressDomain of VERIFIED_PRESS_DOMAINS) {
    if (domain.endsWith(`.${pressDomain}`)) return true;
  }
  return false;
}

/**
 * Full verification check with matched outlet info and reason string.
 */
export function verifyPressEmail(email: string): NewsroomVerificationResult {
  const parts = email.toLowerCase().split("@");
  if (parts.length !== 2) {
    return { isVerified: false, reason: "Invalid email format" };
  }
  const domain = parts[1];
  const matched = PRESS_RELATIONSHIPS.find(
    (o) => o.domain && (domain === o.domain.toLowerCase() || domain.endsWith(`.${o.domain.toLowerCase()}`)),
  );
  if (matched) {
    return {
      isVerified: true,
      matchedOutlet: matched,
      reason: `Domain matched to verified outlet: ${matched.name}`,
    };
  }
  return {
    isVerified: false,
    reason: "Email domain not found in verified press outlet list",
  };
}

/**
 * Returns the tier config applicable to a given email.
 * Falls back to null if not a press email.
 */
export function getTierForEmail(email: string): NewsroomTierConfig | null {
  if (isVerifiedPressEmail(email)) return NEWSROOM_TIER_CONFIG;
  return null;
}
