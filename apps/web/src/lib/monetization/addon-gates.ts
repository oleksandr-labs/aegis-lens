"use server";

/**
 * Add-on Gates — server-only attachment store and access guard.
 *
 * Tracks which add-ons each user has attached to their subscription.
 * In production this will be backed by a database; the in-memory store
 * here is a dev-time stand-in that matches the same interface.
 *
 * Шлюзи надбудов — серверне сховище та перевірка доступу.
 * В продакшені буде підкріплено БД; тут — in-memory заглушка.
 */

import type { AddOnId } from "./types";

// ── Attachment record ─────────────────────────────────────────────────────────

/**
 * A record of a single add-on attached to a user's subscription.
 * Mirrors a Stripe SubscriptionItem + local metadata.
 *
 * Запис про підключення надбудови до підписки користувача.
 */
export interface AddOnAttachment {
  userId: string;
  addOnId: AddOnId;
  /** ISO 8601 — when the add-on was attached */
  attachedAt: string;
  /** ISO 8601 — scheduled cancellation date (if any) */
  cancelAt?: string;
  /** Stripe SubscriptionItem ID — undefined until provisioned */
  stripeSubscriptionItemId?: string;
  /** Remaining credits for credit-based add-ons */
  activeCredits?: number;
}

// ── Access error ──────────────────────────────────────────────────────────────

/**
 * Thrown by assertAddOnAccess when the user lacks the required add-on.
 * Includes localised error messages and an upgrade URL.
 *
 * Кидається коли у користувача немає потрібної надбудови.
 */
export class AddOnAccessError extends Error {
  readonly addOnId: AddOnId;
  readonly upgradeUrl: string;
  readonly en: string;
  readonly uk: string;

  constructor(addOnId: AddOnId) {
    const en = `Add-on "${addOnId}" is not attached to your subscription. Upgrade to access this feature.`;
    const uk = `Надбудова "${addOnId}" не підключена до вашої підписки. Оновіть план, щоб отримати доступ.`;
    super(en);
    this.name = "AddOnAccessError";
    this.addOnId = addOnId;
    this.upgradeUrl = `/pricing/addons?highlight=${addOnId}`;
    this.en = en;
    this.uk = uk;
  }
}

// ── In-memory store ───────────────────────────────────────────────────────────

/**
 * In-memory add-on attachment store.
 * Replace with a DB-backed implementation for production.
 *
 * In-memory сховище — замінити на БД для продакшену.
 */
export class AddOnGateStore {
  private attachments: Map<string, AddOnAttachment[]> = new Map();

  /**
   * Attach an add-on to a user's subscription.
   * If already attached, returns the existing attachment unchanged.
   *
   * Підключити надбудову до підписки користувача.
   */
  attach(userId: string, addOnId: AddOnId): AddOnAttachment {
    const existing = this.attachments.get(userId) ?? [];
    const found = existing.find((a) => a.addOnId === addOnId);
    if (found) return found;

    const attachment: AddOnAttachment = {
      userId,
      addOnId,
      attachedAt: new Date().toISOString(),
    };

    this.attachments.set(userId, [...existing, attachment]);
    return attachment;
  }

  /**
   * Detach an add-on from a user's subscription.
   * No-op if the add-on was not attached.
   *
   * Відключити надбудову від підписки.
   */
  detach(userId: string, addOnId: AddOnId): void {
    const existing = this.attachments.get(userId) ?? [];
    this.attachments.set(
      userId,
      existing.filter((a) => a.addOnId !== addOnId)
    );
  }

  /**
   * Returns true if the user has the given add-on attached.
   *
   * Повертає true якщо у користувача підключена вказана надбудова.
   */
  hasAddOn(userId: string, addOnId: AddOnId): boolean {
    const existing = this.attachments.get(userId) ?? [];
    const now = new Date().toISOString();
    return existing.some(
      (a) =>
        a.addOnId === addOnId &&
        (!a.cancelAt || a.cancelAt > now)
    );
  }

  /**
   * Returns all active add-on attachments for a user.
   *
   * Повертає всі активні надбудови для користувача.
   */
  listAttached(userId: string): AddOnAttachment[] {
    const existing = this.attachments.get(userId) ?? [];
    const now = new Date().toISOString();
    return existing.filter(
      (a) => !a.cancelAt || a.cancelAt > now
    );
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/**
 * Shared server-side add-on gate store singleton.
 * Bind to a real DB store in production.
 *
 * Серверний синглтон сховища надбудов.
 */
export const addonGateStore = new AddOnGateStore();

// ── Access assertion ──────────────────────────────────────────────────────────

/**
 * Throws AddOnAccessError if the user does not have the specified add-on attached.
 * Call at the top of any server action or API route that requires an add-on.
 *
 * Кидає AddOnAccessError якщо у користувача немає надбудови.
 * Викликати на початку серверного action або API route, що потребує надбудови.
 */
export function assertAddOnAccess(userId: string, addOnId: AddOnId): void {
  if (!addonGateStore.hasAddOn(userId, addOnId)) {
    throw new AddOnAccessError(addOnId);
  }
}
