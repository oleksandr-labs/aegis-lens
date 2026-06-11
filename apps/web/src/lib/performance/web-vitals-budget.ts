/**
 * Web Vitals performance budget for key pages.
 * Used by Lighthouse CI and real-user monitoring to gate deploys.
 *
 * Бюджет продуктивності Web Vitals для ключових сторінок.
 * Використовується Lighthouse CI та RUM для контролю деплоїв.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WebVital = "LCP" | "CLS" | "FID" | "INP" | "TTFB" | "FCP";

export interface VitalBudget {
  vital: WebVital;
  /** Threshold for "good" rating */
  good: number;
  /** Threshold for "needs improvement" (above this → "poor") */
  needsImprovement: number;
  unit: "ms" | "score";
}

// ---------------------------------------------------------------------------
// Budget table
// ---------------------------------------------------------------------------

/**
 * Web Vitals thresholds aligned with Google CWV definitions (2024 update).
 * Порогові значення Web Vitals відповідно до Google CWV (оновлення 2024).
 */
export const WEB_VITALS_BUDGET: VitalBudget[] = [
  { vital: "LCP",  good: 2_000, needsImprovement: 4_000, unit: "ms"    },
  { vital: "CLS",  good: 0.05,  needsImprovement: 0.25,  unit: "score" },
  { vital: "FID",  good: 100,   needsImprovement: 300,   unit: "ms"    },
  { vital: "INP",  good: 200,   needsImprovement: 500,   unit: "ms"    },
  { vital: "TTFB", good: 800,   needsImprovement: 1_800, unit: "ms"    },
  { vital: "FCP",  good: 1_800, needsImprovement: 3_000, unit: "ms"    },
];

// ---------------------------------------------------------------------------
// Per-page budgets (stricter than global defaults where required)
// ---------------------------------------------------------------------------

/**
 * Page-specific override budgets — must be ≤ the global WEB_VITALS_BUDGET values.
 * Сторінкові бюджети — мають бути ≤ глобальним WEB_VITALS_BUDGET.
 */
export const PAGE_BUDGETS: Record<"/map" | "/home" | "/blog", Partial<Record<WebVital, number>>> = {
  "/home": {
    LCP:  2_000,
    CLS:  0.05,
    INP:  200,
    TTFB: 600,
  },
  "/map": {
    LCP:  2_500,
    CLS:  0.1,
    INP:  300,
    TTFB: 800,
  },
  "/blog": {
    LCP:  1_800,
    CLS:  0.05,
    INP:  200,
    TTFB: 600,
  },
};

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/**
 * Checks a measured vital value against a budget entry and returns a rating.
 * Перевіряє виміряне значення показника відносно бюджетного запису.
 */
export function checkVitalAgainstBudget(
  vital: WebVital,
  value: number,
  budget: VitalBudget,
): "good" | "needs-improvement" | "poor" {
  void vital; // parameter reserved for logging / tracing
  if (value <= budget.good) return "good";
  if (value <= budget.needsImprovement) return "needs-improvement";
  return "poor";
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export const VITALS_NOTES_EN: string[] = [
  "Lighthouse-CI-integration: add a lighthouserc.json referencing PAGE_BUDGETS; run in GitHub Actions on every PR to block merges that regress CWV.",
  "real-user-monitoring-Vercel-Analytics: instrument @vercel/analytics or web-vitals package to capture field LCP/CLS/INP and compare against WEB_VITALS_BUDGET thresholds in the observability dashboard.",
];

export const VITALS_NOTES_UK: string[] = [
  "Lighthouse-CI-integration: додати lighthouserc.json з посиланням на PAGE_BUDGETS; запускати в GitHub Actions на кожен PR, щоб блокувати злиття з регресією CWV.",
  "real-user-monitoring-Vercel-Analytics: підключити @vercel/analytics або пакет web-vitals для збору польових LCP/CLS/INP і порівняння з порогами WEB_VITALS_BUDGET на дашборді спостереження.",
];
