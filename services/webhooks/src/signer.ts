/**
 * HMAC-SHA256 webhook payload signing.
 *
 * Signature format: "sha256=<hex>" — matches Stripe / GitHub convention.
 * Includes timestamp to prevent replay attacks (5-minute tolerance).
 */

import { createHmac, timingSafeEqual } from "crypto";

export const SIGNATURE_HEADER = "x-aegis-signature-256";
export const TIMESTAMP_HEADER = "x-aegis-timestamp";
export const IDEMPOTENCY_HEADER = "x-aegis-delivery-id";

export function signPayload(secret: string, timestamp: number, body: string): string {
  const message = `${timestamp}.${body}`;
  const sig = createHmac("sha256", secret).update(message).digest("hex");
  return `sha256=${sig}`;
}

export function verifySignature(
  secret: string,
  signature: string,
  timestamp: number,
  body: string,
  toleranceSeconds = 300,
): boolean {
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > toleranceSeconds) return false;

  const expected = signPayload(secret, timestamp, body);
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function buildHeaders(
  secret: string,
  deliveryId: string,
  body: string,
): Record<string, string> {
  const timestamp = Math.floor(Date.now() / 1000);
  return {
    "Content-Type": "application/json",
    [TIMESTAMP_HEADER]: String(timestamp),
    [SIGNATURE_HEADER]: signPayload(secret, timestamp, body),
    [IDEMPOTENCY_HEADER]: deliveryId,
    "User-Agent": "AegisLens-Webhooks/1.0",
  };
}
