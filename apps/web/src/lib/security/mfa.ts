/**
 * MFA enforcement policy for Aegis Lens.
 *
 * Tier requirements:
 *   free       — MFA optional (encouraged)
 *   pro        — TOTP required on login
 *   enterprise — TOTP + FIDO2/WebAuthn required; SMS only as backup
 *
 * Integration target: WorkOS / Clerk MFA APIs.
 * Sprint 2.73 — auth security implementation.
 */

import "server-only";

// ── Types ─────────────────────────────────────────────────────────────────────

export type UserTier = "free" | "pro" | "enterprise";

export type MFAMethod = "totp" | "webauthn" | "sms_backup";

export interface MFARequirement {
  required: boolean;
  allowedMethods: MFAMethod[];
  minimumMethods: number;
  /** If true, user cannot access paid features until MFA is enrolled */
  blocksAccess: boolean;
  gracePeriodDays: number | null;
}

export interface MFAConfig {
  /** Enrollment status for a specific user */
  enrolledMethods: MFAMethod[];
  lastVerifiedAt: Date | null;
  /** Re-verification interval in minutes (0 = never re-prompt) */
  reVerifyIntervalMinutes: number;
  backupCodesRemaining: number;
}

export interface MFAEnrollment {
  userId: string;
  method: MFAMethod;
  enrolledAt: Date;
  deviceName?: string;
  /** FIDO2 credential ID (WebAuthn only) */
  credentialId?: string;
  /** TOTP issuer label */
  totpLabel?: string;
}

export interface MFAChallengeResult {
  passed: boolean;
  method: MFAMethod;
  verifiedAt: Date;
  /** Amr (Authentication Method References) claim for JWT */
  amrClaim: string;
}

// ── Tier policy ───────────────────────────────────────────────────────────────

const TIER_POLICIES: Record<UserTier, MFARequirement> = {
  free: {
    required: false,
    allowedMethods: ["totp", "webauthn", "sms_backup"],
    minimumMethods: 0,
    blocksAccess: false,
    gracePeriodDays: null,
  },
  pro: {
    required: true,
    allowedMethods: ["totp", "webauthn", "sms_backup"],
    minimumMethods: 1,
    blocksAccess: true,
    gracePeriodDays: 7, // 7-day grace after upgrade before MFA is enforced
  },
  enterprise: {
    required: true,
    allowedMethods: ["totp", "webauthn"],          // SMS not allowed at enterprise tier
    minimumMethods: 2,                              // Must have TOTP + FIDO2
    blocksAccess: true,
    gracePeriodDays: 3,
  },
};

// ── Core enforcement ──────────────────────────────────────────────────────────

/**
 * Returns the MFA requirement for a given billing tier.
 *
 * Example:
 *   const req = enforceMfaForTier("enterprise");
 *   // => { required: true, allowedMethods: ["totp","webauthn"], minimumMethods: 2, ... }
 */
export function enforceMfaForTier(tier: UserTier): MFARequirement {
  return TIER_POLICIES[tier] ?? TIER_POLICIES.free;
}

/**
 * Checks whether a user's current enrollment satisfies their tier policy.
 */
export function isMfaCompliant(tier: UserTier, enrolled: MFAMethod[]): boolean {
  const policy = enforceMfaForTier(tier);
  if (!policy.required) return true;

  const validMethods = enrolled.filter((m) => policy.allowedMethods.includes(m));
  return validMethods.length >= policy.minimumMethods;
}

/**
 * Returns what additional methods must be enrolled to become compliant.
 */
export function getMfaGap(tier: UserTier, enrolled: MFAMethod[]): MFAMethod[] {
  const policy = enforceMfaForTier(tier);
  if (!policy.required) return [];

  const need = policy.minimumMethods - enrolled.filter((m) => policy.allowedMethods.includes(m)).length;
  if (need <= 0) return [];

  // Prefer WebAuthn for enterprise
  const preferred: MFAMethod[] = tier === "enterprise"
    ? ["webauthn", "totp"]
    : ["totp", "webauthn"];

  return preferred.filter((m) => !enrolled.includes(m)).slice(0, need);
}

/**
 * AMR claim values per method (RFC 8176).
 */
export const AMR_CLAIMS: Record<MFAMethod, string> = {
  totp: "otp",
  webauthn: "hwk",    // hardware key
  sms_backup: "sms",
};

/**
 * Re-verify interval per tier (minutes).
 * Enterprise sessions must re-challenge after 60 minutes of inactivity.
 */
export const REVERIFY_INTERVAL_MINUTES: Record<UserTier, number> = {
  free: 0,
  pro: 240,         // 4 hours
  enterprise: 60,   // 1 hour
};

// ── WorkOS integration stub ───────────────────────────────────────────────────

/**
 * Trigger MFA enrollment via WorkOS MFA API.
 *
 * Production: POST https://api.workos.com/auth/factors/enroll
 * with { type: "totp" | "webauthn", user_id }
 *
 * @see https://workos.com/docs/user-management/mfa
 */
export async function triggerMfaEnrollment(
  userId: string,
  method: MFAMethod,
): Promise<{ enrollmentUrl: string; factorId: string }> {
  // TODO: replace with real WorkOS SDK call
  // const workos = new WorkOS(process.env.WORKOS_API_KEY);
  // const factor = await workos.userManagement.enrollAuthFactor({ userId, type: method });
  void userId; void method;
  return {
    enrollmentUrl: "https://auth.aegislens.io/mfa/enroll",
    factorId: "factor_placeholder",
  };
}
