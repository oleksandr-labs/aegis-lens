/**
 * Per-Meter CSV Export — generate a customer-facing CSV report of usage
 * per meter axis for a given billing period.  Suitable for finance
 * reconciliation and audit purposes.
 *
 * Експорт CSV: звіт використання по осях для бухгалтерської звірки.
 */

import type { MeterAxis } from "./usage-meters";
import { usageMeterStore } from "./usage-meters";

// ── Interfaces ────────────────────────────────────────────────────────────────

/** One row in the per-meter CSV export. */
export interface MeterExportRow {
  /** YYYY-MM billing period */
  period: string;
  userId: string;
  axis: MeterAxis;
  /** Friendly English axis label */
  axisLabel: string;
  /** Units consumed this period */
  usedUnits: number;
  /** Tier quota (empty string if unlimited) */
  quotaUnits: string;
  /** Units over quota (0 if within quota) */
  overageUnits: number;
  /** USD cost of overage (0 if within quota) */
  overageCostUsd: number;
  /** ISO 8601 — when this row was generated */
  exportedAt: string;
}

// ── Axis labels ───────────────────────────────────────────────────────────────

const AXIS_LABEL: Record<MeterAxis, string> = {
  "api-calls": "API Requests",
  "ai-tokens": "AI Tokens",
  "aoi-area-km2": "AOI Area (km²)",
  "export-rows": "Export Rows",
  "alert-deliveries": "Alerts / Webhooks",
  "satellite-scenes": "Satellite Scenes",
};

/** USD overage unit costs per axis (stubs — match tiered-overage.ts). */
const OVERAGE_UNIT_COST_USD: Partial<Record<MeterAxis, number>> = {
  "api-calls": 0.001,
  "ai-tokens": 0.0005,
  "aoi-area-km2": 0.005,
  "export-rows": 0.00001,
  "alert-deliveries": 0.0002,
  "satellite-scenes": 2.0,
};

// ── buildMeterCsvExport ───────────────────────────────────────────────────────

/**
 * Build the list of export rows for a given user and period.
 *
 * `period` should be in `YYYY-MM` format.  If omitted, the current month is used.
 *
 * Формує рядки для CSV-звіту. period = 'YYYY-MM'; за замовчуванням — поточний місяць.
 */
export function buildMeterCsvExport(
  userId: string,
  period?: string,
  tierId = "free",
): MeterExportRow[] {
  const d = new Date();
  const p =
    period ??
    `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

  const snapshot = usageMeterStore.getUsage(userId, tierId);
  const exportedAt = new Date().toISOString();

  return (Object.keys(snapshot.meters) as MeterAxis[]).map((axis): MeterExportRow => {
    const used = snapshot.meters[axis] ?? 0;
    const rawQuota = snapshot.limits[axis];
    const quota = rawQuota ?? null;
    const overageUnits = quota !== null ? Math.max(0, used - quota) : 0;
    const unitCost = OVERAGE_UNIT_COST_USD[axis] ?? 0;
    const overageCostUsd = Math.round(overageUnits * unitCost * 1_000_000) / 1_000_000;

    return {
      period: p,
      userId,
      axis,
      axisLabel: AXIS_LABEL[axis] ?? axis,
      usedUnits: used,
      quotaUnits: quota !== null ? String(quota) : "unlimited",
      overageUnits,
      overageCostUsd,
      exportedAt,
    };
  });
}

// ── meterCsvToString ──────────────────────────────────────────────────────────

/**
 * Serialise an array of MeterExportRow objects to a CSV string.
 *
 * Fields are comma-separated; values containing commas are double-quoted.
 * First row is a header.
 *
 * Серіалізує рядки у рядок CSV з заголовком.
 */
export function meterCsvToString(rows: MeterExportRow[]): string {
  const HEADERS: Array<keyof MeterExportRow> = [
    "period",
    "userId",
    "axis",
    "axisLabel",
    "usedUnits",
    "quotaUnits",
    "overageUnits",
    "overageCostUsd",
    "exportedAt",
  ];

  function escape(value: string | number): string {
    const s = String(value);
    return s.includes(",") ? `"${s.replace(/"/g, '""')}"` : s;
  }

  const header = HEADERS.join(",");
  const dataRows = rows.map((row) =>
    HEADERS.map((h) => escape(row[h])).join(","),
  );

  return [header, ...dataRows].join("\r\n");
}
