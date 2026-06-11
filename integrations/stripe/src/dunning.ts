/**
 * Dunning — failed-payment recovery sequence (email + in-app prompts).
 *
 * Task: "Dunning email + in-app prompts".
 *
 * On invoice.payment_failed (see the webhook route) we enter a dunning sequence:
 * a schedule of retry/notify steps over a grace window before the subscription
 * is downgraded. This models the sequence, the per-step messaging (bilingual),
 * and the in-app banner state. Stripe Smart Retries handle the actual charge
 * retries; we drive the comms + grace-period gating around them.
 *
 * https://stripe.com/docs/billing/revenue-recovery
 */

import type { I18nString } from "./types";

export type DunningChannel = "email" | "in_app";

export interface DunningStep {
  /** Days since the first failed payment. */
  dayOffset: number;
  channels: DunningChannel[];
  subject: I18nString;
  body: I18nString;
  /** Severity for in-app banner styling. */
  severity: "info" | "warning" | "critical";
}

/** Default dunning sequence: 4 touches over a 14-day grace window. */
export const DUNNING_SEQUENCE: DunningStep[] = [
  {
    dayOffset: 0,
    channels: ["email", "in_app"],
    severity: "info",
    subject: { en: "Payment failed — action needed", uk: "Платіж не пройшов — потрібна дія" },
    body: {
      en: "We couldn't process your latest payment. Please update your payment method to avoid interruption.",
      uk: "Не вдалося обробити ваш останній платіж. Оновіть спосіб оплати, щоб уникнути перерви в обслуговуванні.",
    },
  },
  {
    dayOffset: 3,
    channels: ["email", "in_app"],
    severity: "warning",
    subject: { en: "Reminder: update your payment method", uk: "Нагадування: оновіть спосіб оплати" },
    body: {
      en: "Your payment is still failing. We'll retry automatically, but please update your card soon.",
      uk: "Ваш платіж досі не проходить. Ми повторимо спробу автоматично, але радимо оновити картку найближчим часом.",
    },
  },
  {
    dayOffset: 7,
    channels: ["email", "in_app"],
    severity: "warning",
    subject: { en: "Your subscription is at risk", uk: "Вашу підписку може бути призупинено" },
    body: {
      en: "We still can't charge your card. Update your billing details now to keep Pro features.",
      uk: "Ми досі не можемо списати кошти з вашої картки. Оновіть платіжні дані зараз, щоб зберегти функції Pro.",
    },
  },
  {
    dayOffset: 14,
    channels: ["email", "in_app"],
    severity: "critical",
    subject: { en: "Final notice — subscription will be downgraded", uk: "Останнє попередження — підписку буде понижено" },
    body: {
      en: "This is the final notice. Without a valid payment, your account will be downgraded to the free tier today.",
      uk: "Це останнє попередження. Без дійсного платежу ваш обліковий запис сьогодні буде понижено до безкоштовного рівня.",
    },
  },
];

/** Grace window in days before downgrade (last step's dayOffset). */
export const DUNNING_GRACE_DAYS = DUNNING_SEQUENCE[DUNNING_SEQUENCE.length - 1].dayOffset;

export interface DunningState {
  orgId: string;
  customerId: string;
  invoiceId: string;
  /** ISO date of the first failure that opened this dunning case. */
  firstFailedAt: string;
  /** dayOffsets already sent. */
  sentSteps: number[];
  resolved: boolean;
}

/** Days elapsed since the first failure (UTC, calendar days). */
export function daysSince(firstFailedAt: string, now: Date = new Date()): number {
  const start = new Date(firstFailedAt).getTime();
  return Math.floor((now.getTime() - start) / 86_400_000);
}

/** Which dunning step (if any) is due right now and not yet sent. */
export function nextDueStep(state: DunningState, now: Date = new Date()): DunningStep | null {
  if (state.resolved) return null;
  const elapsed = daysSince(state.firstFailedAt, now);
  for (const step of DUNNING_SEQUENCE) {
    if (elapsed >= step.dayOffset && !state.sentSteps.includes(step.dayOffset)) {
      return step;
    }
  }
  return null;
}

/** True if the grace window has elapsed unresolved → downgrade is due. */
export function shouldDowngrade(state: DunningState, now: Date = new Date()): boolean {
  return !state.resolved && daysSince(state.firstFailedAt, now) >= DUNNING_GRACE_DAYS;
}

/** In-app banner derived from current dunning state (null = no banner). */
export interface DunningBanner {
  severity: DunningStep["severity"];
  message: I18nString;
  ctaUrl: string; // typically the customer portal session URL
}

export function dunningBanner(state: DunningState, portalUrl: string, now: Date = new Date()): DunningBanner | null {
  if (state.resolved) return null;
  const elapsed = daysSince(state.firstFailedAt, now);
  // Show the most-advanced step reached.
  let active: DunningStep | null = null;
  for (const step of DUNNING_SEQUENCE) {
    if (elapsed >= step.dayOffset) active = step;
  }
  if (!active) return null;
  return { severity: active.severity, message: active.body, ctaUrl: portalUrl };
}

/** Mark a step as sent; returns updated state (immutably). */
export function markStepSent(state: DunningState, dayOffset: number): DunningState {
  if (state.sentSteps.includes(dayOffset)) return state;
  return { ...state, sentSteps: [...state.sentSteps, dayOffset] };
}

/** Resolve a dunning case (payment succeeded). */
export function resolveDunning(state: DunningState): DunningState {
  return { ...state, resolved: true };
}
