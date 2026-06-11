/**
 * Disputed badge generator.
 *
 * Aggregates misinfo signals and decides whether to surface a caveat.
 * Conservative thresholds — never auto-retract, only surface caveats.
 * Human review required for high-impact flags.
 */

import type { MisinfoSignal, DisputedBadge } from "./types";

const HIGH_SUSPICION_THRESHOLD = 0.6;
const HUMAN_REVIEW_THRESHOLD = 0.5;

function buildCaveatText(
  signals: MisinfoSignal[],
  score: number,
): { en: string; uk: string } {
  const flagLabels: Record<string, { en: string; uk: string }> = {
    recycled_media: {
      en: "media may have been previously published in a different context",
      uk: "медіафайли могли бути опубліковані раніше в іншому контексті",
    },
    location_contradiction: {
      en: "claimed location may not match visual evidence",
      uk: "заявлене місце може не відповідати візуальним доказам",
    },
    temporal_contradiction: {
      en: "claimed date/time may be inconsistent with metadata",
      uk: "заявлена дата/час може не відповідати метаданим",
    },
    narrative_cluster: {
      en: "this claim is spreading rapidly across multiple accounts",
      uk: "ця заява швидко поширюється через кілька акаунтів",
    },
    coordinated_behavior: {
      en: "source shows signs of coordinated activity",
      uk: "джерело показує ознаки координованої активності",
    },
    low_source_reputation: {
      en: "source has a history of inaccurate reporting",
      uk: "джерело має історію неточних повідомлень",
    },
  };

  const reasons = signals.map((s) => flagLabels[s.flag]?.en ?? s.flag).join("; ");
  const reasonsUk = signals.map((s) => flagLabels[s.flag]?.uk ?? s.flag).join("; ");

  const prefix = score > HIGH_SUSPICION_THRESHOLD
    ? "DISPUTED: This content requires additional verification"
    : "Note: This content has been flagged for review";

  const prefixUk = score > HIGH_SUSPICION_THRESHOLD
    ? "ОСКАРЖЕНО: Цей вміст потребує додаткової перевірки"
    : "Примітка: Цей вміст позначено для перевірки";

  return {
    en: `${prefix}. Reasons: ${reasons}. This is not a final determination.`,
    uk: `${prefixUk}. Причини: ${reasonsUk}. Це не остаточне рішення.`,
  };
}

export function createDisputedBadge(
  eventId: string,
  signals: MisinfoSignal[],
): DisputedBadge | null {
  if (signals.length === 0) return null;

  const suspicionScore = Math.min(
    1,
    signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length,
  );

  // Don't badge unless score is meaningful
  if (suspicionScore < 0.25) return null;

  return {
    eventId,
    signals,
    suspicionScore,
    caveatText: buildCaveatText(signals, suspicionScore),
    requiresHumanReview: suspicionScore >= HUMAN_REVIEW_THRESHOLD,
    humanReviewStatus: suspicionScore >= HUMAN_REVIEW_THRESHOLD ? "pending" : undefined,
    createdAt: new Date().toISOString(),
  };
}

export class DisputedBadgeStore {
  private readonly badges = new Map<string, DisputedBadge>();

  set(badge: DisputedBadge): void {
    this.badges.set(badge.eventId, badge);
  }

  get(eventId: string): DisputedBadge | null {
    return this.badges.get(eventId) ?? null;
  }

  getPendingReview(): DisputedBadge[] {
    return [...this.badges.values()].filter(
      (b) => b.humanReviewStatus === "pending",
    );
  }

  updateReviewStatus(
    eventId: string,
    status: "cleared" | "confirmed_misinfo",
  ): void {
    const badge = this.badges.get(eventId);
    if (badge) badge.humanReviewStatus = status;
  }

  getAll(): DisputedBadge[] {
    return [...this.badges.values()];
  }
}
