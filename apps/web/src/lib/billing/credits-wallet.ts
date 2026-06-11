/**
 * Credits Wallet system.
 *
 * $1 = 100 credits (internal unit). Credits are used for spiky/high-value
 * workloads: satellite tasking, AI runs, bulk exports.
 * Credits never expire (or 24-month minimum for legal clarity).
 *
 * $1 = 100 кредитів. Кредити — для нерегулярних великих навантажень.
 * Кредити не мають терміну дії (або мінімум 24 місяці).
 */

// ── Credit unit costs ─────────────────────────────────────────────────────────

/**
 * Credit cost per billable unit.
 * Prices in credits (100 credits = $1).
 *
 * Вартість у кредитах за одиницю тарифного виміру.
 */
export const CREDIT_UNIT_COSTS: Record<string, number> = {
  "api-call": 1,
  "ai-token-1k": 2,
  "export-1k-rows": 5,
  "satellite-scene": 50,
  "sat-tasking": 200,
  "custom-report": 500,
  "ai-agent-run": 20,
};

/** Exchange rate: USD cents per credit (100 credits = $1.00) */
export const CREDITS_PER_USD = 100;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CreditBalance {
  userId: string;
  credits: number;
  /** Credits reserved for in-flight operations; not yet deducted */
  pendingCredits: number;
  /** ISO 8601 */
  lastUpdated: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  /** Positive = credit added; negative = credit used */
  amount: number;
  type: "purchase" | "usage" | "refund" | "bonus" | "expiry";
  description_en: string;
  description_uk: string;
  /** ISO 8601 */
  createdAt: string;
  /** ISO 8601 — null for non-expiring credits */
  expiresAt?: string;
}

// ── InsufficientCreditsError ──────────────────────────────────────────────────

/**
 * Thrown when a debit operation would push the balance below zero.
 * Catches are expected to translate this into a 402 response.
 *
 * Виникає коли баланс кредитів недостатній для операції.
 */
export class InsufficientCreditsError extends Error {
  readonly userId: string;
  readonly required: number;
  readonly available: number;

  constructor(userId: string, required: number, available: number) {
    super(
      `Insufficient credits for user "${userId}": required ${required}, available ${available}. ` +
        `Top up at https://aegislens.uk/billing/credits`,
    );
    this.name = "InsufficientCreditsError";
    this.userId = userId;
    this.required = required;
    this.available = available;
  }
}

// ── WalletStore ───────────────────────────────────────────────────────────────

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export class WalletStore {
  private readonly balances = new Map<string, CreditBalance>();
  private readonly transactions = new Map<string, CreditTransaction[]>();

  // ── Helpers ────────────────────────────────────────────────────────────────

  private ensureBalance(userId: string): CreditBalance {
    if (!this.balances.has(userId)) {
      this.balances.set(userId, {
        userId,
        credits: 0,
        pendingCredits: 0,
        lastUpdated: new Date().toISOString(),
      });
    }
    return this.balances.get(userId)!;
  }

  private appendTransaction(tx: CreditTransaction): void {
    const list = this.transactions.get(tx.userId) ?? [];
    list.push(tx);
    this.transactions.set(tx.userId, list);
  }

  // ── Read ───────────────────────────────────────────────────────────────────

  /** Get current credit balance for a user (auto-initialises to zero). */
  getBalance(userId: string): CreditBalance {
    return { ...this.ensureBalance(userId) };
  }

  // ── Debit ──────────────────────────────────────────────────────────────────

  /**
   * Deduct `amount` credits from a user's balance.
   * Throws `InsufficientCreditsError` if balance is too low.
   *
   * Знімає кредити. Кидає помилку якщо балансу недостатньо.
   */
  debit(userId: string, amount: number, reason: string): CreditTransaction {
    if (amount <= 0) {
      throw new RangeError(`[credits-wallet] Debit amount must be positive, got ${amount}`);
    }

    const balance = this.ensureBalance(userId);
    if (balance.credits < amount) {
      throw new InsufficientCreditsError(userId, amount, balance.credits);
    }

    balance.credits -= amount;
    balance.lastUpdated = new Date().toISOString();
    this.balances.set(userId, balance);

    const tx: CreditTransaction = {
      id: generateId("ctx"),
      userId,
      amount: -amount,
      type: "usage",
      description_en: reason,
      description_uk: reason,
      createdAt: new Date().toISOString(),
    };
    this.appendTransaction(tx);
    return { ...tx };
  }

  // ── Credit ─────────────────────────────────────────────────────────────────

  /**
   * Add `amount` credits to a user's balance.
   *
   * Поповнює баланс кредитів.
   */
  credit(
    userId: string,
    amount: number,
    type: CreditTransaction["type"],
    descriptionEn?: string,
    descriptionUk?: string,
    expiresAt?: string,
  ): CreditTransaction {
    if (amount <= 0) {
      throw new RangeError(`[credits-wallet] Credit amount must be positive, got ${amount}`);
    }

    const balance = this.ensureBalance(userId);
    balance.credits += amount;
    balance.lastUpdated = new Date().toISOString();
    this.balances.set(userId, balance);

    const defaultDesc = `+${amount} credits (${type})`;
    const tx: CreditTransaction = {
      id: generateId("ctx"),
      userId,
      amount,
      type,
      description_en: descriptionEn ?? defaultDesc,
      description_uk: descriptionUk ?? defaultDesc,
      createdAt: new Date().toISOString(),
      expiresAt,
    };
    this.appendTransaction(tx);
    return { ...tx };
  }

  // ── History ────────────────────────────────────────────────────────────────

  /**
   * Returns the most recent transactions for a user (newest first).
   *
   * Повертає транзакції (від нових до старих).
   */
  listTransactions(userId: string, limit = 50): CreditTransaction[] {
    const list = this.transactions.get(userId) ?? [];
    return [...list].reverse().slice(0, limit);
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global in-memory wallet store. */
export const walletStore = new WalletStore();

// ── Guard ─────────────────────────────────────────────────────────────────────

/**
 * Assert that a user has sufficient credits for an operation.
 * Throws `InsufficientCreditsError` if the balance is too low.
 *
 * Use before performing any billable operation to prevent negative balances.
 *
 * Перевіряє достатність балансу перед операцією.
 */
export function assertSufficientCredits(
  userId: string,
  required: number,
): void {
  const { credits } = walletStore.getBalance(userId);
  if (credits < required) {
    throw new InsufficientCreditsError(userId, required, credits);
  }
}
