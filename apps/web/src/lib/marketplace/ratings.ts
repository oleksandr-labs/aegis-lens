/**
 * Marketplace — Plugin ratings and verified-developer badges.
 *
 * Tracks per-plugin ratings submitted by org users.
 * Verified-developer status is granted when all VERIFIED_DEVELOPER_CRITERIA are met.
 * The composite plugin score combines average rating, install count, and recency.
 *
 * Рейтинги плагінів та значки верифікованого розробника.
 * Оцінки від організацій; верифікація — за критеріями VERIFIED_DEVELOPER_CRITERIA.
 */

// ── PluginRating ──────────────────────────────────────────────────────────────

/**
 * A single rating record submitted by an organisation user.
 *
 * Одна оцінка, подана користувачем організації.
 */
export interface PluginRating {
  /** Unique rating ID */
  id: string;
  pluginId: string;
  orgId: string;
  /** Submitter user ID */
  userId: string;
  /** 1–5 stars */
  stars: 1 | 2 | 3 | 4 | 5;
  /** Optional review text */
  review?: string;
  /** ISO 8601 */
  createdAt: string;
}

// ── Verified developer criteria ───────────────────────────────────────────────

export interface VerifiedDeveloperCriterion {
  id: string;
  description_en: string;
  description_uk: string;
}

/**
 * All criteria that must be met for a developer to receive a Verified badge.
 *
 * Критерії для отримання значка Verified Developer.
 */
export const VERIFIED_DEVELOPER_CRITERIA: VerifiedDeveloperCriterion[] = [
  {
    id: "kyc-complete",
    description_en: "KYC verification completed (Stripe Connect Express)",
    description_uk: "KYC верифікацію завершено (Stripe Connect Express)",
  },
  {
    id: "min-approved-plugins",
    description_en: "At least 1 plugin approved and published to the marketplace",
    description_uk: "Щонайменше 1 плагін схвалено та опубліковано в маркетплейсі",
  },
  {
    id: "no-policy-violations",
    description_en: "No active security or ToS policy violations in the last 12 months",
    description_uk: "Відсутні порушення безпеки або ToS за останні 12 місяців",
  },
  {
    id: "valid-support-email",
    description_en: "Valid support email on record and responsive within 5 business days",
    description_uk: "Актуальна email-адреса підтримки з відповіддю протягом 5 робочих днів",
  },
  {
    id: "security-review-passed",
    description_en: "All published plugins passed the latest security review",
    description_uk: "Усі опубліковані плагіни пройшли останній огляд безпеки",
  },
];

// ── DeveloperVerificationRecord ───────────────────────────────────────────────

interface DeveloperVerificationRecord {
  developerId: string;
  isVerified: boolean;
  verifiedAt?: string;
  criteriaMetIds: string[];
}

// ── RatingStore ───────────────────────────────────────────────────────────────

/**
 * In-memory store for plugin ratings and developer verification status.
 *
 * Сховище рейтингів плагінів та статусів верифікації розробників.
 */
export class RatingStore {
  /** pluginId → list of ratings */
  private readonly ratings = new Map<string, PluginRating[]>();
  /** developerId → verification record */
  private readonly developers = new Map<string, DeveloperVerificationRecord>();

  // ── Ratings ────────────────────────────────────────────────────────────────

  /**
   * Submit a rating for a plugin. One rating per orgId per plugin is stored
   * (later submissions overwrite earlier ones from the same org).
   *
   * Додає або оновлює оцінку плагіну від організації.
   */
  submitRating(rating: PluginRating): void {
    const existing = this.ratings.get(rating.pluginId) ?? [];
    const idx = existing.findIndex((r) => r.orgId === rating.orgId);
    if (idx >= 0) {
      existing[idx] = rating;
    } else {
      existing.push(rating);
    }
    this.ratings.set(rating.pluginId, existing);
  }

  /** Get all ratings for a plugin. */
  getRatings(pluginId: string): PluginRating[] {
    return this.ratings.get(pluginId) ?? [];
  }

  // ── Developer verification ─────────────────────────────────────────────────

  /**
   * Mark a developer as verified (or update their criteria list).
   *
   * Позначає розробника як верифікованого.
   */
  setVerified(developerId: string, criteriaMetIds: string[]): void {
    const allMet = VERIFIED_DEVELOPER_CRITERIA.every((c) =>
      criteriaMetIds.includes(c.id),
    );
    this.developers.set(developerId, {
      developerId,
      isVerified: allMet,
      verifiedAt: allMet ? new Date().toISOString() : undefined,
      criteriaMetIds,
    });
  }

  /**
   * Check whether a developer holds Verified status.
   *
   * Перевіряє, чи має розробник статус Verified.
   */
  isVerifiedDeveloper(developerId: string): boolean {
    return this.developers.get(developerId)?.isVerified ?? false;
  }

  // ── Score ──────────────────────────────────────────────────────────────────

  /**
   * Compute a composite quality score for a plugin (0–100).
   *
   * Formula (heuristic baseline):
   *   - Average star rating (1–5) contributes 60 % of the score.
   *   - Volume: log-normalised count of ratings contributes 30 %.
   *   - Verified developer bonus: 10 points if the author is verified.
   *
   * Обчислює зважений рейтинг плагіну від 0 до 100.
   */
  computePluginScore(pluginId: string, developerId?: string): number {
    const ratingList = this.getRatings(pluginId);
    if (ratingList.length === 0) return 0;

    const avg = ratingList.reduce((sum, r) => sum + r.stars, 0) / ratingList.length;
    const starScore = ((avg - 1) / 4) * 60; // normalise 1-5 → 0-60

    const volumeScore = Math.min(30, Math.log10(ratingList.length + 1) * 15);

    const verifiedBonus =
      developerId && this.isVerifiedDeveloper(developerId) ? 10 : 0;

    return Math.round(starScore + volumeScore + verifiedBonus);
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const ratingStore = new RatingStore();

// ── Convenience exports ───────────────────────────────────────────────────────

export function computePluginScore(pluginId: string, developerId?: string): number {
  return ratingStore.computePluginScore(pluginId, developerId);
}

export function isVerifiedDeveloper(developerId: string): boolean {
  return ratingStore.isVerifiedDeveloper(developerId);
}
