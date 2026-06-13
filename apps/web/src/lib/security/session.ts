/**
 * Session binding, token rotation, and API key scoping policies.
 *
 * Session binding:
 *   - Fingerprints the device (UA + screen + timezone hash) and IP /24 class
 *   - If the class changes mid-session, forces re-authentication
 *
 * Token rotation:
 *   - Access tokens: 15-minute TTL (RS256 JWT)
 *   - Refresh tokens: 7-day TTL, rotate on every use (prevents replay)
 *   - Refresh tokens stored as bcrypt hash in DB; raw token sent once via httpOnly cookie
 *
 * API key scoping:
 *   - Keys are namespaced by capability (read:events, write:alerts, etc.)
 *   - Hard expiry at 90 days; 7-day grace for rotation
 *
 * Sprint 2.73 — auth security implementation.
 */

import "server-only";

// ── Session binding ───────────────────────────────────────────────────────────

export interface SessionBinding {
  /** SHA-256 of (userAgent + screen resolution + timezone + language) */
  deviceFingerprint: string;
  /** First 3 octets of the client IP — e.g. "203.0.113" (IPv4 /24) */
  ipClass: string;
  boundAt: Date;
  /** Session ID in DB */
  sessionId: string;
  userId: string;
  orgId: string;
}

export interface SessionBindingViolation {
  type: "ip_class_change" | "fingerprint_mismatch";
  bound: string;
  observed: string;
  detectedAt: Date;
}

/**
 * Extracts the /24 IP class from a full IP address string.
 * Handles IPv4 and strips IPv6 for now (TODO: IPv6 /48 class).
 */
export function extractIpClass(ip: string): string {
  // Strip IPv6-mapped IPv4 prefix
  const normalized = ip.replace(/^::ffff:/, "");
  if (normalized.includes(":")) return ip.slice(0, ip.lastIndexOf(":")); // IPv6 — use /64 prefix heuristic
  const parts = normalized.split(".");
  return parts.slice(0, 3).join("."); // IPv4 /24
}

/**
 * Verifies a request's session binding.
 * Returns null if valid, or a violation descriptor if binding is broken.
 */
export function checkSessionBinding(
  binding: SessionBinding,
  requestFingerprint: string,
  requestIp: string,
): SessionBindingViolation | null {
  const requestIpClass = extractIpClass(requestIp);

  if (binding.ipClass !== requestIpClass) {
    return {
      type: "ip_class_change",
      bound: binding.ipClass,
      observed: requestIpClass,
      detectedAt: new Date(),
    };
  }

  // Fingerprint mismatch: soft warning (log but don't hard-block)
  // because browser updates can change UA strings legitimately
  if (binding.deviceFingerprint !== requestFingerprint) {
    return {
      type: "fingerprint_mismatch",
      bound: binding.deviceFingerprint,
      observed: requestFingerprint,
      detectedAt: new Date(),
    };
  }

  return null;
}

/**
 * Compute a device fingerprint from request headers.
 * Client-side can enrich this via navigator properties (separate browser module).
 */
export async function computeDeviceFingerprint(opts: {
  userAgent: string;
  acceptLanguage: string;
  /** Optional: passed from client-side fingerprint module */
  screenHash?: string;
}): Promise<string> {
  const raw = `${opts.userAgent}|${opts.acceptLanguage}|${opts.screenHash ?? ""}`;
  const data = new TextEncoder().encode(raw);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ── Token rotation policy ─────────────────────────────────────────────────────

export type RotationPolicy = "on-use" | "on-interval" | "never";

export interface TokenRotationPolicy {
  /** Duration in seconds */
  accessTokenTTL: number;
  /** Duration in seconds */
  refreshTokenTTL: number;
  /** When to issue a new refresh token */
  rotation: RotationPolicy;
  /**
   * Reuse detection window (seconds).
   * If a refresh token is used twice within this window, it may be a replay attack.
   */
  reuseDetectionWindow: number;
  /** How many active refresh tokens to allow per user session */
  maxConcurrentRefreshTokens: number;
}

export const TOKEN_ROTATION_POLICY: TokenRotationPolicy = {
  accessTokenTTL: 15 * 60,           // 15 minutes
  refreshTokenTTL: 7 * 24 * 60 * 60, // 7 days
  rotation: "on-use",
  reuseDetectionWindow: 10,           // 10-second window; replay = token theft
  maxConcurrentRefreshTokens: 5,      // limit per session
};

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

/**
 * Calculates expiry timestamps for a new token pair.
 */
export function calculateTokenExpiry(policy: TokenRotationPolicy = TOKEN_ROTATION_POLICY): {
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
} {
  const now = Date.now();
  return {
    accessTokenExpiresAt: new Date(now + policy.accessTokenTTL * 1000),
    refreshTokenExpiresAt: new Date(now + policy.refreshTokenTTL * 1000),
  };
}

// ── API key scoping ───────────────────────────────────────────────────────────

/**
 * All recognised API key scopes.
 * Mirrors api-keys-store.ts ALL_SCOPES but adds reporting + admin scopes.
 */
export const API_KEY_SCOPES = [
  "read:events",
  "write:events",
  "read:alerts",
  "write:alerts",
  "read:reports",
  "write:reports",
  "read:aois",
  "write:aois",
  "read:cases",
  "write:cases",
  "read:webhooks",
  "write:webhooks",
  "read:search",
  "read:copilot",
  "read:export",
  "read:analytics",
  "admin:users",
  "admin:billing",
] as const;

export type ApiKeyScope = (typeof API_KEY_SCOPES)[number];

/**
 * Scope sets for common roles.
 * Use these presets when creating keys for specific use cases.
 */
export const API_KEY_SCOPE_PRESETS: Record<string, ApiKeyScope[]> = {
  /** Read-only analyst access */
  read_only: ["read:events", "read:alerts", "read:reports", "read:aois", "read:cases", "read:search"],
  /** Standard integration (read + alert management) */
  standard: ["read:events", "read:alerts", "write:alerts", "read:aois", "read:search", "read:webhooks", "write:webhooks"],
  /** Full access (excluding admin) */
  full_access: [
    "read:events", "write:events",
    "read:alerts", "write:alerts",
    "read:reports", "write:reports",
    "read:aois", "write:aois",
    "read:cases", "write:cases",
    "read:webhooks", "write:webhooks",
    "read:search", "read:copilot", "read:export", "read:analytics",
  ],
};

export interface ApiKeyRotationPolicy {
  /** Maximum key lifetime in days */
  maxAgeDays: number;
  /**
   * Grace period in days after key creation of replacement key,
   * during which both old and new keys are accepted.
   */
  gracePeriodDays: number;
  /** Whether to send email warning before expiry */
  notifyBeforeExpiryDays: number[];
  /** Whether to hard-revoke on expiry (vs soft-disable) */
  hardRevokeOnExpiry: boolean;
}

export const API_KEY_ROTATION_POLICY: ApiKeyRotationPolicy = {
  maxAgeDays: 90,
  gracePeriodDays: 7,
  notifyBeforeExpiryDays: [30, 14, 7, 1],
  hardRevokeOnExpiry: false,            // soft-disable first; hard-revoke after grace
};

/**
 * Check if an API key is within its rotation grace period.
 */
export function isInGracePeriod(
  keyCreatedAt: Date,
  replacementKeyCreatedAt: Date,
  policy: ApiKeyRotationPolicy = API_KEY_ROTATION_POLICY,
): boolean {
  const gracePeriodMs = policy.gracePeriodDays * 24 * 60 * 60 * 1000;
  return Date.now() - replacementKeyCreatedAt.getTime() < gracePeriodMs;
}

/**
 * Returns the number of days until a key expires.
 * Negative value means the key has already expired.
 */
export function daysUntilKeyExpiry(
  keyCreatedAt: Date,
  policy: ApiKeyRotationPolicy = API_KEY_ROTATION_POLICY,
): number {
  const expiryMs = keyCreatedAt.getTime() + policy.maxAgeDays * 24 * 60 * 60 * 1000;
  return Math.floor((expiryMs - Date.now()) / (24 * 60 * 60 * 1000));
}
