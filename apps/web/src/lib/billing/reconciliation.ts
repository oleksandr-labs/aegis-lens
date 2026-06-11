'use server';

/**
 * Reconciliation Job — nightly comparison of emitted usage meters vs
 * invoiced amounts to catch discrepancies before invoice finalisation.
 *
 * Run as a scheduled server-side job (e.g. cron at 03:00 UTC).
 * STUB: replace database queries with real Prisma / Stripe SDK calls.
 *
 * Нічна звірка: порівнює зафіксовані події з виставленими рахунками.
 * Запускати як cron-задачу о 03:00 UTC. Заглушка — замінити реальними запитами.
 */

import type { MeterAxis } from "./usage-meters";

// ── Interfaces ────────────────────────────────────────────────────────────────

/** Discrepancy found for a single user+axis. */
export interface ReconciliationDiscrepancy {
  userId: string;
  axis: MeterAxis;
  /** YYYY-MM billing period under review */
  period: string;
  /** Units recorded in the usage event store */
  emittedUnits: number;
  /** Units that Stripe invoiced (from invoice line items) */
  invoicedUnits: number;
  /** Difference: emittedUnits − invoicedUnits (negative = under-billed) */
  deltaUnits: number;
  /** Estimated revenue impact in USD */
  deltaUsd: number;
}

/** Summary result of a single reconciliation run. */
export interface ReconciliationResult {
  /** ISO 8601 — when the job ran */
  runAt: string;
  /** YYYY-MM period that was reconciled */
  period: string;
  /** Total users checked */
  usersChecked: number;
  /** Number of discrepancies found */
  discrepanciesFound: number;
  /** List of individual discrepancies */
  discrepancies: ReconciliationDiscrepancy[];
  /** Whether the run completed without errors */
  success: boolean;
  /** Error message if success=false */
  errorMessage?: string;
}

// ── Period helper ─────────────────────────────────────────────────────────────

function previousPeriod(): string {
  const d = new Date();
  const prev = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1));
  return `${prev.getUTCFullYear()}-${String(prev.getUTCMonth() + 1).padStart(2, "0")}`;
}

// ── Stub data sources ─────────────────────────────────────────────────────────

/**
 * Stub: fetch emitted usage totals from the usage event store for `period`.
 * In production: query the idempotent_usage_events table grouped by user+axis.
 *
 * Заглушка: повертає зафіксовані події (замінити реальним запитом до БД).
 */
async function fetchEmittedUsage(
  _period: string,
): Promise<Array<{ userId: string; axis: MeterAxis; units: number }>> {
  // STUB — returns an empty list.
  return [];
}

/**
 * Stub: fetch invoiced amounts from Stripe for `period`.
 * In production: query Stripe's Invoice Line Items API or a local cache.
 *
 * Заглушка: повертає виставлені рахунки (замінити запитом до Stripe).
 */
async function fetchInvoicedUsage(
  _period: string,
): Promise<Array<{ userId: string; axis: MeterAxis; units: number }>> {
  // STUB — returns an empty list.
  return [];
}

// ── runNightlyReconciliation ──────────────────────────────────────────────────

/**
 * Run the nightly reconciliation job for the previous billing period.
 *
 * Steps:
 * 1. Fetch emitted usage totals from the event store.
 * 2. Fetch invoiced totals from Stripe.
 * 3. Diff the two — any delta beyond a tolerance threshold is a discrepancy.
 * 4. Return a ReconciliationResult for alerting / audit logging.
 *
 * Кроки: завантажити емітовані події → завантажити виставлені рахунки → порівняти.
 */
export async function runNightlyReconciliation(): Promise<ReconciliationResult> {
  const runAt = new Date().toISOString();
  const period = previousPeriod();

  try {
    const emitted = await fetchEmittedUsage(period);
    const invoiced = await fetchInvoicedUsage(period);

    // Build lookup: `${userId}:${axis}` → units
    const invoicedMap = new Map<string, number>();
    for (const row of invoiced) {
      invoicedMap.set(`${row.userId}:${row.axis}`, row.units);
    }

    const discrepancies: ReconciliationDiscrepancy[] = [];
    const usersSeen = new Set<string>();

    for (const row of emitted) {
      usersSeen.add(row.userId);
      const invoicedUnits = invoicedMap.get(`${row.userId}:${row.axis}`) ?? 0;
      const delta = row.units - invoicedUnits;

      // Tolerance: ignore deltas within 1 unit (float rounding).
      if (Math.abs(delta) <= 1) continue;

      // Stub: use a flat $0.001 / unit for revenue impact estimate.
      const deltaUsd = delta * 0.001;

      discrepancies.push({
        userId: row.userId,
        axis: row.axis,
        period,
        emittedUnits: row.units,
        invoicedUnits,
        deltaUnits: delta,
        deltaUsd,
      });
    }

    return {
      runAt,
      period,
      usersChecked: usersSeen.size,
      discrepanciesFound: discrepancies.length,
      discrepancies,
      success: true,
    };
  } catch (err) {
    return {
      runAt,
      period,
      usersChecked: 0,
      discrepanciesFound: 0,
      discrepancies: [],
      success: false,
      errorMessage: err instanceof Error ? err.message : String(err),
    };
  }
}
