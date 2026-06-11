/**
 * Privacy & consent helpers.
 *
 * Client-safe — used by both server route handlers and client-side consent UI.
 * No "server-only" guard: the consent check must run on the client too so we
 * don't fire tracking before the user accepts.
 */

// ── Types ─────────────────────────────────────────────────────────────────

export type PrivacyRegion = "gdpr" | "eprivacy" | "uk_gdpr" | "ccpa";

export interface PrivacyPolicy {
  noPersonalDataInAnalytics: boolean;
  noFingerprinting: boolean;
  dntRespected: boolean;
  regions: PrivacyRegion[];
}

// ── Default policy ────────────────────────────────────────────────────────

/** Maximum-privacy default: respects all regions and every privacy flag. */
export const DEFAULT_PRIVACY_POLICY: PrivacyPolicy = {
  noPersonalDataInAnalytics: true,
  noFingerprinting: true,
  dntRespected: true,
  regions: ["gdpr", "eprivacy", "uk_gdpr", "ccpa"],
};

// ── shouldTrack ───────────────────────────────────────────────────────────

/**
 * Determine whether analytics tracking is allowed for this request.
 *
 * Rules (in order):
 * 1. If `policy.dntRespected` and the DNT header is "1" → no tracking.
 * 2. If the relevant region requires consent and the consent flag is absent
 *    or false → no tracking.
 * 3. Otherwise → tracking allowed.
 *
 * @param req    - Object with a `Headers`-compatible `.headers` and a consent flags map.
 * @param region - The privacy region to evaluate.
 * @param policy - Defaults to `DEFAULT_PRIVACY_POLICY`.
 */
export function shouldTrack(
  req: { headers: Headers; consentFlags: Record<string, boolean> },
  region: PrivacyRegion,
  policy: PrivacyPolicy = DEFAULT_PRIVACY_POLICY,
): boolean {
  // 1. DNT
  if (policy.dntRespected && req.headers.get("dnt") === "1") {
    return false;
  }

  // 2. Region-specific consent
  if (policy.regions.includes(region)) {
    const consentKey = `analytics_consent_${region}`;
    if (!req.consentFlags[consentKey]) {
      return false;
    }
  }

  return true;
}

// ── stripPii ──────────────────────────────────────────────────────────────

/** PII field names to remove from analytics payloads (case-insensitive match). */
const PII_KEYS: ReadonlySet<string> = new Set([
  "email",
  "name",
  "ip",
  "firstname",
  "first_name",
  "lastname",
  "last_name",
  "phone",
  "address",
  "dob",
  "date_of_birth",
  "ssn",
  "password",
]);

/**
 * Remove known PII keys from an analytics payload.
 * Shallow — nested objects are left intact (use deep clone + recursive call
 * if deeper scrubbing is needed).
 *
 * @param payload - Raw event payload.
 * @returns A new object without PII keys.
 */
export function stripPii(
  payload: Record<string, unknown>,
): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (!PII_KEYS.has(key.toLowerCase())) {
      clean[key] = value;
    }
  }
  return clean;
}
