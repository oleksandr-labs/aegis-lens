/**
 * Verified-contributor tier system with reputation-gated queue access.
 * Система рівнів верифікованих дописувачів з обмеженням доступу до черги за репутацією.
 *
 * Contributors earn higher tiers by accumulating review decisions and maintaining
 * high QA accuracy. Each tier unlocks additional queue task types.
 *
 * Учасники отримують вищі рівні, накопичуючи рішення та підтримуючи точність QA.
 * Кожен рівень відкриває додаткові типи завдань у черзі.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type ContributorTier =
  | "newcomer"   // just joined; access to classify tasks only
  | "verified"   // 50+ decisions, 85%+ QA accuracy
  | "trusted"    // 200+ decisions, 90%+ QA accuracy
  | "expert";    // 500+ decisions, 95%+ QA accuracy

export type QueueTaskType =
  | "classify"       // categorise event type and severity
  | "geolocate"      // verify or propose geolocation
  | "verify-media"   // authenticate images/video
  | "translate";     // translate source content for corroboration

export interface ContributorProfile {
  userId: string;
  tier: ContributorTier;
  /** Cumulative number of completed review decisions */
  totalDecisions: number;
  /** QA accuracy rate 0–1 (computed via computeQAAccuracy) */
  qaAccuracy: number;
  /** Domain specialisations (e.g. 'satellite', 'armour-id', 'arabic') */
  specializations: string[];
  /** ISO timestamp of first contribution */
  joinedAt: string;
  /** Queue task types this contributor may access */
  queueAccess: QueueTaskType[];
}

// ── Tier requirements ─────────────────────────────────────────────────────────

/**
 * Minimum thresholds for each non-newcomer tier.
 *
 * Мінімальні пороги для кожного рівня вище newcomer.
 */
export const TIER_REQUIREMENTS: Record<
  Exclude<ContributorTier, "newcomer">,
  { minDecisions: number; minQaAccuracy: number }
> = {
  verified: { minDecisions: 50,  minQaAccuracy: 0.85 },
  trusted:  { minDecisions: 200, minQaAccuracy: 0.90 },
  expert:   { minDecisions: 500, minQaAccuracy: 0.95 },
};

/** Queue access granted at each tier (cumulative). */
const TIER_QUEUE_ACCESS: Record<ContributorTier, QueueTaskType[]> = {
  newcomer: ["classify"],
  verified: ["classify", "translate"],
  trusted:  ["classify", "translate", "geolocate"],
  expert:   ["classify", "translate", "geolocate", "verify-media"],
};

// ── Tier computation ──────────────────────────────────────────────────────────

/**
 * Compute the highest tier a contributor qualifies for based on their stats.
 * Checks from the highest tier down.
 *
 * Обчислення найвищого рівня, на який учасник відповідає за своїми показниками.
 */
export function computeContributorTier(profile: ContributorProfile): ContributorTier {
  const tiers: Exclude<ContributorTier, "newcomer">[] = ["expert", "trusted", "verified"];
  for (const tier of tiers) {
    const req = TIER_REQUIREMENTS[tier];
    if (
      profile.totalDecisions >= req.minDecisions &&
      profile.qaAccuracy >= req.minQaAccuracy
    ) {
      return tier;
    }
  }
  return "newcomer";
}

/** Derive queue access list for a given tier. */
export function queueAccessForTier(tier: ContributorTier): QueueTaskType[] {
  return [...TIER_QUEUE_ACCESS[tier]];
}

// ── Store ─────────────────────────────────────────────────────────────────────

/**
 * In-memory contributor registry.
 * In production, persist to a `contributor_profiles` DB table and
 * recompute tier on each review resolution (via a DB trigger or event).
 *
 * Реєстр учасників у пам'яті.
 * У продакшені зберігати в таблиці `contributor_profiles`.
 */
export class ContributorStore {
  private readonly profiles = new Map<string, ContributorProfile>();

  /**
   * Register or update a contributor's profile.
   * Recomputes tier and queueAccess from current stats.
   *
   * Реєстрація або оновлення профілю учасника.
   */
  upsert(params: Omit<ContributorProfile, "tier" | "queueAccess">): ContributorProfile {
    const tier = computeContributorTier({ ...params, tier: "newcomer", queueAccess: [] });
    const profile: ContributorProfile = {
      ...params,
      tier,
      queueAccess: queueAccessForTier(tier),
    };
    this.profiles.set(params.userId, profile);
    return profile;
  }

  /** Retrieve a contributor profile. */
  get(userId: string): ContributorProfile | undefined {
    return this.profiles.get(userId);
  }

  /** List contributors by tier. */
  listByTier(tier: ContributorTier): ContributorProfile[] {
    return [...this.profiles.values()].filter((p) => p.tier === tier);
  }

  /** List all contributors eligible for a specific queue task type. */
  listEligibleFor(taskType: QueueTaskType): ContributorProfile[] {
    return [...this.profiles.values()].filter((p) =>
      p.queueAccess.includes(taskType),
    );
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global contributor store singleton. */
export const contributorStore = new ContributorStore();

// ── Policy notes ──────────────────────────────────────────────────────────────

/**
 * [1] Reputation-gated access:
 * Tier promotion is automatic when the contributor's rolling stats cross the
 * TIER_REQUIREMENTS thresholds. Tier demotion is possible if QA accuracy drops
 * significantly (e.g. < 0.75 on 30-day rolling window — implement separately).
 *
 * [1] Доступ на основі репутації:
 * Підвищення рівня відбувається автоматично при перетині порогів TIER_REQUIREMENTS.
 * Зниження рівня можливе при суттєвому падінні точності QA.
 */
export const NOTE_REPUTATION_GATED_EN =
  "Reputation-gated: tier is recomputed automatically on every review resolution. " +
  "Promotion requires both minDecisions and minQaAccuracy to be met simultaneously. " +
  "Demotion logic (30-day rolling QA drop) must be implemented separately.";

export const NOTE_REPUTATION_GATED_UK =
  "Доступ на основі репутації: рівень перераховується автоматично при кожному вирішенні перевірки. " +
  "Для підвищення потрібно одночасно відповідати minDecisions та minQaAccuracy. " +
  "Логіку зниження рівня (30-денне ковзне вікно QA) реалізувати окремо.";

/**
 * [2] Queue access by tier:
 * Newcomers can only access 'classify' tasks (lowest risk).
 * 'verify-media' (deepfake/manipulation detection) is reserved for expert tier.
 * This prevents misuse and protects data integrity for high-stakes decisions.
 *
 * [2] Доступ до черги за рівнем:
 * Новачки мають доступ лише до завдань 'classify' (найменший ризик).
 * 'verify-media' (виявлення deepfake/маніпуляцій) зарезервовано для рівня expert.
 */
export const NOTE_QUEUE_ACCESS_EN =
  "Queue access by tier: newcomer=classify only; verified adds translate; " +
  "trusted adds geolocate; expert adds verify-media. " +
  "High-sensitivity tasks are gated at expert tier to protect data integrity.";

export const NOTE_QUEUE_ACCESS_UK =
  "Доступ до черги за рівнем: newcomer=лише classify; verified додає translate; " +
  "trusted додає geolocate; expert додає verify-media. " +
  "Чутливі завдання доступні лише на рівні expert для захисту цілісності даних.";

/**
 * [3] Bounty-eligible:
 * Contributors at 'verified' tier and above are eligible to claim bounty tasks.
 * Bounty rewards are credited to the contributor's platform wallet.
 *
 * [3] Право на нагороди:
 * Учасники рівня 'verified' і вище мають право брати завдання з нагородами.
 * Нагороди зараховуються до кредитного гаманця учасника на платформі.
 */
export const NOTE_BOUNTY_ELIGIBLE_EN =
  "Bounty-eligible: contributors at 'verified' tier and above may claim bounty tasks " +
  "from the BountyBoard. Rewards are credited to their platform wallet. " +
  "Newcomers are not eligible to prevent low-quality claims.";

export const NOTE_BOUNTY_ELIGIBLE_UK =
  "Право на нагороди: учасники рівня 'verified' і вище можуть брати завдання з BountyBoard. " +
  "Нагороди зараховуються до кредитного гаманця платформи. " +
  "Новачки не мають права для запобігання неякісним вимогам.";
