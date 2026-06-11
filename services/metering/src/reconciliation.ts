/**
 * Monthly reconciliation report.
 *
 * Compares metered counters (real-time Redis aggregation) against the
 * authoritative event log to catch drift before invoicing.
 */

import { MeteredProduct, METER_SKUS } from "./types";

export interface ReconciliationLine {
  product: MeteredProduct;
  meteredTotal: number;
  /** Authoritative count from the event log / DB */
  authoritativeTotal: number;
  drift: number;
  driftPct: number;
  /** Whether drift exceeds the tolerance and needs investigation */
  flagged: boolean;
}

export interface ReconciliationReport {
  orgId: string;
  period: string;
  generatedAt: string;
  lines: ReconciliationLine[];
  totalFlagged: number;
  /** Whether the report is safe to invoice from */
  safeToInvoice: boolean;
}

/** Drift tolerance — above this fraction, a line is flagged for review. */
const DRIFT_TOLERANCE = 0.01; // 1%

export function reconcile(
  orgId: string,
  period: string,
  metered: Record<MeteredProduct, number>,
  authoritative: Record<MeteredProduct, number>,
): ReconciliationReport {
  const products = Object.keys(METER_SKUS) as MeteredProduct[];
  const lines: ReconciliationLine[] = [];

  for (const product of products) {
    const meteredTotal = metered[product] ?? 0;
    const authoritativeTotal = authoritative[product] ?? 0;
    if (meteredTotal === 0 && authoritativeTotal === 0) continue;

    const drift = meteredTotal - authoritativeTotal;
    const base = Math.max(authoritativeTotal, 1);
    const driftPct = Math.abs(drift) / base;
    lines.push({
      product,
      meteredTotal,
      authoritativeTotal,
      drift,
      driftPct: Math.round(driftPct * 10000) / 100,
      flagged: driftPct > DRIFT_TOLERANCE,
    });
  }

  const totalFlagged = lines.filter((l) => l.flagged).length;
  return {
    orgId,
    period,
    generatedAt: new Date().toISOString(),
    lines,
    totalFlagged,
    safeToInvoice: totalFlagged === 0,
  };
}

export function formatReconciliation(report: ReconciliationReport): string {
  const header = `=== Reconciliation ${report.orgId} ${report.period} ===`;
  const rows = report.lines.map(
    (l) =>
      `  ${l.product.padEnd(20)} metered=${l.meteredTotal} auth=${l.authoritativeTotal} drift=${l.drift} (${l.driftPct}%)${l.flagged ? " ⚠️ FLAGGED" : ""}`,
  );
  const footer = report.safeToInvoice
    ? "✓ Safe to invoice"
    : `✗ ${report.totalFlagged} line(s) flagged — investigate before invoicing`;
  return [header, ...rows, footer].join("\n");
}
