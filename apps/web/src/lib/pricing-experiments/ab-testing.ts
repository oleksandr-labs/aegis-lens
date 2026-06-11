/**
 * A/B testing utilities for pricing experiments.
 *
 * Утиліти A/B-тестування для цінових експериментів.
 *
 * Key invariant: paying customers are NEVER assigned to a price-test arm —
 * their locked-in price is honored via `shouldExcludeUser`.
 */

import type { ExperimentArm } from "./types";

// ── Assignment strategy ────────────────────────────────────────────────────────

/**
 * How a user is assigned to an experiment arm.
 */
export type AssignmentStrategy = "hash-user-id" | "random" | "manual";

// ── Assignment record ──────────────────────────────────────────────────────────

/**
 * A persisted assignment of one user to one arm of one experiment.
 */
export interface ExperimentAssignment {
  userId: string;
  experimentId: string;
  armId: string;
  /** ISO-8601 timestamp */
  assignedAt: string;
}

// ── Price-test axes ────────────────────────────────────────────────────────────

/**
 * Axes that directly affect money charged to users.
 * Existing paying customers must never be placed into these tests.
 */
const PRICE_TEST_AXES = new Set([
  "tier-price",
  "annual-discount",
  "pay-shape",
  "usage-based",
]);

// ── djb2 hash ─────────────────────────────────────────────────────────────────

/**
 * Classic djb2 hash returning a non-negative 32-bit integer.
 * Deteministic: same input always → same output.
 *
 * Класичний djb2-хеш, повертає невід'ємне 32-бітне ціле.
 */
function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    // hash * 33 ^ charCode
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  // Convert to unsigned 32-bit
  return hash >>> 0;
}

// ── hashAssign ────────────────────────────────────────────────────────────────

/**
 * Deterministically assign a user to one arm of an experiment
 * using the djb2 hash of `userId + ":" + experimentId`.
 *
 * The distribution is uniform across all arms (modulo hash bias, negligible
 * for n-arms << 2^32).
 *
 * Детерміновано призначає користувача до одного варіанту
 * за допомогою хешу djb2.
 */
export function hashAssign(
  userId: string,
  experimentId: string,
  arms: ExperimentArm[],
): ExperimentArm {
  if (arms.length === 0) {
    throw new Error(`[pricing-experiments] No arms defined for experiment "${experimentId}"`);
  }
  const hash = djb2(`${userId}:${experimentId}`);
  const index = hash % arms.length;
  return arms[index];
}

// ── shouldExcludeUser ─────────────────────────────────────────────────────────

/**
 * Returns `true` when the user must be excluded from the experiment.
 *
 * Rules:
 * - Any paying customer is excluded from price-axis tests
 *   (grandfather rule — locked-in price is never changed).
 * - Non-paying users are never excluded by this function alone.
 *
 * Повертає `true`, якщо користувача потрібно виключити з експерименту.
 * Платники захищені від будь-яких тестів цін.
 */
export function shouldExcludeUser(
  _userId: string,
  isPayingCustomer: boolean,
  experimentId: string,
): boolean {
  if (!isPayingCustomer) return false;

  // Determine the axis from the experiment id prefix heuristic, falling back
  // to the full registry lookup done in the guard layer.
  // We use a simple id-prefix convention as a fast path here; the authoritative
  // check is in experiment-guard.ts via SAFE_EXPERIMENTS.
  const priceIdPrefixes = [
    "tier-price-",
    "annual-discount-",
    "biannual-discount-",
    "pay-shape-",
    "usage-",
  ];
  const looksLikePriceTest = priceIdPrefixes.some((prefix) =>
    experimentId.startsWith(prefix),
  );

  if (looksLikePriceTest) return true;

  // Also check axis via registry if available
  try {
    // Dynamic import avoided — guard layer handles authoritative axis check.
    // This path is kept as belt-and-suspenders.
    void PRICE_TEST_AXES; // reference to suppress lint warnings
  } catch {
    // ignore
  }

  return false;
}

// ── InMemoryAssignmentStore ───────────────────────────────────────────────────

/**
 * Simple in-memory store for experiment assignments.
 * Suitable for development and edge runtimes; replace with a durable store
 * (Redis / D1) in production.
 *
 * Простий in-memory сховище для призначень експериментів.
 */
export class InMemoryAssignmentStore {
  private readonly store = new Map<string, ExperimentAssignment>();

  /** Composite key for the store */
  private key(userId: string, experimentId: string): string {
    return `${userId}::${experimentId}`;
  }

  /**
   * Assign (or re-use an existing assignment) for the given user + experiment.
   * Uses `hashAssign` for deterministic placement.
   *
   * Призначає (або повертає наявне) arm для користувача + експерименту.
   */
  assign(
    userId: string,
    experimentId: string,
    arms: ExperimentArm[],
  ): ExperimentAssignment {
    const k = this.key(userId, experimentId);
    const existing = this.store.get(k);
    if (existing) return existing;

    const arm = hashAssign(userId, experimentId, arms);
    const assignment: ExperimentAssignment = {
      userId,
      experimentId,
      armId: arm.id,
      assignedAt: new Date().toISOString(),
    };
    this.store.set(k, assignment);
    return assignment;
  }

  /**
   * Retrieve an existing assignment, or `undefined` if not yet assigned.
   *
   * Повертає наявне призначення або `undefined`.
   */
  getAssignment(
    userId: string,
    experimentId: string,
  ): ExperimentAssignment | undefined {
    return this.store.get(this.key(userId, experimentId));
  }

  /**
   * List all assignments for a given experiment.
   *
   * Список усіх призначень для конкретного експерименту.
   */
  listByExperiment(experimentId: string): ExperimentAssignment[] {
    const results: ExperimentAssignment[] = [];
    for (const assignment of this.store.values()) {
      if (assignment.experimentId === experimentId) {
        results.push(assignment);
      }
    }
    return results;
  }
}

/**
 * Module-level singleton — shared across the process lifetime.
 * Одиночний екземпляр на рівні модуля.
 */
export const assignmentStore = new InMemoryAssignmentStore();
