/**
 * Task 4 — Cost monitoring + processing-unit (PU) budget.
 *
 * Sentinel Hub bills in Processing Units. A single Process API request's PU cost
 * is a function of output pixels, number of input bands/samples, and data type
 * (see Sentinel Hub "Processing Units" docs). This module:
 *   1. estimates the PU cost of a request BEFORE it is sent (so callers can gate),
 *   2. accumulates spend against the selected tier's monthly allowance, and
 *   3. raises typed budget alerts at configurable thresholds.
 *
 * The exact PU formula is provider-defined and versioned — the constants below
 * are the documented baseline; confirm against COMPLIANCE.md "Verify before
 * purchase" and adjust if Sentinel Hub revises the model.
 */

import type { I18nText } from "./types";
import type { SubscriptionTier } from "./account-config";
import { TIER_CONFIGS } from "./account-config";

/** Inputs to a PU estimate for one Process API request. */
export interface PuEstimateInput {
  width?: number;
  height?: number;
  /** Number of input samples requested in the evalscript (bands sampled). */
  inputSamples?: number;
  /** Output sample type — 16/32-bit cost more than 8-bit. */
  sampleType?: "UINT8" | "UINT16" | "FLOAT32";
  /** Orthorectification / multi-temporal mosaicking multiply cost. */
  multiplier?: number;
}

/**
 * Documented Sentinel Hub baseline: 1 PU == a 512×512 px, 3-sample, 8-bit
 * request. Cost scales linearly with the pixel count and the sample count, and
 * by a data-type weight. (See SH "Processing Units".)
 */
const BASE_PIXELS = 512 * 512;
const BASE_SAMPLES = 3;

const SAMPLE_TYPE_WEIGHT: Record<NonNullable<PuEstimateInput["sampleType"]>, number> = {
  UINT8: 1,
  UINT16: 2,
  FLOAT32: 4,
};

/** Minimum billed PU per request (SH never bills below this). */
export const MIN_PU_PER_REQUEST = 0.005;

/** Estimate the PU cost of a single Process API request. */
export function estimatePu(input: PuEstimateInput): number {
  const px = (input.width ?? 512) * (input.height ?? 512);
  const samples = Math.max(input.inputSamples ?? 3, 1);
  const typeWeight = SAMPLE_TYPE_WEIGHT[input.sampleType ?? "UINT8"];
  const mult = input.multiplier ?? 1;

  const pu =
    (px / BASE_PIXELS) * (samples / BASE_SAMPLES) * typeWeight * mult;
  return Math.max(Math.round(pu * 1000) / 1000, MIN_PU_PER_REQUEST);
}

/** A single metered request (one row in the PU ledger). */
export interface PuLedgerEntry {
  at: string;
  pu: number;
  collection?: string;
  aoiId?: string;
  /** True when the request was served from cache (0 PU billed). */
  cacheHit: boolean;
  /** PU that WOULD have been billed had this not been a cache hit (for ROI). */
  avoidedPu?: number;
  requestKey?: string;
}

export type BudgetAlertLevel = "ok" | "warn" | "critical" | "exceeded";

export interface BudgetAlert {
  level: BudgetAlertLevel;
  usedPu: number;
  allowancePu: number;
  fractionUsed: number;
  message: I18nText;
}

/** Default alert thresholds as a fraction of the monthly allowance. */
export interface BudgetThresholds {
  warn: number; // e.g. 0.8
  critical: number; // e.g. 0.95
}

export const DEFAULT_THRESHOLDS: BudgetThresholds = { warn: 0.8, critical: 0.95 };

/**
 * Accumulates PU spend for a billing window and emits budget alerts. Not
 * persistent on its own — the host app snapshots `total()` / restores via
 * `seed()` across process restarts.
 */
export class PuBudgetMonitor {
  private usedPu = 0;
  private readonly ledger: PuLedgerEntry[] = [];

  constructor(
    private readonly allowancePu: number,
    private readonly thresholds: BudgetThresholds = DEFAULT_THRESHOLDS,
    private readonly onAlert?: (alert: BudgetAlert) => void,
  ) {}

  /** Build a monitor pre-sized to a subscription tier's monthly PU allowance. */
  static forTier(
    tier: SubscriptionTier,
    thresholds: BudgetThresholds = DEFAULT_THRESHOLDS,
    onAlert?: (alert: BudgetAlert) => void,
  ): PuBudgetMonitor {
    return new PuBudgetMonitor(TIER_CONFIGS[tier].puPerMonth, thresholds, onAlert);
  }

  /** Restore accumulated spend (e.g. from a persisted snapshot). */
  seed(usedPu: number): void {
    this.usedPu = Math.max(usedPu, 0);
  }

  /**
   * Record a request. Cache hits cost 0 PU but are still logged. Returns the
   * current budget alert AFTER recording (fires `onAlert` on level change-up).
   */
  record(entry: Omit<PuLedgerEntry, "at"> & { at?: string }): BudgetAlert {
    const row: PuLedgerEntry = {
      at: entry.at ?? new Date().toISOString(),
      pu: entry.cacheHit ? 0 : entry.pu,
      collection: entry.collection,
      aoiId: entry.aoiId,
      cacheHit: entry.cacheHit,
      avoidedPu: entry.cacheHit ? (entry.avoidedPu ?? entry.pu) : undefined,
      requestKey: entry.requestKey,
    };
    this.ledger.push(row);
    this.usedPu += row.pu;

    const alert = this.currentAlert();
    if (alert.level !== "ok" && this.onAlert) this.onAlert(alert);
    return alert;
  }

  /** Would recording this request exceed the allowance? (pre-flight gate) */
  wouldExceed(pu: number): boolean {
    return this.usedPu + pu > this.allowancePu;
  }

  total(): { usedPu: number; allowancePu: number; entries: number } {
    return { usedPu: this.usedPu, allowancePu: this.allowancePu, entries: this.ledger.length };
  }

  /** PU saved by cache hits this window — for ROI reporting. */
  savedByCachePu(): number {
    return Math.round(
      this.ledger
        .filter((e) => e.cacheHit)
        .reduce((sum, e) => sum + (e.avoidedPu ?? 0), 0) * 1000,
    ) / 1000;
  }

  currentAlert(): BudgetAlert {
    const fraction = this.allowancePu > 0 ? this.usedPu / this.allowancePu : 0;
    let level: BudgetAlertLevel = "ok";
    if (fraction >= 1) level = "exceeded";
    else if (fraction >= this.thresholds.critical) level = "critical";
    else if (fraction >= this.thresholds.warn) level = "warn";

    return {
      level,
      usedPu: Math.round(this.usedPu * 1000) / 1000,
      allowancePu: this.allowancePu,
      fractionUsed: Math.round(fraction * 1000) / 1000,
      message: ALERT_MESSAGES[level],
    };
  }
}

const ALERT_MESSAGES: Record<BudgetAlertLevel, I18nText> = {
  ok: { en: "PU budget healthy", uk: "Бюджет PU в нормі" },
  warn: {
    en: "PU budget at warning threshold — review AOI cadences",
    uk: "Бюджет PU на рівні попередження — перегляньте частоту оновлення AOI",
  },
  critical: {
    en: "PU budget near limit — throttle non-essential refreshes",
    uk: "Бюджет PU майже вичерпано — обмежте неважливі оновлення",
  },
  exceeded: {
    en: "PU budget EXCEEDED — new commercial requests blocked",
    uk: "Бюджет PU ВИЧЕРПАНО — нові комерційні запити заблоковано",
  },
};
