/**
 * Per-recipient engagement-based email throttling.
 *
 * Sending to disengaged users destroys deliverability because ISPs use
 * engagement signals (opens, clicks, spam reports) as reputation inputs.
 * Recipients who haven't opened in 90+ days should receive no marketing
 * mail — they drag down your domain reputation.
 *
 * Throttle tiers:
 *   high:     opens / clicks regularly  → up to 7 emails/week, min 24h apart
 *   medium:   moderate engagement       → up to 3 emails/week, min 48h apart
 *   low:      rarely engages            → up to 1 email/week, min 72h apart
 *   inactive: no opens in 30d           → suppress marketing; transactional through
 *
 * Transactional mail (password reset, receipts) always bypasses throttling.
 *
 * Обмеження частоти відправки на основі залученості одержувача:
 * неактивні контакти не отримують маркетингових листів.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EngagementScore {
  /** Email address of the recipient. */
  email: string;
  /** Number of opens in the last 30 days. */
  opens30d: number;
  /** Number of link clicks in the last 30 days. */
  clicks30d: number;
  /** ISO date of the most recent open, if any. */
  lastOpened?: string;
  /**
   * Composite score [0–100]:
   *   opens30d * 5 + clicks30d * 10, capped at 100.
   * Computed by the caller from event data.
   */
  score: number;
}

export type EngagementTier = "high" | "medium" | "low" | "inactive";

export interface ThrottleConfig {
  /** Maximum marketing emails per 7-day window. */
  maxEmailsPerWeek: number;
  /** Minimum hours between any two emails to this recipient. */
  minIntervalHours: number;
}

// ── Tier classification ────────────────────────────────────────────────────────

/**
 * Maps an EngagementScore to a tier.
 *
 * Classification rules:
 *   score >= 60 OR (opens30d >= 3 AND clicks30d >= 1)  → high
 *   score >= 20 OR opens30d >= 1                        → medium
 *   lastOpened within 90 days                           → low
 *   otherwise                                           → inactive
 *
 * Класифікація одержувача за рівнем залученості.
 */
export function computeEngagementTier(score: EngagementScore): EngagementTier {
  const { opens30d, clicks30d, lastOpened, score: s } = score;

  if (s >= 60 || (opens30d >= 3 && clicks30d >= 1)) return "high";
  if (s >= 20 || opens30d >= 1) return "medium";

  if (lastOpened) {
    const daysSinceOpen =
      (Date.now() - new Date(lastOpened).getTime()) / 86_400_000;
    if (daysSinceOpen <= 90) return "low";
  }

  return "inactive";
}

// ── Throttle config per tier ──────────────────────────────────────────────────

/**
 * Returns the throttle configuration for a given engagement tier.
 *
 * Повертає налаштування обмеження для рівня залученості.
 */
export function getThrottleConfig(tier: EngagementTier): ThrottleConfig {
  const configs: Record<EngagementTier, ThrottleConfig> = {
    high: { maxEmailsPerWeek: 7, minIntervalHours: 24 },
    medium: { maxEmailsPerWeek: 3, minIntervalHours: 48 },
    low: { maxEmailsPerWeek: 1, minIntervalHours: 72 },
    inactive: { maxEmailsPerWeek: 0, minIntervalHours: 168 },
  };
  return configs[tier];
}

// ── Send decision ─────────────────────────────────────────────────────────────

/**
 * Determines whether an email should be sent to the given recipient.
 *
 * Rules:
 *   - Transactional mail always passes (password resets, invoices, alerts).
 *   - Marketing mail to 'inactive' tier is suppressed.
 *   - Caller is responsible for tracking weekly send count + last send time;
 *     this function uses the score to make the policy decision.
 *
 * @param email      - Recipient address (for logging / future DB lookup).
 * @param emailType  - 'transactional' | 'marketing'
 * @param score      - Pre-computed engagement score.
 * @returns True if the email should be sent.
 *
 * Визначає, чи потрібно надсилати лист на основі залученості.
 */
export function shouldSendEmail(
  email: string,
  emailType: "transactional" | "marketing",
  score: EngagementScore,
): boolean {
  void email; // used for logging in production

  // Transactional always passes through — never throttle critical mail
  if (emailType === "transactional") return true;

  const tier = computeEngagementTier(score);

  // Inactive recipients: suppress all marketing
  if (tier === "inactive") return false;

  // All other tiers: allow (caller must track weekly count separately)
  return true;
}

/**
 * Returns both the tier and the send decision in one call.
 * Useful for logging and metrics.
 *
 * Повертає рівень залученості та рішення про відправку разом.
 */
export function evaluateRecipient(
  email: string,
  emailType: "transactional" | "marketing",
  score: EngagementScore,
): { tier: EngagementTier; shouldSend: boolean; config: ThrottleConfig } {
  const tier = computeEngagementTier(score);
  const config = getThrottleConfig(tier);
  const shouldSend = shouldSendEmail(email, emailType, score);
  return { tier, shouldSend, config };
}
