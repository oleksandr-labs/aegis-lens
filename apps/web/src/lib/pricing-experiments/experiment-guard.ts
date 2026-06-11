"use server";

/**
 * Server-side guards for pricing experiments.
 *
 * Серверні захисники для цінових експериментів.
 *
 * All functions run server-only. Never expose arm details to the client
 * before the user is assigned — prevents cherry-picking.
 */

import type { ExperimentArm } from "./types";
import { getExperiment, PRICING_EXPERIMENTS } from "./experiment-registry";
import { assignmentStore, shouldExcludeUser } from "./ab-testing";

// ── Safe experiments ───────────────────────────────────────────────────────────

/**
 * Experiments that are safe to run on ANY user, including existing paying
 * customers, because they do NOT change the price charged.
 *
 * Non-price UX tests only: teaser style, upgrade prompt style,
 * and trial tests targeting new signups only.
 *
 * Безпечні експерименти, що не змінюють ціну і можуть торкатися
 * і платних клієнтів.
 */
export const SAFE_EXPERIMENTS = new Set<string>([
  "gate-teaser-style",
  "gate-upgrade-prompt-style",
  // Trial tests are safe for new signups; guard will check paying status separately
  "trial-duration-days",
  "trial-card-required",
  "trial-auto-convert",
  "trial-tier-pro-vs-proplus",
  // Post-test process items are always safe
  "post-test-cohort-retention",
  "post-test-grandfather-rule",
  "post-test-decision-record",
]);

// ── checkExperimentActive ──────────────────────────────────────────────────────

/**
 * Returns `true` if the experiment exists and is currently `running`.
 *
 * Повертає `true`, якщо експеримент існує та має статус `running`.
 */
export function checkExperimentActive(experimentId: string): boolean {
  const experiment = getExperiment(experimentId);
  return experiment?.status === "running";
}

// ── getActiveArm ──────────────────────────────────────────────────────────────

/**
 * Returns the assigned arm for the user, or `null` when:
 * - The experiment does not exist or is not running.
 * - The user is a paying customer and the experiment is NOT in SAFE_EXPERIMENTS.
 *
 * Повертає призначений варіант або `null`, якщо:
 * - Експеримент не існує / не запущений.
 * - Клієнт платний і тест не входить до SAFE_EXPERIMENTS.
 */
export function getActiveArm(
  userId: string,
  experimentId: string,
  isPayingCustomer = false,
): ExperimentArm | null {
  const experiment = getExperiment(experimentId);
  if (!experiment || experiment.status !== "running") return null;

  // Paying customers are excluded from price tests (grandfather rule)
  if (isPayingCustomer && !SAFE_EXPERIMENTS.has(experimentId)) {
    return null;
  }

  // Fast-path exclusion based on axis (belt-and-suspenders)
  if (shouldExcludeUser(userId, isPayingCustomer, experimentId)) {
    return null;
  }

  const assignment = assignmentStore.assign(userId, experimentId, experiment.arms);
  const arm = experiment.arms.find((a) => a.id === assignment.armId);
  return arm ?? null;
}

// ── recordConversion ──────────────────────────────────────────────────────────

/**
 * Record a conversion event for analytics.
 * Currently logs to console in development; replace with a durable
 * event sink (PostHog, Mixpanel, custom DB) in production.
 *
 * Фіксує подію конверсії для аналітики.
 */
export function recordConversion(
  userId: string,
  experimentId: string,
  event: "signup" | "upgrade" | "cancel",
): void {
  const assignment = assignmentStore.getAssignment(userId, experimentId);
  if (!assignment) {
    // User was never assigned — nothing to record
    return;
  }

  // Structured log — consumed by the observability pipeline
  const record = {
    type: "pricing_experiment_conversion",
    userId,
    experimentId,
    armId: assignment.armId,
    event,
    recordedAt: new Date().toISOString(),
  };

  // In server components / route handlers this reaches stdout → log aggregator
  console.log(JSON.stringify(record));
}

// ── Convenience: list running experiments ─────────────────────────────────────

/**
 * Returns all currently running experiments.
 * Used by the API route to surface active tests.
 *
 * Повертає всі запущені на даний момент експерименти.
 */
export function listRunningExperiments() {
  return PRICING_EXPERIMENTS.filter((e) => e.status === "running");
}
