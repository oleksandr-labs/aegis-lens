"use server";

/**
 * Tier enforcement — server-side access control.
 *
 * Checks whether a user's current tier allows a requested operation.
 * All functions are server-only; never import from client components.
 *
 * Перевірка рівня доступу — тільки на сервері. Не імпортувати з клієнта.
 */

import { TIER_ORDER } from "../tiers/constants";
import type { Tier } from "../tiers/constants";
import { subscriptionStore } from "./subscription-store";

// ── Per-tier limit matrix ─────────────────────────────────────────────────────

/**
 * Axis limits per tier. null = unlimited.
 *
 * Values are intentionally conservative stubs — tune before launch.
 * Ліміти по осях на кожен tier. null = необмежено.
 */
const TIER_LIMITS: Record<
  string,
  Record<string, number | null>
> = {
  anonymous: {
    "api-calls": 0,
    "aoi-count": 0,
    "copilot-msgs": 0,
    "export-rows": 0,
    "alerts-per-day": 0,
    "history-days": 0,
  },
  free: {
    "api-calls": 100,
    "aoi-count": 1,
    "copilot-msgs": 5,
    "export-rows": 0,
    "alerts-per-day": 1,
    "history-days": 7,
  },
  observer: {
    "api-calls": 1_000,
    "aoi-count": 5,
    "copilot-msgs": 50,
    "export-rows": 1_000,
    "alerts-per-day": 10,
    "history-days": 90,
  },
  pro: {
    "api-calls": 10_000,
    "aoi-count": 25,
    "copilot-msgs": null,
    "export-rows": 50_000,
    "alerts-per-day": 100,
    "history-days": 365,
  },
  pro_plus: {
    "api-calls": 50_000,
    "aoi-count": 100,
    "copilot-msgs": null,
    "export-rows": 250_000,
    "alerts-per-day": null,
    "history-days": 730,
  },
  team: {
    "api-calls": 100_000,
    "aoi-count": 500,
    "copilot-msgs": null,
    "export-rows": 1_000_000,
    "alerts-per-day": null,
    "history-days": 730,
  },
  business: {
    "api-calls": 500_000,
    "aoi-count": null,
    "copilot-msgs": null,
    "export-rows": null,
    "alerts-per-day": null,
    "history-days": null,
  },
  enterprise: {
    "api-calls": null,
    "aoi-count": null,
    "copilot-msgs": null,
    "export-rows": null,
    "alerts-per-day": null,
    "history-days": null,
  },
};

// ── Violation type ────────────────────────────────────────────────────────────

export interface TierLimitViolation {
  userId: string;
  tierId: string;
  limitAxis: string;
  current: number;
  max: number;
  suggestedTier: string;
}

// ── TierAccessError ───────────────────────────────────────────────────────────

/**
 * Thrown when a user tries to access a feature that requires a higher tier.
 * Include the upgradeUrl in the API response so the frontend can show a prompt.
 *
 * Виникає коли користувач намагається отримати доступ до функції вищого рівня.
 */
export class TierAccessError extends Error {
  readonly tierId: string;
  readonly requiredTier: string;
  readonly upgradeUrl: string;

  constructor(tierId: string, requiredTier: string) {
    super(
      `Tier "${tierId}" does not meet minimum required tier "${requiredTier}". ` +
        `Upgrade at https://aegislens.uk/pricing`,
    );
    this.name = "TierAccessError";
    this.tierId = tierId;
    this.requiredTier = requiredTier;
    this.upgradeUrl = `https://aegislens.uk/pricing?upgrade_from=${tierId}&required=${requiredTier}`;
  }
}

// ── getTierForUser ────────────────────────────────────────────────────────────

/**
 * Resolve the current tier for a user from the subscription store.
 * Falls back to "free" for users with no active subscription.
 *
 * Повертає tier користувача зі store, fallback = "free".
 */
export async function getTierForUser(userId: string): Promise<string> {
  const sub = subscriptionStore.getByUserId(userId);
  if (!sub) return "free";
  if (sub.status === "canceled" || sub.status === "unpaid") return "free";
  return sub.tierId;
}

// ── checkTierLimit ────────────────────────────────────────────────────────────

/**
 * Check whether a user's current tier allows `requested` additional units on
 * the given axis. `current` is the already-consumed count in the current period.
 *
 * Returns null if the operation is within limits, or a TierLimitViolation
 * object if it is blocked.
 *
 * Перевіряє, чи дозволяє tier запитану кількість одиниць по осі.
 */
export async function checkTierLimit(
  userId: string,
  axis:
    | "api-calls"
    | "aoi-count"
    | "copilot-msgs"
    | "export-rows"
    | "alerts-per-day"
    | "history-days",
  requested: number,
): Promise<TierLimitViolation | null> {
  const tierId = await getTierForUser(userId);
  const limits = TIER_LIMITS[tierId] ?? TIER_LIMITS["free"];
  const max = limits[axis];

  // null means unlimited
  if (max === null || max === undefined) return null;

  if (requested > max) {
    // Find the next tier that would allow this request
    const suggestedTier = findSuggestedTier(axis, requested) ?? "enterprise";

    return {
      userId,
      tierId,
      limitAxis: axis,
      current: requested,
      max,
      suggestedTier,
    };
  }

  return null;
}

/** Find the lowest tier that satisfies the requested amount on the given axis. */
function findSuggestedTier(axis: string, requested: number): string | null {
  for (const tier of TIER_ORDER) {
    const limits = TIER_LIMITS[tier as string];
    if (!limits) continue;
    const max = limits[axis];
    if (max === null || max === undefined || max >= requested) return tier;
  }
  return null;
}

// ── assertTierAtLeast ─────────────────────────────────────────────────────────

/**
 * Throws `TierAccessError` if the user's current tier is below `minimumTier`.
 * Use in server actions and API routes to enforce hard feature gates.
 *
 * Кидає TierAccessError якщо tier користувача нижчий за мінімальний.
 */
export async function assertTierAtLeast(
  userId: string,
  minimumTier: string,
): Promise<void> {
  const tierId = await getTierForUser(userId);

  const userIndex = TIER_ORDER.indexOf(tierId as Tier);
  const minIndex = TIER_ORDER.indexOf(minimumTier as Tier);

  const resolvedUserIndex = userIndex === -1 ? 1 : userIndex; // unknown → free
  const resolvedMinIndex = minIndex === -1 ? TIER_ORDER.length : minIndex;

  if (resolvedUserIndex < resolvedMinIndex) {
    throw new TierAccessError(tierId, minimumTier);
  }
}
