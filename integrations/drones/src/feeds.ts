/**
 * Data-feed source configuration + verification gate for the drone layer.
 *
 * Drone intelligence arrives from heterogeneous feeds — Telegram channels,
 * ADS-B anomaly detectors, and civilian sighting reports. Each has a different
 * trust profile, so every feed declares a `verificationGate` that determines the
 * minimum corroboration an incoming report needs before it may be published.
 * This module defines the typed feed config and the gate evaluator.
 */

export type FeedKind = "telegram" | "adsb_anomaly" | "civilian_sighting";

/** Trust tier of a feed source — drives the default verification gate. */
export type FeedTrust = "vetted" | "community" | "unvetted";

export interface VerificationGate {
  /** Minimum independent sources before publish. */
  minIndependentSources: number;
  /** Whether an analyst must sign off before public publish. */
  requiresAnalystReview: boolean;
  /** Minimum classifier/report confidence (0–1) to publish. */
  minConfidence: number;
}

export interface FeedSourceConfig {
  id: string;
  kind: FeedKind;
  trust: FeedTrust;
  /** Display name. */
  nameEn: string;
  nameUk: string;
  /** Handle / endpoint (channel @, API base, form id). */
  handle: string;
  enabled: boolean;
  verificationGate: VerificationGate;
}

/** Default gates by trust tier. */
export const DEFAULT_GATES: Record<FeedTrust, VerificationGate> = {
  vetted: { minIndependentSources: 1, requiresAnalystReview: false, minConfidence: 0.6 },
  community: { minIndependentSources: 2, requiresAnalystReview: true, minConfidence: 0.65 },
  unvetted: { minIndependentSources: 3, requiresAnalystReview: true, minConfidence: 0.75 },
};

/** Seed feed registry (extend as channels are onboarded). */
export const DRONE_FEED_SOURCES: FeedSourceConfig[] = [
  {
    id: "tg_kpszsu",
    kind: "telegram",
    trust: "vetted",
    nameEn: "Ukrainian Air Force (official)",
    nameUk: "Повітряні Сили ЗСУ (офіційно)",
    handle: "@kpszsu",
    enabled: true,
    verificationGate: DEFAULT_GATES.vetted,
  },
  {
    id: "adsb_anomaly_eu",
    kind: "adsb_anomaly",
    trust: "community",
    nameEn: "ADS-B anomaly detector (EU airspace)",
    nameUk: "Детектор аномалій ADS-B (повітряний простір ЄС)",
    handle: "adsb://anomaly/eu",
    enabled: true,
    verificationGate: DEFAULT_GATES.community,
  },
  {
    id: "civilian_form",
    kind: "civilian_sighting",
    trust: "unvetted",
    nameEn: "Civilian sighting reports",
    nameUk: "Повідомлення цивільних очевидців",
    handle: "form://sightings",
    enabled: true,
    verificationGate: DEFAULT_GATES.unvetted,
  },
];

/** A report as it enters the gate. */
export interface IncomingReport {
  feedId: string;
  confidence: number;
  independentSourceCount: number;
  analystApproved?: boolean;
}

export interface GateDecision {
  pass: boolean;
  reasonEn: string;
  reasonUk: string;
}

/** Evaluate whether an incoming report clears its feed's verification gate. */
export function passesVerificationGate(
  report: IncomingReport,
  feeds: FeedSourceConfig[] = DRONE_FEED_SOURCES,
): GateDecision {
  const feed = feeds.find((f) => f.id === report.feedId);
  if (!feed) {
    return { pass: false, reasonEn: "Unknown feed source.", reasonUk: "Невідоме джерело даних." };
  }
  if (!feed.enabled) {
    return { pass: false, reasonEn: "Feed source disabled.", reasonUk: "Джерело даних вимкнено." };
  }
  const g = feed.verificationGate;
  if (report.independentSourceCount < g.minIndependentSources) {
    return {
      pass: false,
      reasonEn: `Needs ${g.minIndependentSources} independent sources (have ${report.independentSourceCount}).`,
      reasonUk: `Потрібно ${g.minIndependentSources} незалежних джерел (є ${report.independentSourceCount}).`,
    };
  }
  if (report.confidence < g.minConfidence) {
    return {
      pass: false,
      reasonEn: `Confidence ${report.confidence} below gate ${g.minConfidence}.`,
      reasonUk: `Впевненість ${report.confidence} нижча за поріг ${g.minConfidence}.`,
    };
  }
  if (g.requiresAnalystReview && !report.analystApproved) {
    return {
      pass: false,
      reasonEn: "Awaiting analyst review.",
      reasonUk: "Очікує перевірки аналітиком.",
    };
  }
  return { pass: true, reasonEn: "Passed verification gate.", reasonUk: "Пройдено перевірку." };
}
