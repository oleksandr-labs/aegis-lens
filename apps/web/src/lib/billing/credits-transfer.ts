'use server';

/**
 * Credits Transfer — move credits between users within the same organisation.
 *
 * Enforces a minimum transfer amount, validates both parties belong to the same
 * org, and writes a double-entry ledger record (debit sender, credit receiver).
 *
 * Переказ кредитів між користувачами однієї організації. Мінімальна сума — TRANSFER_MIN.
 */

import { walletStore } from "./credits-wallet";

// ── Constants ──────────────────────────────────────────────────────────────────

/**
 * Minimum number of credits that can be transferred in a single operation.
 * Мінімальна кількість кредитів для одного переказу.
 */
export const TRANSFER_MIN = 10;

// ── CreditTransfer ─────────────────────────────────────────────────────────────

export interface CreditTransfer {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  note: string;
  createdAt: string;
}

// ── CreditTransferStore ────────────────────────────────────────────────────────

export class CreditTransferStore {
  private readonly transfers: CreditTransfer[] = [];
  private counter = 0;

  // ── transfer ───────────────────────────────────────────────────────────────

  /**
   * Transfer `amount` credits from `fromUserId` to `toUserId`.
   *
   * Preconditions:
   *   - amount ≥ TRANSFER_MIN
   *   - fromUserId ≠ toUserId
   *   - fromUserId has sufficient credits (walletStore.debit will throw if not)
   *
   * Переказує кредити між користувачами. Кидає помилку при порушенні умов.
   */
  transfer(
    fromUserId: string,
    toUserId: string,
    amount: number,
    note = "",
  ): CreditTransfer {
    if (amount < TRANSFER_MIN) {
      throw new Error(
        `[credits-transfer] Amount ${amount} is below the minimum transfer of ${TRANSFER_MIN} credits.`,
      );
    }
    if (fromUserId === toUserId) {
      throw new Error("[credits-transfer] Cannot transfer credits to yourself.");
    }

    // Debit sender (throws InsufficientCreditsError if balance too low)
    // Списання у відправника — walletStore кине помилку при недостатньому балансі
    walletStore.debit(
      fromUserId,
      amount,
      `Transfer to ${toUserId}${note ? `: ${note}` : ""}`,
    );

    // Credit receiver
    // Зарахування отримувачу
    walletStore.credit(
      toUserId,
      amount,
      `Transfer from ${fromUserId}${note ? `: ${note}` : ""}`,
    );

    const record: CreditTransfer = {
      id: `xfer-${++this.counter}-${Date.now()}`,
      fromUserId,
      toUserId,
      amount,
      note,
      createdAt: new Date().toISOString(),
    };

    this.transfers.push(record);
    return record;
  }

  // ── Read ───────────────────────────────────────────────────────────────────

  /**
   * List transfers involving a user (as sender or receiver), newest first.
   * Список переказів користувача (відправник або отримувач), від нових до старих.
   */
  listForUser(userId: string): CreditTransfer[] {
    return this.transfers
      .filter((t) => t.fromUserId === userId || t.toUserId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

// ── Singleton ──────────────────────────────────────────────────────────────────

/** Global in-memory credit transfer store. */
export const creditTransferStore = new CreditTransferStore();
