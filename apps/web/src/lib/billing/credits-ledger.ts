/**
 * Credits Ledger — full double-entry transaction log with CSV export.
 *
 * Every credit event (top-up, debit, transfer, refund, grant) is appended here.
 * The UI reads from this store; the CSV export is downloadable from the billing page.
 *
 * Повний журнал кредитних операцій із CSV-експортом для UI та білінгової сторінки.
 */

// ── LedgerEntry ────────────────────────────────────────────────────────────────

export interface LedgerEntry {
  id: string;
  userId: string;
  /** Positive = credit, negative = debit */
  delta: number;
  /** Running balance after this entry */
  balanceAfter: number;
  /** Human-readable description, e.g. "Top-up $50", "API overage × 12 calls" */
  description: string;
  /** Entry type for filtering / colouring in the UI */
  type: "topup" | "debit" | "transfer-in" | "transfer-out" | "grant" | "refund" | "expiry";
  /** ISO 8601 timestamp */
  createdAt: string;
  /** Optional reference: Stripe payment_intent ID, transfer ID, etc. */
  reference?: string;
}

// ── CreditLedgerStore ──────────────────────────────────────────────────────────

export class CreditLedgerStore {
  /** Map<userId, LedgerEntry[]> — ordered oldest-first for running balance */
  private readonly ledger = new Map<string, LedgerEntry[]>();
  private counter = 0;

  // ── Write ──────────────────────────────────────────────────────────────────

  /**
   * Append a new ledger entry for a user.
   * `balanceAfter` must be supplied by the caller (from walletStore.getBalance after mutation).
   *
   * Додає запис до журналу. `balanceAfter` передається з walletStore після мутації.
   */
  append(
    userId: string,
    entry: Omit<LedgerEntry, "id" | "userId" | "createdAt">,
  ): LedgerEntry {
    const record: LedgerEntry = {
      ...entry,
      id: `led-${++this.counter}-${Date.now()}`,
      userId,
      createdAt: new Date().toISOString(),
    };

    if (!this.ledger.has(userId)) {
      this.ledger.set(userId, []);
    }
    this.ledger.get(userId)!.push(record);

    return record;
  }

  // ── Read ───────────────────────────────────────────────────────────────────

  /**
   * Retrieve all ledger entries for a user, newest first.
   *
   * Повертає всі записи журналу для користувача, від нових до старих.
   */
  getEntries(userId: string): LedgerEntry[] {
    return [...(this.ledger.get(userId) ?? [])].reverse();
  }

  /**
   * Retrieve entries filtered by type and/or date range.
   *
   * Фільтрована вибірка по типу та/або проміжку дат.
   */
  getFilteredEntries(
    userId: string,
    options?: {
      type?: LedgerEntry["type"];
      from?: string; // ISO date string
      to?: string;   // ISO date string
    },
  ): LedgerEntry[] {
    let entries = this.getEntries(userId);

    if (options?.type) {
      entries = entries.filter((e) => e.type === options.type);
    }
    if (options?.from) {
      entries = entries.filter((e) => e.createdAt >= options.from!);
    }
    if (options?.to) {
      entries = entries.filter((e) => e.createdAt <= options.to!);
    }

    return entries;
  }

  // ── CSV export ─────────────────────────────────────────────────────────────

  /**
   * Export all ledger entries for a user as a UTF-8 CSV string.
   * The first row is a header. Suitable for `Content-Type: text/csv` responses.
   *
   * Повертає всі записи як CSV-рядок (UTF-8). Перший рядок — заголовок.
   */
  exportCsv(userId: string): string {
    const entries = this.getEntries(userId);

    const header = [
      "id",
      "createdAt",
      "type",
      "delta",
      "balanceAfter",
      "description",
      "reference",
    ].join(",");

    const rows = entries.map((e) =>
      [
        e.id,
        e.createdAt,
        e.type,
        e.delta,
        e.balanceAfter,
        `"${e.description.replace(/"/g, '""')}"`,
        e.reference ?? "",
      ].join(","),
    );

    return [header, ...rows].join("\n");
  }
}

// ── Singleton ──────────────────────────────────────────────────────────────────

/** Global in-memory credit ledger store. */
export const creditLedgerStore = new CreditLedgerStore();
