/**
 * Usage Dashboard — builds per-meter usage data with a month-cost forecast
 * for display in the user-facing billing dashboard.
 *
 * Дашборд використання: дані по кожній осі + прогноз вартості до кінця місяця.
 */

import type { MeterAxis } from "./usage-meters";
import { usageMeterStore } from "./usage-meters";

// ── Constants ─────────────────────────────────────────────────────────────────

/** Number of days used for forecast extrapolation. */
export const FORECAST_DAYS = 30;
// Кількість днів для прогнозу.

/** USD overage unit costs per axis (stubs — tune before launch). */
const OVERAGE_UNIT_COST_USD: Partial<Record<MeterAxis, number>> = {
  "api-calls": 0.001,         // $1 / 1k requests
  "ai-tokens": 0.0005,        // $0.50 / 1k tokens (blended)
  "aoi-area-km2": 0.005,      // $0.005 / km²/day
  "export-rows": 0.00001,     // $1 / 100k rows
  "alert-deliveries": 0.0002, // metered
  "satellite-scenes": 2.0,    // vendor passthrough stub
};

// ── Interfaces ────────────────────────────────────────────────────────────────

/** One row in the usage dashboard, one per metered axis. */
export interface UsageDashboardEntry {
  axis: MeterAxis;
  /** Friendly English label */
  label_en: string;
  /** Friendly Ukrainian label */
  label_uk: string;
  /** Units consumed this billing period */
  used: number;
  /** Tier quota for this axis (null = unlimited) */
  quota: number | null;
  /** Percent of quota used (0–100+; null if quota is unlimited) */
  pctUsed: number | null;
  /** Units over quota (0 if within) */
  overageUnits: number;
  /** USD cost of overage so far this period */
  overageCostUsd: number;
  /** Projected total units by end of billing month (linear extrapolation) */
  forecastUnits: number;
  /** Projected USD overage cost by end of month */
  forecastOverageCostUsd: number;
  /** YYYY-MM billing period */
  period: string;
}

// ── Axis labels ───────────────────────────────────────────────────────────────

const AXIS_LABELS: Record<MeterAxis, { en: string; uk: string }> = {
  "api-calls": { en: "API Requests", uk: "API-запити" },
  "ai-tokens": { en: "AI Tokens", uk: "AI-токени" },
  "aoi-area-km2": { en: "AOI Area (km²)", uk: "Площа AOI (км²)" },
  "export-rows": { en: "Export Rows", uk: "Рядки експорту" },
  "alert-deliveries": { en: "Alerts / Webhooks", uk: "Сповіщення / вебхуки" },
  "satellite-scenes": { en: "Satellite Scenes", uk: "Супутникові сцени" },
};

// ── Period helpers ────────────────────────────────────────────────────────────

function currentPeriod(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Returns the elapsed fraction of the current calendar month (0–1). */
function elapsedMonthFraction(): number {
  const now = new Date();
  const dayOfMonth = now.getUTCDate();
  const daysInMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return Math.max(dayOfMonth / daysInMonth, 0.01); // avoid divide-by-zero on day 0
}

// ── buildUsageDashboard ───────────────────────────────────────────────────────

/**
 * Build the usage dashboard entries for a user.
 *
 * Uses the in-memory UsageMeterStore for current usage data.
 * In production, replace with a DB query.
 *
 * Формує записи дашборду використання для користувача.
 */
export function buildUsageDashboard(
  userId: string,
  tierId = "free",
): UsageDashboardEntry[] {
  const snapshot = usageMeterStore.getUsage(userId, tierId);
  const period = currentPeriod();
  const elapsed = elapsedMonthFraction();

  const axes = Object.keys(snapshot.meters) as MeterAxis[];

  return axes.map((axis): UsageDashboardEntry => {
    const used = snapshot.meters[axis] ?? 0;
    const quota = snapshot.limits[axis] ?? null;
    const pctUsed = quota !== null ? Math.round((used / quota) * 100 * 10) / 10 : null;
    const overageUnits = quota !== null ? Math.max(0, used - quota) : 0;
    const unitCost = OVERAGE_UNIT_COST_USD[axis] ?? 0;
    const overageCostUsd = overageUnits * unitCost;

    // Linear forecast: units_at_month_end = used / elapsed
    const forecastUnits = Math.round(used / elapsed);
    const forecastOverage = quota !== null ? Math.max(0, forecastUnits - quota) : 0;
    const forecastOverageCostUsd = forecastOverage * unitCost;

    const labels = AXIS_LABELS[axis] ?? { en: axis, uk: axis };

    return {
      axis,
      label_en: labels.en,
      label_uk: labels.uk,
      used,
      quota,
      pctUsed,
      overageUnits,
      overageCostUsd: Math.round(overageCostUsd * 10000) / 10000,
      forecastUnits,
      forecastOverageCostUsd: Math.round(forecastOverageCostUsd * 10000) / 10000,
      period,
    };
  });
}
