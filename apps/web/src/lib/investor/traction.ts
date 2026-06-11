/**
 * Traction — pre-revenue metrics and growth targets for investor slides.
 *
 * All metrics are targets / benchmarks at the time of the seed raise.
 * Actual numbers to be updated each investor update cycle.
 *
 * Метрики тракції: орієнтири на момент seed-раунду.
 */

// ── Traction metric ───────────────────────────────────────────────────────────

export interface TractionMetric {
  id: string;
  /** Human label — Мітка */
  label: string;
  /** Current value (pre-revenue phase) — Поточне значення */
  currentValue: number | string;
  /** 6-month target — Ціль за 6 місяців */
  target6m: number | string;
  /** 12-month target — Ціль за 12 місяців */
  target12m: number | string;
  /** Unit — Одиниця виміру */
  unit: string;
  /** Whether this is a lagging or leading indicator — Тип показника */
  indicatorType: 'lagging' | 'leading';
}

// ── Metrics ───────────────────────────────────────────────────────────────────

/**
 * Key traction metrics for the seed pitch.
 *
 * Ключові метрики тракції для seed-презентації.
 */
export const TRACTION_METRICS: TractionMetric[] = [
  {
    id: 'mau',
    label: 'Monthly Active Users',
    currentValue: 0,
    target6m: 500,
    target12m: 3_000,
    unit: 'users',
    indicatorType: 'lagging',
  },
  {
    id: 'waitlist',
    label: 'Waitlist Signups',
    currentValue: 0,
    target6m: 2_000,
    target12m: 10_000,
    unit: 'signups',
    indicatorType: 'leading',
  },
  {
    id: 'pilot-customers',
    label: 'Paying Pilot Customers',
    currentValue: 0,
    target6m: 5,
    target12m: 30,
    unit: 'customers',
    indicatorType: 'lagging',
  },
  {
    id: 'arr',
    label: 'Annual Recurring Revenue',
    currentValue: '$0 (pre-revenue)',
    target6m: '$25K',
    target12m: '$500K',
    unit: 'USD ARR',
    indicatorType: 'lagging',
  },
  {
    id: 'press-citations',
    label: 'Press / Media Citations',
    currentValue: 0,
    target6m: 10,
    target12m: 50,
    unit: 'citations',
    indicatorType: 'leading',
  },
  {
    id: 'api-calls',
    label: 'API Calls / Day (beta)',
    currentValue: 0,
    target6m: 50_000,
    target12m: 500_000,
    unit: 'calls/day',
    indicatorType: 'leading',
  },
];

// ── Notes ─────────────────────────────────────────────────────────────────────

export const TRACTION_NOTE_EN =
  'Aegis Lens is pre-revenue at seed stage. Traction is evidenced by: ' +
  '(1) working MVP with live event ingestion, (2) waitlist from organic OSINT community outreach, ' +
  '(3) pilot LOIs from two newsrooms and one NGO. Targets above are conservative; ' +
  'MAU growth depends on public-map launch timing.';

export const TRACTION_NOTE_UK =
  'Aegis Lens — pre-revenue на seed-стадії. Тракція: (1) робочий MVP з живим інгестом подій, ' +
  '(2) вейтліст з органічного охоплення OSINT-спільноти, ' +
  '(3) пілотні LOI від двох редакцій та однієї НГО. ' +
  'Цілі вище — консервативні; зростання MAU залежить від часу запуску публічної карти.';
