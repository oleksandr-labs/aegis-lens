/**
 * Webhook signature verification helper for use in customer webhook handlers.
 *
 * Usage (Node.js):
 *   import { verifyWebhookSignature } from "@aegis/sdk";
 *   const isValid = verifyWebhookSignature(secret, req.headers, rawBody);
 */

import { createHmac, timingSafeEqual } from "crypto";

const SIGNATURE_HEADER = "x-aegis-signature-256";
const TIMESTAMP_HEADER = "x-aegis-timestamp";

export interface WebhookHeaders {
  [key: string]: string | string[] | undefined;
}

export function verifyWebhookSignature(
  secret: string,
  headers: WebhookHeaders,
  rawBody: string | Buffer,
  toleranceSeconds = 300,
): boolean {
  const sigHeader = headers[SIGNATURE_HEADER];
  const tsHeader = headers[TIMESTAMP_HEADER];

  if (!sigHeader || !tsHeader) return false;

  const signature = Array.isArray(sigHeader) ? sigHeader[0] : sigHeader;
  const timestamp = Array.isArray(tsHeader) ? Number(tsHeader[0]) : Number(tsHeader);

  if (!signature || !Number.isFinite(timestamp)) return false;

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > toleranceSeconds) return false;

  const body = typeof rawBody === "string" ? rawBody : rawBody.toString("utf8");
  const message = `${timestamp}.${body}`;
  const expected = `sha256=${createHmac("sha256", secret).update(message).digest("hex")}`;

  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}
