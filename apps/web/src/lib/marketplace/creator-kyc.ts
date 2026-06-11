'use server';

/**
 * Marketplace — Creator KYC (Know Your Customer) store.
 *
 * Creators must complete KYC via Stripe Connect Express before their first
 * payout. This module provides an in-memory store for KYC records; replace
 * with a database-backed implementation in production.
 *
 * Автори повинні пройти KYC через Stripe Connect Express перед першою виплатою.
 * In-memory сховище KYC-записів (замінити на БД у продакшені).
 */

import type { CreatorKyc } from "./types";

// ── Stripe Connect policy note ────────────────────────────────────────────────

/**
 * Stripe Connect Express onboarding policy note — English.
 */
export const STRIPE_CONNECT_EXPRESS_NOTE_EN =
  "Creator payouts use Stripe Connect Express. KYC verification required before first payout.";

/**
 * Stripe Connect Express onboarding policy note — Ukrainian.
 * Виплати авторам здійснюються через Stripe Connect Express.
 */
export const STRIPE_CONNECT_EXPRESS_NOTE_UK =
  "Виплати авторам здійснюються через Stripe Connect Express. Необхідна KYC-верифікація перед першою виплатою.";

// ── KYC store ─────────────────────────────────────────────────────────────────

/**
 * In-memory KYC store for marketplace creators.
 * Key: creatorId (matches MarketplaceItem.creatorId).
 *
 * In-memory KYC-сховище для авторів маркетплейсу.
 */
export class KycStore {
  private readonly _records: Map<string, CreatorKyc> = new Map();

  /**
   * Register or update a creator's KYC record.
   *
   * @param kycData - KYC record to persist.
   * Зареєструвати або оновити KYC-запис автора.
   */
  registerCreator(kycData: CreatorKyc): void {
    this._records.set(kycData.creatorId, kycData);
  }

  /**
   * Check whether a creator has completed KYC verification.
   *
   * @param creatorId - Creator user ID.
   * @returns true if the creator is KYC-verified; false otherwise.
   * Перевірити, чи пройшов автор KYC-верифікацію.
   */
  isVerified(creatorId: string): boolean {
    const record = this._records.get(creatorId);
    return record?.kycVerified === true;
  }

  /**
   * Retrieve the KYC record for a creator.
   *
   * @param creatorId - Creator user ID.
   * @returns The KYC record, or undefined if the creator is not registered.
   * Отримати KYC-запис автора.
   */
  getCreator(creatorId: string): CreatorKyc | undefined {
    return this._records.get(creatorId);
  }
}

/** Module-level singleton — shared across the server process lifetime. */
export const kycStore = new KycStore();
