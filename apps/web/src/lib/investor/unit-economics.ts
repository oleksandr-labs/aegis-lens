/**
 * Unit Economics — ARR targets, margin, and LTV:CAC model.
 *
 * Seed-stage projections based on bottom-up customer count assumptions.
 * All figures in USD.
 *
 * Юніт-економіка: цілі ARR, маржа, LTV:CAC. Усі цифри в USD.
 */

// ── ARR targets ───────────────────────────────────────────────────────────────

/** Year 1 ARR target — Ціль ARR рік 1 */
export const TARGET_ARR_Y1_USD = 500_000;

/** Year 2 ARR target — Ціль ARR рік 2 */
export const TARGET_ARR_Y2_USD = 3_000_000;

/** Year 3 ARR target — Ціль ARR рік 3 */
export const TARGET_ARR_Y3_USD = 12_000_000;

// ── Margin & efficiency ───────────────────────────────────────────────────────

/** Target gross margin (software + AI infra) — Цільова валова маржа */
export const GROSS_MARGIN_TARGET = 0.75;

/** Target LTV:CAC ratio — Цільове відношення LTV:CAC */
export const LTV_CAC_TARGET = 4;

/** Target payback period in months — Цільовий термін окупності (міс) */
export const PAYBACK_PERIOD_MONTHS = 18;

// ── Model ─────────────────────────────────────────────────────────────────────

export interface UnitEconomicsModel {
  /** Average Revenue Per Account per month — ARPA на місяць */
  arpaMonthlyUsd: number;
  /** Monthly churn rate — Місячний відтік */
  monthlyChurnRate: number;
  /** Average Customer Acquisition Cost — CAC */
  cacUsd: number;
  /** Calculated LTV — LTV */
  ltvUsd: number;
  /** Calculated LTV:CAC ratio — Відношення LTV:CAC */
  ltvCacRatio: number;
  /** Gross margin — Валова маржа */
  grossMargin: number;
  arrTargets: {
    y1: number;
    y2: number;
    y3: number;
  };
}

function buildUnitEconomicsModel(): UnitEconomicsModel {
  const arpaMonthlyUsd = 250;       // blended across pro + enterprise
  const monthlyChurnRate = 0.015;   // 1.5% monthly = ~17% annual
  const grossMargin = GROSS_MARGIN_TARGET;
  const cacUsd = 800;               // blended CAC (inbound-heavy)

  const avgLifetimeMonths = 1 / monthlyChurnRate;
  const ltvUsd = arpaMonthlyUsd * grossMargin * avgLifetimeMonths;
  const ltvCacRatio = ltvUsd / cacUsd;

  return {
    arpaMonthlyUsd,
    monthlyChurnRate,
    cacUsd,
    ltvUsd: Math.round(ltvUsd),
    ltvCacRatio: Math.round(ltvCacRatio * 10) / 10,
    grossMargin,
    arrTargets: {
      y1: TARGET_ARR_Y1_USD,
      y2: TARGET_ARR_Y2_USD,
      y3: TARGET_ARR_Y3_USD,
    },
  };
}

export const UNIT_ECONOMICS_MODEL: UnitEconomicsModel = buildUnitEconomicsModel();

// ── Customer count assumptions ────────────────────────────────────────────────

export interface CustomerCountAssumption {
  year: 1 | 2 | 3;
  proUsers: number;
  teamAccounts: number;
  enterpriseContracts: number;
  totalArr: number;
}

export const CUSTOMER_COUNT_ASSUMPTIONS: CustomerCountAssumption[] = [
  { year: 1, proUsers: 120,    teamAccounts: 15,  enterpriseContracts: 2,  totalArr: TARGET_ARR_Y1_USD },
  { year: 2, proUsers: 600,    teamAccounts: 80,  enterpriseContracts: 10, totalArr: TARGET_ARR_Y2_USD },
  { year: 3, proUsers: 2_000,  teamAccounts: 300, enterpriseContracts: 30, totalArr: TARGET_ARR_Y3_USD },
];
