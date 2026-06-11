/**
 * Inbound Telegram webhook verification.
 *
 * Telegram does not HMAC-sign webhook bodies. Instead, when you call
 * `setWebhook` with a `secret_token`, Telegram echoes that token back in the
 * `X-Telegram-Bot-Api-Secret-Token` header on EVERY update it POSTs to your
 * endpoint (Bot API docs, setWebhook → secret_token; 1–256 chars,
 * `[A-Za-z0-9_-]`). Verifying that header is the supported way to ensure an
 * inbound update genuinely came from Telegram and not a forged caller.
 *
 * The secret is read from `process.env.TELEGRAM_WEBHOOK_SECRET` and compared in
 * constant time. We also support an optional IP allow-list (Telegram publishes
 * its webhook CIDRs: 149.154.160.0/20 and 91.108.4.0/22) as defence-in-depth.
 *
 * This module is framework-agnostic: it verifies a `(header, body)` pair and is
 * wired into the Next.js route at
 * `apps/web/src/app/api/integrations/telegram/route.ts`.
 */

import crypto from "node:crypto";
import type { TelegramUpdate } from "./bot-api-client";

export const TELEGRAM_SECRET_HEADER = "x-telegram-bot-api-secret-token";

/** Published Telegram webhook source ranges (defence-in-depth, optional). */
export const TELEGRAM_WEBHOOK_CIDRS = ["149.154.160.0/20", "91.108.4.0/22"] as const;

export interface WebhookConfig {
  /** Echoed secret token configured via setWebhook. Read from env. */
  secret: string;
  /** If true, also require the source IP to fall inside TELEGRAM_WEBHOOK_CIDRS. */
  enforceIpAllowList?: boolean;
}

export type VerifyReason =
  | "ok"
  | "missing_secret_config"
  | "missing_header"
  | "secret_mismatch"
  | "ip_not_allowed"
  | "bad_json";

export interface VerifyResult {
  ok: boolean;
  reason: VerifyReason;
  update?: TelegramUpdate;
}

/** Build config from env; returns null if no secret is configured. */
export function webhookConfigFromEnv(env: NodeJS.ProcessEnv = process.env): WebhookConfig | null {
  const secret = env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) return null;
  return { secret, enforceIpAllowList: env.TELEGRAM_WEBHOOK_ENFORCE_IP === "1" };
}

/** Constant-time string compare (lengths may differ → still constant work). */
export function timingSafeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) {
    // Compare against self to keep timing independent of where they diverge.
    crypto.timingSafeEqual(ab, ab);
    return false;
  }
  return crypto.timingSafeEqual(ab, bb);
}

export class TelegramWebhookVerifier {
  constructor(private readonly config: WebhookConfig) {}

  /**
   * Verify an inbound request. `headers` may be a plain object or a Headers-like
   * `get(name)` source. `rawBody` is the exact POST body string.
   */
  verify(
    headers: HeadersLike,
    rawBody: string,
    opts: { sourceIp?: string } = {},
  ): VerifyResult {
    if (!this.config.secret) return { ok: false, reason: "missing_secret_config" };

    const presented = readHeader(headers, TELEGRAM_SECRET_HEADER);
    if (!presented) return { ok: false, reason: "missing_header" };
    if (!timingSafeEqual(presented, this.config.secret)) {
      return { ok: false, reason: "secret_mismatch" };
    }

    if (this.config.enforceIpAllowList) {
      if (!opts.sourceIp || !ipInAnyCidr(opts.sourceIp, TELEGRAM_WEBHOOK_CIDRS)) {
        return { ok: false, reason: "ip_not_allowed" };
      }
    }

    let update: TelegramUpdate;
    try {
      update = JSON.parse(rawBody) as TelegramUpdate;
    } catch {
      return { ok: false, reason: "bad_json" };
    }

    return { ok: true, reason: "ok", update };
  }
}

export interface HeadersLike {
  get?(name: string): string | null;
  [key: string]: unknown;
}

function readHeader(headers: HeadersLike, name: string): string | null {
  if (typeof headers.get === "function") return headers.get(name);
  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === lower) return Array.isArray(v) ? String(v[0]) : String(v);
  }
  return null;
}

/** IPv4 CIDR membership test (Telegram publishes only IPv4 webhook ranges). */
export function ipInAnyCidr(ip: string, cidrs: readonly string[]): boolean {
  const addr = ipv4ToInt(ip);
  if (addr === null) return false;
  for (const cidr of cidrs) {
    const [net, bitsStr] = cidr.split("/");
    const netInt = ipv4ToInt(net ?? "");
    const bits = Number(bitsStr);
    if (netInt === null || Number.isNaN(bits)) continue;
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    if ((addr & mask) === (netInt & mask)) return true;
  }
  return false;
}

function ipv4ToInt(ip: string): number | null {
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return null;
  let out = 0;
  for (const p of parts) {
    const n = Number(p);
    if (!Number.isInteger(n) || n < 0 || n > 255) return null;
    out = (out << 8) | n;
  }
  return out >>> 0;
}
