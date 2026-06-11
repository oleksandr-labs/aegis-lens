/**
 * TASK 3 — Delay policy.
 *
 * NO near-real-time precise positions, ever. Every report carries an enforced
 * minimum delay between when it occurred and when the PUBLIC may see it. The
 * delay is configurable PER SCENARIO, but is fail-closed: an unknown scenario
 * falls back to the most conservative (longest) delay, never to zero.
 */

import type { TroopMovementReport } from "./types";

/** Named scenarios with distinct sensitivity profiles. */
export type DelayScenario =
  | "active_frontline"   // most sensitive — long delay
  | "rear_movement"      // logistics in the rear
  | "historical"         // archival / past phases
  | "default";

/** Per-scenario minimum public-visibility delay, in milliseconds. */
export const SCENARIO_MIN_DELAY_MS: Record<DelayScenario, number> = {
  active_frontline: 72 * 3600_000, // 72h — never expose live frontline movement
  rear_movement: 24 * 3600_000,    // 24h
  historical: 6 * 3600_000,        // 6h (still never live)
  default: 72 * 3600_000,          // fail-closed → most conservative
};

/**
 * The conservative fallback used whenever a scenario cannot be resolved. Public
 * exposure delay can NEVER be shorter than this.
 */
export const FAIL_CLOSED_MIN_DELAY_MS = SCENARIO_MIN_DELAY_MS.default;

/**
 * Absolute floor — no scenario, however configured, may ever expose a report
 * sooner than this. This is the live/near-real-time exclusion guarantee.
 * 6 hours: matches the ingestion post-event lag.
 */
export const ABSOLUTE_MIN_DELAY_MS = 6 * 3600_000;

/**
 * Resolve a scenario's minimum delay. Unknown/missing scenarios fail closed to
 * the most conservative configured value; every result is clamped up to the
 * absolute floor so a misconfiguration can never produce a near-live position.
 */
export function minDelayForScenario(scenario?: DelayScenario): number {
  const configured = (scenario && scenario in SCENARIO_MIN_DELAY_MS)
    ? SCENARIO_MIN_DELAY_MS[scenario]
    : FAIL_CLOSED_MIN_DELAY_MS;
  return Math.max(configured, ABSOLUTE_MIN_DELAY_MS);
}

/**
 * Compute the earliest instant a report may become public.
 * publishableAt = occurredAt + minDelay(scenario).
 */
export function computePublishableAt(occurredAt: string, scenario?: DelayScenario): string {
  const base = new Date(occurredAt).getTime();
  const delay = minDelayForScenario(scenario);
  const safeBase = Number.isNaN(base) ? Date.now() : base;
  return new Date(safeBase + delay).toISOString();
}

/**
 * Guard: is a report cleared for PUBLIC visibility right now?
 * Fail-closed — if `publishableAt` is missing/unparseable, returns false.
 */
export function isPubliclyVisibleNow(
  report: Pick<TroopMovementReport, "publishableAt">,
  now: number = Date.now(),
): boolean {
  if (!report.publishableAt) return false;
  const t = new Date(report.publishableAt).getTime();
  if (Number.isNaN(t)) return false;
  return now >= t;
}

/**
 * Apply the delay policy to a report: stamps `publishableAt` and downgrades
 * `isPublic` to false until the delay has elapsed. Returns a NEW object.
 */
export function applyDelay(
  report: TroopMovementReport,
  scenario?: DelayScenario,
  now: number = Date.now(),
): TroopMovementReport {
  const publishableAt = computePublishableAt(report.occurredAt, scenario);
  const cleared = now >= new Date(publishableAt).getTime();
  return {
    ...report,
    publishableAt,
    // Fail-closed: only public once the delay has elapsed AND it was already public-eligible.
    isPublic: report.isPublic && cleared,
  };
}
