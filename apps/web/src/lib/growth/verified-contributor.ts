/**
 * Verified Contributor Program — reputation, tiers, and badges for OSINT contributors.
 *
 * Gamified contribution system to incentivise high-quality geolocations,
 * source submissions, and peer review. Tiers: bronze → silver → gold → platinum.
 *
 * Програма верифікованих контриб'юторів: репутація, рівні, значки.
 */

// ── Tier type ─────────────────────────────────────────────────────────────────

export type ContributorTier = "bronze" | "silver" | "gold" | "platinum";

// ── Tier requirements ─────────────────────────────────────────────────────────

export interface TierRequirement {
  /** Minimum accepted contributions. / Мінімум прийнятих внесків. */
  acceptedContributions: number;
  /** Minimum accuracy rate (0–1). / Мінімальний відсоток точності. */
  minAccuracy: number;
  /** Minimum peer-review votes received. / Мінімум голосів рецензентів. */
  peerVotes: number;
  /** Account age in days. / Вік облікового запису в днях. */
  accountAgeDays: number;
}

/**
 * Requirements to reach each contributor tier.
 *
 * Вимоги для досягнення кожного рівня контриб'ютора.
 */
export const TIER_REQUIREMENTS: Record<ContributorTier, TierRequirement> = {
  bronze: {
    acceptedContributions: 5,
    minAccuracy: 0.7,
    peerVotes: 3,
    accountAgeDays: 7,
  },
  silver: {
    acceptedContributions: 25,
    minAccuracy: 0.8,
    peerVotes: 15,
    accountAgeDays: 30,
  },
  gold: {
    acceptedContributions: 100,
    minAccuracy: 0.9,
    peerVotes: 60,
    accountAgeDays: 90,
  },
  platinum: {
    acceptedContributions: 500,
    minAccuracy: 0.95,
    peerVotes: 300,
    accountAgeDays: 180,
  },
};

// ── Badge ─────────────────────────────────────────────────────────────────────

export interface ContributorBadge {
  id: string;
  tier: ContributorTier;
  /** SVG icon URL. / URL SVG-іконки. */
  iconUrl: string;
  /** Display label (EN). / Мітка відображення. */
  labelEn: string;
  /** Display label (UK). / Мітка відображення (UA). */
  labelUk: string;
  /** ISO-8601 date the badge was awarded. / Дата видачі значка. */
  awardedAt: string;
}

// ── Contributor record ────────────────────────────────────────────────────────

export interface ContributorRecord {
  userId: string;
  currentTier: ContributorTier;
  acceptedContributions: number;
  accuracyRate: number;
  peerVotesReceived: number;
  accountCreatedAt: string;
  badges: ContributorBadge[];
  lastTierChangeAt: string;
}

// ── ContributorProgramStore ───────────────────────────────────────────────────

export class ContributorProgramStore {
  private readonly contributors = new Map<string, ContributorRecord>();

  /**
   * Upsert a contributor record.
   *
   * Додає або оновлює запис контриб'ютора.
   */
  upsert(record: ContributorRecord): void {
    this.contributors.set(record.userId, record);
  }

  /**
   * Get a contributor record by user ID.
   *
   * Повертає запис контриб'ютора за ID.
   */
  get(userId: string): ContributorRecord | undefined {
    return this.contributors.get(userId);
  }

  /**
   * Evaluate and return the appropriate tier for a contributor's current stats.
   *
   * Визначає рівень на основі поточної статистики.
   */
  evaluateTier(record: ContributorRecord): ContributorTier {
    const ageDays =
      (Date.now() - new Date(record.accountCreatedAt).getTime()) /
      (1000 * 60 * 60 * 24);
    const tiers: ContributorTier[] = ["platinum", "gold", "silver", "bronze"];
    for (const tier of tiers) {
      const req = TIER_REQUIREMENTS[tier];
      if (
        record.acceptedContributions >= req.acceptedContributions &&
        record.accuracyRate >= req.minAccuracy &&
        record.peerVotesReceived >= req.peerVotes &&
        ageDays >= req.accountAgeDays
      ) {
        return tier;
      }
    }
    return "bronze";
  }

  /**
   * List contributors at a given tier.
   *
   * Повертає контриб'юторів певного рівня.
   */
  listByTier(tier: ContributorTier): ContributorRecord[] {
    return Array.from(this.contributors.values()).filter(
      (c) => c.currentTier === tier,
    );
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global contributor program store. */
export const contributorProgramStore = new ContributorProgramStore();
