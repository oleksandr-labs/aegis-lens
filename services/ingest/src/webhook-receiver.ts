/**
 * Webhook receiver for push-based sources.
 *
 * Sources that push events to us (instead of us polling) use this module.
 * Each source has a unique path token + HMAC secret for authentication.
 *
 * Supported push sources:
 *   - Generic HTTP webhook (any JSON payload)
 *   - Telegram Bot updates (via webhook mode)
 *   - Twitter Filtered Stream webhooks (CRC challenge + delivery)
 *   - GitHub Activity webhooks (for public repo monitoring)
 */

import crypto from "crypto";

export type PushSourceType = "generic" | "telegram" | "twitter_crc" | "github";

export interface PushSourceConfig {
  sourceId: string;
  /** URL-safe token for routing: /ingest/webhook/:token */
  token: string;
  /** HMAC secret for signature verification */
  secret: string;
  type: PushSourceType;
  /** Whether this receiver is active */
  isActive: boolean;
  /** ISO-8601 */
  registeredAt: string;
  totalReceived: number;
  lastReceivedAt?: string;
}

// ── In-memory registry (production: Postgres table) ────────────────────────

const _receivers = new Map<string, PushSourceConfig>();

export function registerReceiver(config: Omit<PushSourceConfig, "registeredAt" | "totalReceived">): PushSourceConfig {
  const rec: PushSourceConfig = { ...config, registeredAt: new Date().toISOString(), totalReceived: 0 };
  _receivers.set(config.token, rec);
  return rec;
}

export function getReceiver(token: string): PushSourceConfig | undefined {
  return _receivers.get(token);
}

export function listReceivers(): PushSourceConfig[] {
  return [..._receivers.values()];
}

// ── Signature verification ─────────────────────────────────────────────────

export interface VerificationResult {
  valid: boolean;
  error?: string;
}

export function verifyGenericHmac(payload: Buffer, signature: string, secret: string): VerificationResult {
  const expected = `sha256=${crypto.createHmac("sha256", secret).update(payload).digest("hex")}`;
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    return { valid: false, error: "Signature mismatch" };
  }
  return { valid: true };
}

export function verifyTelegramWebhook(token: string, secret: string): VerificationResult {
  // Telegram uses a hash of the bot token as the secret
  const secretHash = crypto.createHash("sha256").update(secret).digest();
  const expectedToken = crypto.createHmac("sha256", secretHash).update(token).digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(expectedToken), Buffer.from(token))) {
    return { valid: false, error: "Invalid Telegram token" };
  }
  return { valid: true };
}

export function verifyTwitterCRC(crcToken: string, consumerSecret: string): string {
  return "sha256=" + crypto.createHmac("sha256", consumerSecret).update(crcToken).digest("base64");
}

export function verifyGitHubWebhook(payload: Buffer, signature: string, secret: string): VerificationResult {
  const expected = `sha256=${crypto.createHmac("sha256", secret).update(payload).digest("hex")}`;
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    return { valid: false, error: "GitHub signature mismatch" };
  }
  return { valid: true };
}

// ── Payload normalisation ──────────────────────────────────────────────────

export interface NormalisedWebhookPayload {
  sourceId: string;
  sourceType: PushSourceType;
  receivedAt: string;
  raw: unknown;
  /** Best-effort extracted text content */
  text?: string;
  /** Best-effort extracted external ID */
  externalId?: string;
  /** Best-effort extracted timestamp from payload */
  payloadTimestamp?: string;
}

export function normalisePayload(
  config: PushSourceConfig,
  raw: unknown,
): NormalisedWebhookPayload {
  const base: NormalisedWebhookPayload = {
    sourceId: config.sourceId,
    sourceType: config.type,
    receivedAt: new Date().toISOString(),
    raw,
  };

  if (config.type === "telegram" && raw && typeof raw === "object") {
    const update = raw as Record<string, unknown>;
    const message = (update.message ?? update.channel_post) as Record<string, unknown> | undefined;
    if (message) {
      base.text = (message.text ?? message.caption) as string | undefined;
      base.externalId = String(update.update_id);
      const date = message.date;
      if (typeof date === "number") {
        base.payloadTimestamp = new Date(date * 1000).toISOString();
      }
    }
  } else if (config.type === "generic" && raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    base.text = (obj.text ?? obj.content ?? obj.message ?? obj.body) as string | undefined;
    base.externalId = (obj.id ?? obj.event_id) as string | undefined;
    base.payloadTimestamp = (obj.timestamp ?? obj.created_at ?? obj.occurred_at) as string | undefined;
  }

  return base;
}

// ── Demo pre-registered receivers ─────────────────────────────────────────

registerReceiver({
  sourceId: "push-demo-generic",
  token: "demo-generic-token-001",
  secret: process.env.WEBHOOK_RECEIVER_SECRET ?? "dev-secret",
  type: "generic",
  isActive: true,
});
