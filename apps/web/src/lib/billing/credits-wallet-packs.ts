'use server';
/**
 * Credit Pack definitions, wallet transaction types, and policy notes.
 * Companion to credits-wallet.ts (which holds WalletStore, CREDIT_UNIT_COSTS, etc.).
 *
 * Опис кредитних пакетів, типів транзакцій гаманця та правил.
 * Доповнення до credits-wallet.ts (де містяться WalletStore, CREDIT_UNIT_COSTS тощо).
 */

// ── Transaction types ─────────────────────────────────────────────────────────

export type CreditTransactionType =
  | "purchase"
  | "subscription-grant"
  | "referral-reward"
  | "refund"
  | "spend-api-call"
  | "spend-report"
  | "spend-pass"
  | "spend-addon"
  | "expiry";

// ── Credit Pack ───────────────────────────────────────────────────────────────

export interface CreditPack {
  id: string;
  name_en: string;
  name_uk: string;
  creditsAmount: number;
  priceUsd: number;
  /** Effective bonus percentage above face value (0 = no bonus) */
  bonusPercent: number;
  notes_en: string;
  notes_uk: string;
}

// ── Credit Packs catalog ──────────────────────────────────────────────────────

/**
 * Available credit top-up packs with volume bonuses.
 * $1 = 100 credits (base rate); volume packs include bonus credits.
 *
 * Доступні пакети поповнення кредитів з об'ємними бонусами.
 * $1 = 100 кредитів (базова ставка); великі пакети включають бонусні кредити.
 */
export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "credits-starter",
    name_en: "Starter Pack",
    name_uk: "Стартовий пакет",
    creditsAmount: 100,
    priceUsd: 9,
    bonusPercent: 0,
    notes_en:
      "100 credits at base rate ($0.09 per credit). " +
      "Good for light API use or a single small report. No volume bonus at this tier.",
    notes_uk:
      "100 кредитів за базовою ставкою ($0,09 за кредит). " +
      "Підходить для невеликого використання API або одного невеликого звіту. Без об'ємного бонусу на цьому рівні.",
  },
  {
    id: "credits-growth",
    name_en: "Growth Pack",
    name_uk: "Пакет зростання",
    creditsAmount: 500,
    priceUsd: 40,
    bonusPercent: 11,
    notes_en:
      "500 credits — includes 11% volume bonus (equivalent to 555 credits at base rate). " +
      "Effective rate: $0.08 per credit. Suitable for regular API calls and mid-size report purchases.",
    notes_uk:
      "500 кредитів — включає 11% об'ємний бонус (еквівалент 555 кредитів за базовою ставкою). " +
      "Ефективна ставка: $0,08 за кредит. Підходить для регулярних викликів API та покупок звітів середнього розміру.",
  },
  {
    id: "credits-pro",
    name_en: "Pro Pack",
    name_uk: "Pro-пакет",
    creditsAmount: 2000,
    priceUsd: 140,
    bonusPercent: 28,
    notes_en:
      "2,000 credits — includes 28% volume bonus (equivalent to 2,560 credits at base rate). " +
      "Effective rate: $0.07 per credit. Designed for power users: bulk exports, multi-scene satellite queries, frequent AI agent runs.",
    notes_uk:
      "2 000 кредитів — включає 28% об'ємний бонус (еквівалент 2 560 кредитів за базовою ставкою). " +
      "Ефективна ставка: $0,07 за кредит. Розроблено для активних користувачів: масовий експорт, мультисценарні супутникові запити, часті запуски AI-агентів.",
  },
  {
    id: "credits-enterprise",
    name_en: "Enterprise Pack",
    name_uk: "Enterprise-пакет",
    creditsAmount: 10000,
    priceUsd: 600,
    bonusPercent: 50,
    notes_en:
      "10,000 credits — includes 50% volume bonus (equivalent to 15,000 credits at base rate). " +
      "Effective rate: $0.06 per credit. Best value for high-volume commercial satellite tasking, bulk data pipelines, or team-level credit pools.",
    notes_uk:
      "10 000 кредитів — включає 50% об'ємний бонус (еквівалент 15 000 кредитів за базовою ставкою). " +
      "Ефективна ставка: $0,06 за кредит. Найкраще значення для великого комерційного замовлення супутникових знімків, масових конвеєрів даних або командних кредитних пулів.",
  },
];

// ── Policy notes ──────────────────────────────────────────────────────────────

/**
 * How credits are earned.
 *
 * Як заробляються кредити.
 */
export const CREDIT_EARN_RATES_EN =
  "Credits can be earned through: " +
  "(1) Direct purchase — choose a credit pack above; " +
  "(2) Subscription monthly grant — Pro subscribers receive 50 credits/month, Team 200/month, Enterprise custom; " +
  "(3) Referrals — $20 credit awarded per referred user who converts to a paid plan; " +
  "(4) Special events — hackathons, beta programs, and partner promotions may award bonus credits; " +
  "(5) Refunds — unused credits may be restored upon verified refund request.";

export const CREDIT_EARN_RATES_UK =
  "Кредити можна отримати через: " +
  "(1) Пряму покупку — виберіть пакет вище; " +
  "(2) Щомісячне нарахування за підпискою — підписники Pro отримують 50 кредитів/місяць, Team — 200/місяць, Enterprise — індивідуально; " +
  "(3) Реферали — $20 кредитів за кожного залученого користувача, який перейшов на платний план; " +
  "(4) Спеціальні події — хакатони, бета-програми та партнерські акції можуть нараховувати бонусні кредити; " +
  "(5) Повернення коштів — невикористані кредити можуть бути відновлені за верифікованим запитом на повернення.";

/**
 * How credits are spent.
 *
 * Як витрачаються кредити.
 */
export const CREDIT_SPEND_RATES_EN =
  "Credits are consumed by: " +
  "(1) API calls — 1 credit per call (standard); AI-enhanced endpoints cost 2–5 credits/call; " +
  "(2) Report purchases — 50–500 credits depending on report depth and data coverage; " +
  "(3) Day Pass via credits — 80 credits equivalent to one Day Pass; " +
  "(4) Add-on activations — satellite tasking (800 credits/scene), AI agent run (20 credits), bulk export (5 credits/1k rows); " +
  "(5) Custom report generation — 200–2,000 credits based on scope.";

export const CREDIT_SPEND_RATES_UK =
  "Кредити витрачаються на: " +
  "(1) Виклики API — 1 кредит за виклик (стандартний); AI-розширені ендпоінти коштують 2–5 кредитів/виклик; " +
  "(2) Покупки звітів — 50–500 кредитів залежно від глибини та охоплення даних; " +
  "(3) Денний пас через кредити — 80 кредитів еквівалентно одному денному пасу; " +
  "(4) Активація додатків — замовлення супутникового знімка (800 кредитів/сцена), запуск AI-агента (20 кредитів), масовий експорт (5 кредитів/1к рядків); " +
  "(5) Генерація кастомних звітів — 200–2 000 кредитів залежно від обсягу.";

/**
 * Credit expiry policy.
 *
 * Політика завершення терміну дії кредитів.
 */
export const CREDIT_EXPIRY_NOTE_EN =
  "Credits expire after 24 months of account inactivity (no login, no API calls, no purchases). " +
  "A 90-day warning email is sent before any credit expiry event. " +
  "Subscription-granted credits expire at the end of the billing cycle if unused. " +
  "Purchased credits have the 24-month inactivity rule and do not expire on active accounts.";

export const CREDIT_EXPIRY_NOTE_UK =
  "Кредити закінчуються після 24 місяців неактивності облікового запису (без входу, викликів API або покупок). " +
  "За 90 днів до будь-якого закінчення терміну кредитів надсилається попереджувальний лист. " +
  "Кредити, нараховані за підпискою, закінчуються в кінці розрахункового циклу, якщо не використані. " +
  "Придбані кредити підпадають під правило 24 місяців неактивності та не закінчуються на активних облікових записах.";

/**
 * Credit refund and non-refundability policy.
 *
 * Політика повернення коштів за кредити.
 */
export const CREDIT_NON_REFUNDABLE_NOTE_EN =
  "Credits that have been spent on services (API calls, reports, passes, add-ons) are non-refundable. " +
  "Purchased credits that have NOT been spent are refundable within 30 days of purchase, subject to a $2 processing fee. " +
  "Subscription-granted credits are non-refundable under all circumstances. " +
  "Bonus credits awarded via referrals or promotions are non-refundable.";

export const CREDIT_NON_REFUNDABLE_NOTE_UK =
  "Кредити, витрачені на послуги (виклики API, звіти, паси, додатки), не підлягають поверненню. " +
  "Придбані кредити, які НЕ були витрачені, підлягають поверненню протягом 30 днів з моменту покупки з комісією за обробку $2. " +
  "Кредити, нараховані за підпискою, не підлягають поверненню за жодних обставин. " +
  "Бонусні кредити, нараховані через реферали або акції, не підлягають поверненню.";

// ── WalletTransaction ─────────────────────────────────────────────────────────

/**
 * A single ledger entry in a user's credit wallet.
 * Positive creditsAmount = credit added; negative = credit spent.
 *
 * Один запис у кредитному гаманці користувача.
 * Позитивне значення = кредити нараховано; негативне = кредити витрачено.
 */
export interface WalletTransaction {
  id: string;
  type: CreditTransactionType;
  /** Positive for credits in, negative for credits out */
  creditsAmount: number;
  /** ID of the related invoice, pass, report, or API call; null if not applicable */
  referenceId: string | null;
  /** Unix timestamp (seconds) */
  createdAt: number;
}

// ── WalletStore ───────────────────────────────────────────────────────────────

/**
 * In-memory wallet store keyed by userId.
 * Stores WalletTransaction history and computes balances on demand.
 *
 * Сховище гаманців у пам'яті, індексоване за userId.
 * Зберігає історію транзакцій і розраховує баланси на вимогу.
 */
export class WalletStore {
  private readonly ledger = new Map<string, WalletTransaction[]>();

  /** Add a transaction for a user. */
  addTransaction(userId: string, tx: WalletTransaction): void {
    const existing = this.ledger.get(userId) ?? [];
    existing.push(tx);
    this.ledger.set(userId, existing);
  }

  /** Compute the current credit balance for a user. */
  getBalance(userId: string): number {
    return computeWalletBalance(this.ledger.get(userId) ?? []);
  }

  /** Return all transactions for a user (oldest first). */
  getHistory(userId: string): WalletTransaction[] {
    return [...(this.ledger.get(userId) ?? [])];
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global in-memory wallet store singleton. */
export const walletStore = new WalletStore();

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Compute the current wallet balance from a list of transactions.
 * Sums all creditsAmount values; result may be negative only if a bug allows it
 * (the store should guard against negative balances via assertSufficientCredits).
 *
 * Розраховує поточний баланс гаманця за списком транзакцій.
 */
export function computeWalletBalance(transactions: WalletTransaction[]): number {
  return transactions.reduce((sum, tx) => sum + tx.creditsAmount, 0);
}

/**
 * Look up a credit pack by id.
 *
 * Повертає кредитний пакет за ідентифікатором.
 */
export function getCreditPack(id: string): CreditPack | undefined {
  return CREDIT_PACKS.find((p) => p.id === id);
}
