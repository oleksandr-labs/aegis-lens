'use server';

/**
 * Contributor Strike System — progressive discipline for repeated doxxing violations.
 *
 * Users accumulate strikes per violation type. Thresholds trigger automatic
 * warning, suspension, or ban actions.
 *
 * Система страйків: прогресивні санкції за повторні порушення захисту приватності.
 */

// ── StrikeReason ──────────────────────────────────────────────────────────────

export type StrikeReason =
  | "doxxing-attempt"
  | "pii-submission"
  | "harassment"
  | "private-name-search"
  | "plate-upload"
  | "household-address"
  | "policy-violation";

// ── Thresholds ────────────────────────────────────────────────────────────────

/**
 * Number of strikes that triggers each discipline level.
 *
 * Кількість страйків для кожного рівня дисциплінарного заходу.
 */
export const STRIKE_THRESHOLDS = {
  warning: 1,
  suspension: 3,
  ban: 5,
} as const;

export type StrikeLevel = "none" | "warning" | "suspension" | "ban";

// ── ContributorStrikeRecord ───────────────────────────────────────────────────

export interface ContributorStrikeRecord {
  userId: string;
  strikes: Array<{
    id: string;
    reason: StrikeReason;
    issuedAt: string;
    issuedBy: string;
    contentId: string | null;
    note: string | null;
  }>;
  level: StrikeLevel;
  /** ISO timestamp of last level change */
  levelChangedAt: string | null;
}

// ── ContributorStrikeStore ────────────────────────────────────────────────────

/**
 * Singleton strike store. Persists in-memory; in production sync to Postgres.
 *
 * Синглтон-сховище страйків. У продакшені — синхронізувати з Postgres.
 */
export class ContributorStrikeStore {
  private static instance: ContributorStrikeStore;
  private readonly records = new Map<string, ContributorStrikeRecord>();
  private counter = 0;

  private constructor() {}

  static getInstance(): ContributorStrikeStore {
    if (!ContributorStrikeStore.instance) {
      ContributorStrikeStore.instance = new ContributorStrikeStore();
    }
    return ContributorStrikeStore.instance;
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private ensureRecord(userId: string): ContributorStrikeRecord {
    if (!this.records.has(userId)) {
      this.records.set(userId, {
        userId,
        strikes: [],
        level: "none",
        levelChangedAt: null,
      });
    }
    return this.records.get(userId)!;
  }

  private computeLevel(strikeCount: number): StrikeLevel {
    if (strikeCount >= STRIKE_THRESHOLDS.ban) return "ban";
    if (strikeCount >= STRIKE_THRESHOLDS.suspension) return "suspension";
    if (strikeCount >= STRIKE_THRESHOLDS.warning) return "warning";
    return "none";
  }

  // ── Write ──────────────────────────────────────────────────────────────────

  /**
   * Issue a strike to a contributor. Updates the discipline level automatically.
   *
   * Видати страйк контрибутору. Рівень дисципліни оновлюється автоматично.
   */
  issueStrike(
    userId: string,
    reason: StrikeReason,
    issuedBy = "system",
    contentId: string | null = null,
    note: string | null = null,
  ): ContributorStrikeRecord {
    const record = this.ensureRecord(userId);
    const id = `strike-${++this.counter}`;
    record.strikes.push({
      id,
      reason,
      issuedAt: new Date().toISOString(),
      issuedBy,
      contentId,
      note,
    });

    const newLevel = this.computeLevel(record.strikes.length);
    if (newLevel !== record.level) {
      record.level = newLevel;
      record.levelChangedAt = new Date().toISOString();
    }
    return record;
  }

  // ── Read ───────────────────────────────────────────────────────────────────

  /**
   * Get the current discipline level label for a user.
   *
   * Повернути поточний рівень дисципліни для користувача.
   */
  getStrikeLevel(userId: string): StrikeLevel {
    return this.records.get(userId)?.level ?? "none";
  }

  getRecord(userId: string): ContributorStrikeRecord | undefined {
    return this.records.get(userId);
  }

  strikeCount(userId: string): number {
    return this.records.get(userId)?.strikes.length ?? 0;
  }
}

// ── Singleton export ──────────────────────────────────────────────────────────

export const contributorStrikeStore = ContributorStrikeStore.getInstance();

// ── Convenience functions ─────────────────────────────────────────────────────

/**
 * Issue a strike to a user.
 *
 * Видати страйк користувачу.
 */
export function issueStrike(userId: string, reason: StrikeReason): void {
  contributorStrikeStore.issueStrike(userId, reason);
}

/**
 * Get the discipline level for a user.
 *
 * Повернути рівень дисципліни користувача.
 */
export function getStrikeLevel(userId: string): StrikeLevel {
  return contributorStrikeStore.getStrikeLevel(userId);
}
