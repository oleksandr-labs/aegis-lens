/**
 * RFC 8058 one-click unsubscribe support.
 *
 * Gmail and Yahoo (2024 bulk sender requirements) mandate:
 *   1. `List-Unsubscribe` header with https:// and/or mailto: links.
 *   2. `List-Unsubscribe-Post: List-Unsubscribe=One-Click` header.
 *   3. A POST endpoint that processes the unsubscribe within 2 days.
 *
 * Token design:
 *   - HMAC-SHA256 signed (secret: UNSUBSCRIBE_SECRET env var)
 *   - Encodes: email + list + expiresAt
 *   - 30-day expiry (RFC 8058 allows any expiry; 30d is conventional)
 *   - URL-safe base64 encoding
 *
 * RFC 8058 потребує POST-ендпоінту для одним кліком відписки (Gmail / Yahoo).
 */

import { createHmac, randomBytes, timingSafeEqual } from "crypto";

// ── Constants ─────────────────────────────────────────────────────────────────

const UNSUBSCRIBE_SECRET =
  process.env.UNSUBSCRIBE_SECRET ?? "dev-unsub-secret-replace-in-prod";

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://aegislens.com";

// ── Lists ─────────────────────────────────────────────────────────────────────

/**
 * Canonical mailing list identifiers.
 * Each list is unsubscribed independently.
 *
 * Канонічні ідентифікатори списків розсилки для відписки.
 */
export const UNSUBSCRIBE_LISTS: string[] = [
  "marketing",
  "weekly-digest",
  "alerts",
  "product-updates",
];

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UnsubscribeToken {
  /** Recipient email address. */
  email: string;
  /** Mailing list identifier (must be in UNSUBSCRIBE_LISTS). */
  list: string;
  /** URL-safe base64 encoded HMAC token. */
  token: string;
  /** ISO 8601 expiry timestamp. */
  expiresAt: string;
}

// ── Token generation ──────────────────────────────────────────────────────────

/**
 * Generates a signed, expiring unsubscribe token.
 *
 * Token payload (colon-delimited, HMAC-signed):
 *   `<nonce>:<email>:<list>:<expiresAt>`
 *
 * Signature is appended with a `.` separator.
 *
 * @param email - Recipient address.
 * @param list  - Mailing list identifier.
 * @returns UnsubscribeToken with a URL-safe token string.
 *
 * Генерує підписаний токен для відписки.
 */
export function generateUnsubscribeToken(
  email: string,
  list: string,
): UnsubscribeToken {
  const nonce = randomBytes(8).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();
  const payload = `${nonce}:${email.toLowerCase()}:${list}:${expiresAt}`;
  const sig = createHmac("sha256", UNSUBSCRIBE_SECRET)
    .update(payload)
    .digest("base64url");
  const token = Buffer.from(payload).toString("base64url") + "." + sig;

  return {
    email: email.toLowerCase(),
    list,
    token,
    expiresAt,
  };
}

// ── Token verification ────────────────────────────────────────────────────────

/**
 * Verifies a signed unsubscribe token.
 *
 * @param token - The raw token string from the URL query parameter.
 * @returns UnsubscribeToken if valid and unexpired; null otherwise.
 *
 * Верифікує токен відписки — повертає null при невалідному або протермінованому токені.
 */
export function verifyUnsubscribeToken(token: string): UnsubscribeToken | null {
  try {
    const dotIdx = token.lastIndexOf(".");
    if (dotIdx === -1) return null;

    const encodedPayload = token.slice(0, dotIdx);
    const sig = token.slice(dotIdx + 1);

    const payload = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const expectedSig = createHmac("sha256", UNSUBSCRIBE_SECRET)
      .update(payload)
      .digest("base64url");

    // Constant-time comparison to prevent timing attacks
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expectedSig);
    if (
      sigBuf.length !== expectedBuf.length ||
      !timingSafeEqual(sigBuf, expectedBuf)
    ) {
      return null;
    }

    // Parse payload: `nonce:email:list:expiresAt`
    const parts = payload.split(":");
    if (parts.length < 4) return null;

    // nonce is index 0, email index 1, list index 2, expiresAt may contain ':'
    const [, email, list, ...expiryParts] = parts;
    const expiresAt = expiryParts.join(":");

    // Check expiry
    if (Date.now() > new Date(expiresAt).getTime()) return null;

    return { email, list, token, expiresAt };
  } catch {
    return null;
  }
}

// ── Header builder ────────────────────────────────────────────────────────────

/**
 * Builds the RFC 8058 unsubscribe headers for an outgoing email.
 *
 * Headers generated:
 *   List-Unsubscribe: <https://aegislens.com/unsubscribe?token=...>, <mailto:unsubscribe@mail.aegislens.com>
 *   List-Unsubscribe-Post: List-Unsubscribe=One-Click
 *
 * @param email - Recipient address.
 * @param list  - Mailing list identifier.
 * @returns Record of header name → value pairs.
 *
 * Повертає заголовки RFC 8058 для листа з можливістю відписки одним кліком.
 */
export function buildUnsubscribeHeaders(
  email: string,
  list: string,
): Record<string, string> {
  const { token } = generateUnsubscribeToken(email, list);
  const httpsUrl = `${BASE_URL}/api/email/unsubscribe?token=${encodeURIComponent(token)}`;
  const mailtoUrl = `mailto:unsubscribe@mail.aegislens.com?subject=unsubscribe&body=${encodeURIComponent(token)}`;

  return {
    "List-Unsubscribe": `<${httpsUrl}>, <${mailtoUrl}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}
