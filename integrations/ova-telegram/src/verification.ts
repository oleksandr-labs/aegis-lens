/**
 * Task 2 — Per-channel verification of authenticity.
 *
 * An OVA feed is only "official-of-record" if the channel is genuinely the
 * administration's channel and not an impostor/hijack. We compute an
 * authenticity score (0–1) from independent signals, none of which alone is
 * sufficient:
 *
 *   1. Official-site anchor — the OVA's gov.ua site links to / declares this
 *      exact @username. This is the strongest signal (gov.ua domain control).
 *   2. Telegram blue-check (`telegramVerified`).
 *   3. Registry membership with a stable chatId (rename-resistant identity).
 *   4. Age/posting history consistency (passed in from cadence stats).
 *
 * The result gates trust: below `MIN_AUTHENTIC` the channel is treated as
 * `unverified` and its posts must NOT be marked official-of-record.
 */

import type { OvaChannel, ChannelStatus } from "./types";

export const MIN_AUTHENTIC = 0.5;

export interface AuthenticitySignals {
  /** gov.ua official site confirms this username (verified out-of-band). */
  officialSiteConfirms?: boolean;
  /** Telegram platform verified badge. */
  telegramVerified?: boolean;
  /** Channel is in the curated registry. */
  inRegistry?: boolean;
  /** Stable numeric chatId is known (resists username squatting after rename). */
  hasStableChatId?: boolean;
  /** Account age in days (older = harder to impersonate quickly). */
  accountAgeDays?: number;
  /** Observed posting history length (msgs seen) — maturity proxy. */
  observedPosts?: number;
}

export interface VerificationResult {
  username: string;
  /** 0–1 authenticity. */
  authenticity: number;
  /** Derived status used by the pipeline. */
  status: ChannelStatus;
  /** Human-readable signal breakdown (for audit / provenance). */
  reasons: string[];
  verifiedAt: string;
}

const WEIGHTS = {
  officialSite: 0.45,
  telegramVerified: 0.2,
  inRegistry: 0.15,
  stableChatId: 0.1,
  maturity: 0.1, // age + history combined
} as const;

/** Compose authenticity from independent signals. */
export function scoreAuthenticity(s: AuthenticitySignals): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  if (s.officialSiteConfirms) {
    score += WEIGHTS.officialSite;
    reasons.push("gov.ua official site confirms username");
  }
  if (s.telegramVerified) {
    score += WEIGHTS.telegramVerified;
    reasons.push("Telegram verified badge");
  }
  if (s.inRegistry) {
    score += WEIGHTS.inRegistry;
    reasons.push("present in curated OVA registry");
  }
  if (s.hasStableChatId) {
    score += WEIGHTS.stableChatId;
    reasons.push("stable numeric chatId pinned");
  }

  // Maturity: full weight at >=180d age AND >=50 observed posts.
  const ageFactor = Math.min(1, (s.accountAgeDays ?? 0) / 180);
  const histFactor = Math.min(1, (s.observedPosts ?? 0) / 50);
  const maturity = (ageFactor + histFactor) / 2;
  if (maturity > 0) {
    score += WEIGHTS.maturity * maturity;
    reasons.push(`maturity ${(maturity * 100) | 0}% (age+history)`);
  }

  return { score: Math.min(1, score), reasons };
}

/**
 * Verify a registered channel. `extra` carries out-of-band signals the registry
 * cannot self-certify (e.g. a live gov.ua check, observed history from cadence).
 */
export function verifyChannel(
  channel: OvaChannel,
  extra: Partial<AuthenticitySignals> = {},
): VerificationResult {
  const signals: AuthenticitySignals = {
    officialSiteConfirms: extra.officialSiteConfirms ?? !!channel.officialSiteUrl,
    telegramVerified: extra.telegramVerified ?? channel.telegramVerified,
    inRegistry: true,
    hasStableChatId: extra.hasStableChatId ?? channel.chatId !== undefined,
    accountAgeDays: extra.accountAgeDays,
    observedPosts: extra.observedPosts,
  };

  const { score, reasons } = scoreAuthenticity(signals);
  const status: ChannelStatus = score >= MIN_AUTHENTIC ? "active" : "unverified";

  return {
    username: channel.username,
    authenticity: Number(score.toFixed(3)),
    status,
    reasons,
    verifiedAt: new Date().toISOString(),
  };
}

/** Whether a verification result clears the bar to be treated as official. */
export function isAuthentic(result: VerificationResult): boolean {
  return result.authenticity >= MIN_AUTHENTIC && result.status !== "banned";
}
