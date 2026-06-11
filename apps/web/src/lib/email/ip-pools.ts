/**
 * IP pool configuration for per-traffic-type email sending.
 *
 * Pool isolation is non-negotiable for email deliverability because:
 *   1. Reputation is per-IP, not per-domain alone. A single high-bounce campaign
 *      sending from a shared IP will blacklist that IP for ALL messages, including
 *      critical alerts and password resets.
 *   2. Gmail / Yahoo sender guidelines (2024+) require bulk senders to maintain
 *      < 0.1% spam rate. Mixing transactional + marketing raises this rate for
 *      transactional mail unfairly.
 *   3. Warm-up requirements differ: transactional starts at low volume, scales
 *      conservatively; marketing needs aggressive warm-up on dedicated IPs.
 *   4. Regulatory separation: marketing requires unsubscribe headers (RFC 8058)
 *      and CAN-SPAM / GDPR consent tracking. Transactional does not. Mixing them
 *      muddies compliance.
 *
 * Ізоляція IP-пулів є обов'язковою: репутація залежить від IP, тому один
 * маркетинговий збій не повинен впливати на доставку критичних сповіщень.
 */

import "server-only";
import { EmailSubdomain } from "./subdomains";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface IpPoolConfig {
  /** Unique identifier for the pool (used in provider API calls). */
  poolId: string;
  /** Which subdomain this pool serves. */
  subdomain: EmailSubdomain;
  /**
   * Dedicated IP address assigned to this pool.
   * Undefined = uses provider's shared pool (for very low volume / warm-up phase).
   */
  dedicatedIp?: string;
  /**
   * Provider shared pool name (e.g. Resend pool ID or Postmark Message Stream).
   * Only set when dedicatedIp is not yet provisioned.
   */
  sharedPool?: string;
  /** Primary sending provider for this pool. */
  provider: "resend" | "postmark";
  /** Maximum emails per day for this pool (enforced in warmup-plan.ts). */
  maxDailyVolume: number;
}

// ── Pool catalogue ────────────────────────────────────────────────────────────

/**
 * Four pools, one per traffic type. Each pool maps to a distinct API key,
 * so rate limits and reputation metrics are fully isolated.
 *
 * Env vars are listed in IP_POOL_ENV_VARS below.
 */
export const IP_POOL_CONFIGS: IpPoolConfig[] = [
  {
    poolId: "transactional",
    subdomain: EmailSubdomain.TRANSACTIONAL,
    dedicatedIp: undefined, // provision after 30-day warm-up
    sharedPool: process.env.RESEND_TRANSACTIONAL_STREAM ?? "transactional",
    provider: "resend",
    maxDailyVolume: 50_000,
  },
  {
    poolId: "marketing",
    subdomain: EmailSubdomain.MARKETING,
    dedicatedIp: undefined,
    sharedPool: process.env.RESEND_MARKETING_STREAM ?? "marketing",
    provider: "resend",
    maxDailyVolume: 200_000,
  },
  {
    poolId: "alerts",
    subdomain: EmailSubdomain.ALERTS,
    dedicatedIp: undefined,
    sharedPool: process.env.RESEND_ALERTS_STREAM ?? "alerts",
    provider: "resend",
    maxDailyVolume: 10_000,
  },
  {
    poolId: "system",
    subdomain: EmailSubdomain.SYSTEM,
    sharedPool: process.env.POSTMARK_SYSTEM_STREAM ?? "outbound",
    provider: "postmark",
    maxDailyVolume: 5_000,
  },
];

// ── Lookup ────────────────────────────────────────────────────────────────────

/**
 * Returns the pool config for the given traffic type.
 * Falls back to transactional if type is unrecognised.
 *
 * Повертає конфігурацію пулу для вказаного типу трафіку.
 */
export function getPoolForMessage(type: string): IpPoolConfig {
  const pool = IP_POOL_CONFIGS.find((p) => p.poolId === type);
  return pool ?? IP_POOL_CONFIGS.find((p) => p.poolId === "transactional")!;
}

// ── Env vars documentation ────────────────────────────────────────────────────

/**
 * Environment variables required by the IP pool system.
 * Each pool gets its own API key to enforce hard budget + reputation separation.
 *
 * Add these to `.env.local` (dev) and GitHub / Hetzner server secrets (prod).
 */
export const IP_POOL_ENV_VARS: string[] = [
  // Resend — one API key per pool (different from the shared org key)
  "RESEND_TRANSACTIONAL_API_KEY",
  "RESEND_MARKETING_API_KEY",
  "RESEND_ALERTS_API_KEY",

  // Postmark — system pool uses Postmark server API token
  "POSTMARK_SYSTEM_API_TOKEN",

  // Message stream names (optional overrides)
  "RESEND_TRANSACTIONAL_STREAM",
  "RESEND_MARKETING_STREAM",
  "RESEND_ALERTS_STREAM",
  "POSTMARK_SYSTEM_STREAM",
];

// ── Rationale inline doc ──────────────────────────────────────────────────────

/**
 * Why pool isolation is non-negotiable for deliverability.
 *
 * IP reputation is the single biggest factor in inbox placement. Google,
 * Microsoft, and Yahoo score each IP independently. A marketing blast with
 * 2% spam rate will suppress that IP's deliverability for 7–30 days. If
 * transactional mail shares the same IP, users stop receiving password
 * resets and invoice confirmations — a critical failure for a SaaS platform.
 *
 * Separate pools give:
 *   - Independent warm-up curves (transactional warms slowly; marketing fast).
 *   - Isolated bounce rates that don't cross-contaminate.
 *   - Granular Postmaster Tools metrics per pool.
 *   - The ability to kill a marketing pool mid-campaign without affecting alerts.
 *
 * Cost: ~$20–80/mo per dedicated IP at Resend / Postmark. Worth it from day 1.
 */
export const POOL_SEPARATION_RATIONALE: string =
  "IP reputation is per-IP, not per-domain. Mixing traffic types on shared IPs " +
  "lets a single marketing spike ruin transactional inbox placement for weeks. " +
  "Dedicated pools allow independent warm-up, isolated bounce rates, and granular " +
  "Postmaster Tools visibility. Cost: ~$20–80/mo per dedicated IP — mandatory from day 1.";
