/**
 * Severity gauge widget — level definitions and trend computation.
 * Віджет шкали небезпеки — визначення рівнів та обчислення тренду.
 *
 * NOTE (EN): Levels 0–5 map to unknown→critical; level 0 is used when data is unavailable.
 * NOTE (UK): Рівні 0–5 відповідають unknown→critical; рівень 0 використовується, коли дані недоступні.
 *
 * NOTE (EN): computeSeverityTrend compares current vs previous numeric level; stable = equal.
 * NOTE (UK): computeSeverityTrend порівнює поточний і попередній числові рівні; stable = рівні.
 */

// ---------------------------------------------------------------------------
// SeverityLevel type
// ---------------------------------------------------------------------------

export interface SeverityLevel {
  level: number;
  label: string;
  labelUk: string;
  color: string;
}

// ---------------------------------------------------------------------------
// SEVERITY_LEVELS
// ---------------------------------------------------------------------------

/**
 * Six-level severity scale: 0 (unknown) → 5 (critical).
 * Шестирівнева шкала небезпеки: 0 (невідомо) → 5 (критичний).
 */
export const SEVERITY_LEVELS: SeverityLevel[] = [
  { level: 0, label: "Unknown",  labelUk: "Невідомо",  color: "#888888" },
  { level: 1, label: "Minimal",  labelUk: "Мінімальна", color: "#22aa44" },
  { level: 2, label: "Low",      labelUk: "Низька",     color: "#aacc00" },
  { level: 3, label: "Moderate", labelUk: "Помірна",    color: "#ff8800" },
  { level: 4, label: "High",     labelUk: "Висока",     color: "#dd2200" },
  { level: 5, label: "Critical", labelUk: "Критична",   color: "#880000" },
];

// ---------------------------------------------------------------------------
// SeverityGaugeData
// ---------------------------------------------------------------------------

export interface SeverityGaugeData {
  currentLevel: number;
  previousLevel: number;
  trend: "up" | "down" | "stable";
  region: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// computeSeverityTrend
// ---------------------------------------------------------------------------

/**
 * Determine the trend direction from current vs previous severity level.
 * Визначає напрям тренду з поточного та попереднього рівня небезпеки.
 */
export function computeSeverityTrend(
  current: number,
  previous: number,
): SeverityGaugeData["trend"] {
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "stable";
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/**
 * Look up a SeverityLevel by numeric level (clamped to 0–5).
 * Повертає SeverityLevel за числовим рівнем (обмежено 0–5).
 */
export function getSeverityLevel(level: number): SeverityLevel {
  const clamped = Math.max(0, Math.min(5, Math.round(level)));
  return SEVERITY_LEVELS[clamped];
}
