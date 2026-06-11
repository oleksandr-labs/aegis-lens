/**
 * Ambassador & referral program — tiers, rewards, and referral code store.
 *
 * Програма амбасадорів та рефералів — рівні, винагороди та сховище кодів.
 *
 * Source: TODO/monetization/TODO_ambassador_referral.md
 */

import { createHash, randomBytes } from "crypto";

// ── Types ─────────────────────────────────────────────────────────────────────

export type AmbassadorTier = "advocate" | "ambassador" | "founder-ambassador";

export interface ReferralReward {
  referrerId: string;
  referredUserId: string;
  rewardType: "credit" | "subscription-month" | "cash" | "discount";
  rewardValue: number;
  status: "pending" | "paid";
  createdAt: string;
}

// ── Ambassador Tier Config ────────────────────────────────────────────────────

/**
 * Ambassador tier definitions.
 *
 * Визначення рівнів амбасадорів.
 *
 * advocate:          Informal advocate; no formal programme membership required
 * ambassador:        Verified top contributor; formal programme member
 * founder-ambassador: Founding-cohort ambassador with maximum perks
 */
export const AMBASSADOR_TIERS: Record<
  AmbassadorTier,
  {
    labelEN: string;
    labelUK: string;
    referralsRequired: number;
    rewardPerReferral: number;
    rewardType: string;
    extraPerks_en: string[];
  }
> = {
  advocate: {
    labelEN: "Advocate",
    labelUK: "Адвокат",
    referralsRequired: 1,
    rewardPerReferral: 1,
    rewardType: "subscription-month",
    extraPerks_en: [
      "Referred user gets 30% off their first 3 months",
      "1 free subscription month for each paying referral",
      "Advocate badge on public profile (opt-in)",
    ],
  },
  ambassador: {
    labelEN: "Ambassador",
    labelUK: "Амбасадор",
    referralsRequired: 5,
    rewardPerReferral: 1,
    rewardType: "subscription-month",
    extraPerks_en: [
      "All Advocate perks",
      "Complimentary Pro+ subscription while Ambassador status is active",
      "Aegis Lens swag kit (shipped once per year)",
      "Early access to unreleased features (2 weeks before GA)",
      "Speaking slot invitation at community events",
      "20% affiliate revenue share for 12 months per referred subscriber",
      "Dedicated ambassador Slack channel access",
    ],
  },
  "founder-ambassador": {
    labelEN: "Founding Ambassador",
    labelUK: "Фундаторський Амбасадор",
    referralsRequired: 15,
    rewardPerReferral: 1,
    rewardType: "subscription-month",
    extraPerks_en: [
      "All Ambassador perks",
      "Listed as Founding Ambassador in all major platform communications",
      "Annual private call with the founding team",
      "Non-binding advisory input into the product roadmap",
      "Perpetual Pro+ access (for the lifetime of the programme)",
      "Named on the Trust Center founding contributors page",
    ],
  },
};

// ── Referral Code Store ───────────────────────────────────────────────────────

interface ReferralCodeEntry {
  userId: string;
  code: string;
  createdAt: string;
  /** Tracks every (code, newUserId) pair to prevent self-referral and clawback */
  tracked: { newUserId: string; reward: ReferralReward }[];
}

/**
 * In-memory referral code store.
 * Production systems should persist to a database.
 *
 * Сховище реферальних кодів у памʼяті.
 * Виробничі системи мають зберігати в базі даних.
 */
export class ReferralCodeStore {
  /** Map of userId → ReferralCodeEntry */
  private readonly byUser = new Map<string, ReferralCodeEntry>();
  /** Map of code → userId (for O(1) validation) */
  private readonly byCode = new Map<string, string>();

  // ── Write ──────────────────────────────────────────────────────────────────

  /**
   * Generate a unique referral code for a user.
   * If the user already has a code, returns the existing one.
   *
   * Генерує унікальний реферальний код для користувача.
   */
  generate(userId: string): string {
    const existing = this.byUser.get(userId);
    if (existing) return existing.code;

    // Generate a short, URL-safe code: first 8 chars of HMAC-SHA256
    const raw = randomBytes(16).toString("hex");
    const code = createHash("sha256")
      .update(`${userId}:${raw}`)
      .digest("hex")
      .slice(0, 8)
      .toUpperCase();

    const entry: ReferralCodeEntry = {
      userId,
      code,
      createdAt: new Date().toISOString(),
      tracked: [],
    };

    this.byUser.set(userId, entry);
    this.byCode.set(code, userId);
    return code;
  }

  /**
   * Validate a referral code.
   * Returns valid=false for unknown codes.
   *
   * Перевіряє реферальний код.
   */
  validate(code: string): { valid: boolean; referrerId?: string } {
    const referrerId = this.byCode.get(code.toUpperCase());
    if (!referrerId) return { valid: false };
    return { valid: true, referrerId };
  }

  /**
   * Track a referral: link newUserId to the code's referrer and create a pending reward.
   * Throws if self-referral is detected.
   *
   * Відстежує реферал: повʼязує нового користувача з реферером.
   * Блокує само-реферали.
   */
  track(code: string, newUserId: string): ReferralReward {
    const { valid, referrerId } = this.validate(code);
    if (!valid || !referrerId) {
      throw new Error(`[referral] Invalid referral code: ${code}`);
    }

    // Anti-abuse: block self-referral
    if (referrerId === newUserId) {
      throw new Error(
        `[referral] Self-referral blocked: userId ${newUserId} cannot use their own code.`,
      );
    }

    const entry = this.byUser.get(referrerId);
    if (!entry) {
      throw new Error(`[referral] No entry found for referrer ${referrerId}`);
    }

    // Check for duplicate tracking (same newUserId already tracked for this referrer)
    const alreadyTracked = entry.tracked.some(
      (t) => t.newUserId === newUserId,
    );
    if (alreadyTracked) {
      throw new Error(
        `[referral] User ${newUserId} has already been tracked for referrer ${referrerId}.`,
      );
    }

    const reward: ReferralReward = {
      referrerId,
      referredUserId: newUserId,
      rewardType: "subscription-month",
      rewardValue: 1,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    entry.tracked.push({ newUserId, reward });
    return reward;
  }

  // ── Read ───────────────────────────────────────────────────────────────────

  /**
   * Get all referral rewards for a referrer (for display in dashboard).
   *
   * Отримати всі реферальні винагороди для реферера.
   */
  getRewardsForUser(userId: string): ReferralReward[] {
    return (
      this.byUser.get(userId)?.tracked.map((t) => t.reward) ?? []
    );
  }

  /**
   * Mark a reward as paid (called from billing webhook after subscription confirms).
   * Also handles clawback: if referee refunded, caller should invoke with status='pending'
   * reversal logic.
   *
   * Позначити винагороду як виплачену.
   */
  markPaid(referrerId: string, referredUserId: string): void {
    const entry = this.byUser.get(referrerId);
    if (!entry) return;
    const tracked = entry.tracked.find((t) => t.newUserId === referredUserId);
    if (tracked) {
      tracked.reward.status = "paid";
    }
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global in-memory referral code store. */
export const referralCodeStore = new ReferralCodeStore();
