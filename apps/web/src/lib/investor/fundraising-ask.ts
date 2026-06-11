/**
 * Fundraising Ask — seed round details and use-of-funds breakdown.
 *
 * $2M seed to hire the team, launch the public map, and hit $500K ARR in 12 months.
 *
 * Seed-раунд $2M: команда, публічна карта, $500K ARR за 12 місяців.
 */

// ── Round ─────────────────────────────────────────────────────────────────────

export type FundraisingRoundType = 'pre-seed' | 'seed' | 'series-a' | 'series-b';

export interface FundraisingRound {
  type: FundraisingRoundType;
  /** Ask in USD — Запит (USD) */
  askUsd: number;
  /** Target close date — Цільова дата закриття */
  targetCloseDate: string;
  /** Instrument — Інструмент */
  instrument: 'SAFE' | 'convertible-note' | 'priced-equity';
  /** Valuation cap for SAFE/note — Стеля оцінки */
  valuationCapUsd: number | null;
  /** Lead investor type sought — Тип лід-інвестора */
  leadInvestorType: string;
  /** Use of funds breakdown (keys are categories, values are fractions) */
  useOfFunds: Record<string, number>;
  /** Runway in months — Runway (міс) */
  runwayMonths: number;
}

// ── Current round ─────────────────────────────────────────────────────────────

export const CURRENT_ROUND = 'seed' as const;
export const ASK_USD = 2_000_000 as const;

/**
 * Use of funds breakdown — fractions sum to 1.0.
 *
 * Розподіл коштів — частки в сумі дорівнюють 1.0.
 */
export const USE_OF_FUNDS: Record<string, number> = {
  engineering:  0.50,  // 4 senior hires + infra — 4 найми + інфра
  data:         0.20,  // data licensing, satellite APIs, FIRMS — ліцензії даних
  sales:        0.15,  // GTM, BD, first enterprise pilots — GTM + пілоти
  ops:          0.15,  // legal, compliance (SOC 2), office, tools — операції
};

export const SEED_ROUND: FundraisingRound = {
  type: 'seed',
  askUsd: ASK_USD,
  targetCloseDate: 'Q4 2026',
  instrument: 'SAFE',
  valuationCapUsd: 10_000_000,
  leadInvestorType: 'Conflict-tech / impact / dual-use VC or strategic angel',
  useOfFunds: USE_OF_FUNDS,
  runwayMonths: 18,
};

// ── Milestones unlocked ───────────────────────────────────────────────────────

/**
 * Key milestones the seed capital unlocks.
 *
 * Ключові віхи, які відкриває seed-капітал.
 */
export const SEED_MILESTONES_UNLOCKED: string[] = [
  'Hire CTO, Head of Intelligence, ML Engineer, Sales Lead',
  'Launch public live map (free tier) — viral OSINT community distribution',
  'Complete Phase 1 ingestion pipeline (Telegram, RSS, FIRMS, ADS-B, Sentinel-2)',
  'Onboard 5–10 paying pilot customers (media + NGO)',
  'Hit $500K ARR milestone triggering Series A preparation',
  'Build waitlist of 10,000+ for paid tiers',
];

// ── Notes ─────────────────────────────────────────────────────────────────────

export const FUNDRAISING_NOTE_EN =
  'We are raising $2M on a SAFE with a $10M valuation cap. ' +
  '50% of capital goes directly to engineering headcount — this is a technical product ' +
  'and the team is the product. We project $500K ARR at 12 months and will raise ' +
  'a $10–15M Series A at 24 months on the back of enterprise traction.';

export const FUNDRAISING_NOTE_UK =
  'Залучаємо $2M на SAFE з оцінкою $10M. ' +
  '50% капіталу — безпосередньо на наймання інженерів: це технічний продукт, ' +
  'і команда є самим продуктом. Очікуємо $500K ARR за 12 місяців ' +
  'та Series A $10–15M через 24 місяці на основі enterprise-тракції.';
