/**
 * Org Pool — Team and Business organisations share a single usage pool
 * across all seats. Metered actions from any seat draw from the org's
 * aggregate quota rather than per-user quotas.
 *
 * Пул організації: Team/Business спільно використовують один пул квот між усіма учасниками.
 */

import type { MeterAxis } from "./usage-meters";

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Tiers that participate in org-level pooling.
 *
 * Тарифи, що підтримують спільний пул.
 */
export const POOL_ELIGIBLE_TIERS: readonly string[] = [
  "team",
  "business",
  "enterprise",
] as const;

// ── Interfaces ────────────────────────────────────────────────────────────────

/** An organisation pool quota definition. */
export interface OrgPoolQuota {
  /** Axis → total pool size for this period (null = unlimited) */
  axes: Partial<Record<MeterAxis, number | null>>;
}

/** Current consumption snapshot for an org pool. */
export interface OrgPool {
  orgId: string;
  /** YYYY-MM billing period */
  period: string;
  tierId: string;
  /** Total consumed per axis across all seats */
  consumed: Partial<Record<MeterAxis, number>>;
  /** Pool quota per axis */
  quota: Partial<Record<MeterAxis, number | null>>;
  /** Seats that have contributed consumption to this pool */
  memberUserIds: string[];
}

// ── Period helper ─────────────────────────────────────────────────────────────

function currentPeriod(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

// ── Default quota stubs per tier ──────────────────────────────────────────────

/**
 * Default org pool quotas per tier.
 * null = unlimited (subject to fair-use policy).
 * Values are stubs — tune before launch.
 *
 * Квоти пулу за замовчуванням. null = необмежено.
 */
const DEFAULT_POOL_QUOTA: Record<string, OrgPoolQuota> = {
  team: {
    axes: {
      "api-calls": 100_000,
      "ai-tokens": null,
      "aoi-area-km2": null,
      "export-rows": 1_000_000,
      "alert-deliveries": null,
      "satellite-scenes": 50,
    },
  },
  business: {
    axes: {
      "api-calls": 500_000,
      "ai-tokens": null,
      "aoi-area-km2": null,
      "export-rows": null,
      "alert-deliveries": null,
      "satellite-scenes": null,
    },
  },
  enterprise: {
    axes: {
      "api-calls": null,
      "ai-tokens": null,
      "aoi-area-km2": null,
      "export-rows": null,
      "alert-deliveries": null,
      "satellite-scenes": null,
    },
  },
};

// ── OrgPoolStore ──────────────────────────────────────────────────────────────

/**
 * Manages org-level usage pools across billing periods.
 * In production, persist to DB. Here: in-memory singleton.
 *
 * Управляє пулами квот організацій.
 */
export class OrgPoolStore {
  /** Key: `${orgId}:${period}` */
  private readonly pools = new Map<string, OrgPool>();

  /** userId → orgId mapping (populated via registerSeat) */
  private readonly seatToOrg = new Map<string, string>();

  private key(orgId: string, period: string): string {
    return `${orgId}:${period}`;
  }

  // ── Seat management ───────────────────────────────────────────────────────

  /**
   * Associate a user seat with an organisation.
   *
   * Реєструє учасника в пулі організації.
   */
  registerSeat(userId: string, orgId: string): void {
    this.seatToOrg.set(userId, orgId);
  }

  /** Returns the org ID for a given user seat, or null if not in an org pool. */
  getOrgForUser(userId: string): string | null {
    return this.seatToOrg.get(userId) ?? null;
  }

  // ── Pool initialisation ───────────────────────────────────────────────────

  /**
   * Ensure an org pool record exists for the given period.
   *
   * Ініціалізує запис пулу для periodу, якщо ще не існує.
   */
  private ensurePool(orgId: string, tierId: string, period: string): OrgPool {
    const k = this.key(orgId, period);
    if (!this.pools.has(k)) {
      const quota = DEFAULT_POOL_QUOTA[tierId] ?? DEFAULT_POOL_QUOTA["team"];
      this.pools.set(k, {
        orgId,
        period,
        tierId,
        consumed: {},
        quota: { ...quota.axes },
        memberUserIds: [],
      });
    }
    return this.pools.get(k)!;
  }

  // ── Read ──────────────────────────────────────────────────────────────────

  /**
   * Return the current period's org pool snapshot.
   *
   * Повертає поточний стан пулу.
   */
  getOrgUsage(orgId: string, tierId = "team", period?: string): OrgPool {
    const p = period ?? currentPeriod();
    return this.ensurePool(orgId, tierId, p);
  }

  // ── Write ─────────────────────────────────────────────────────────────────

  /**
   * Increment the org meter for a given axis and record the contributing user.
   *
   * Збільшує лічильник осі для пулу організації.
   */
  incrementOrgMeter(
    orgId: string,
    axis: MeterAxis,
    amount: number,
    tierId = "team",
    contributingUserId?: string,
    period?: string,
  ): void {
    if (amount <= 0) return;
    const p = period ?? currentPeriod();
    const pool = this.ensurePool(orgId, tierId, p);
    pool.consumed[axis] = (pool.consumed[axis] ?? 0) + amount;

    if (contributingUserId && !pool.memberUserIds.includes(contributingUserId)) {
      pool.memberUserIds.push(contributingUserId);
    }
  }

  // ── Remaining quota ───────────────────────────────────────────────────────

  /**
   * Returns the remaining pool quota for an axis (null = unlimited).
   *
   * Повертає залишок квоти пулу по осі.
   */
  remaining(
    orgId: string,
    axis: MeterAxis,
    tierId = "team",
    period?: string,
  ): number | null {
    const pool = this.getOrgUsage(orgId, tierId, period);
    const quota = pool.quota[axis];
    if (quota === null || quota === undefined) return null;
    return Math.max(0, quota - (pool.consumed[axis] ?? 0));
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global org pool store. */
export const orgPoolStore = new OrgPoolStore();
