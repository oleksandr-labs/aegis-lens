/**
 * Utility-data ingestion adapter (UA: Ukrenergo, regional oblenergo).
 *
 * Ukrenergo is the national TSO; each oblast has its own distribution operator
 * (oblenergo / DTEK / "ОблЕнерго") that publishes outage status, often via the
 * "Світло" / "СвітлоБот" portals or regional REST/HTML status pages.
 *
 * In production this adapter would poll:
 *   - Ukrenergo press/telegram + the national power-balance API
 *   - per-oblast oblenergo portals (e.g. dtek-oem.com.ua, poe.pl.ua, etc.)
 * and normalise their varied formats into OutageSignal[].
 *
 * Without partner access to those feeds this module ships the codeable contract:
 * a typed UtilityFeedRecord, a per-operator registry, and a deterministic
 * normaliser + demo provider — mirroring schedule-adapter.ts.
 */

import type { OutageSignal, OutageCause } from "./types";

/** A raw status record as published by a utility operator. */
export interface UtilityFeedRecord {
  /** Operator slug, e.g. "ukrenergo" | "dtek-kem" | "kharkivoblenergo" */
  operator: string;
  /** ISO 3166-2:UA oblast code, e.g. "UA-63" */
  regionCode: string;
  /**
   * Operator-declared state of supply in the region.
   *  - "stable":     normal supply
   *  - "limited":    rolling / partial restrictions in effect
   *  - "emergency":  emergency (unscheduled) outages
   *  - "blackout":   wide-area loss of supply
   */
  state: "stable" | "limited" | "emergency" | "blackout";
  /** Operator-declared / inferred reason. */
  reason: OutageCause;
  /** Fraction of consumers affected per operator (0–1), if published. */
  affectedFraction?: number;
  /** Operator publish timestamp (ISO 8601). */
  publishedAt: string;
  /** Source URL for auditing. */
  sourceUrl?: string;
}

/** Distribution operators keyed by oblast for attribution + reverse lookup. */
export const OBLENERGO_REGISTRY: Record<string, { en: string; uk: string }> = {
  "UA-63": { en: "Kharkivoblenergo", uk: "Харківобленерго" },
  "UA-12": { en: "DTEK Dnipro Grids", uk: "ДТЕК Дніпровські електромережі" },
  "UA-14": { en: "DTEK Donetsk Grids", uk: "ДТЕК Донецькі електромережі" },
  "UA-51": { en: "DTEK Odesa Grids", uk: "ДТЕК Одеські електромережі" },
  "UA-30": { en: "DTEK Kyiv Grids", uk: "ДТЕК Київські електромережі" },
  "UA-32": { en: "Kyivoblenergo", uk: "Київобленерго" },
  "UA-46": { en: "Lvivoblenergo", uk: "Львівобленерго" },
  "UA-53": { en: "Poltavaoblenergo", uk: "Полтаваобленерго" },
  "UA-48": { en: "Mykolaivoblenergo", uk: "Миколаївобленерго" },
  "UA-65": { en: "Khersonoblenergo", uk: "Херсонобленерго" },
};

/** Confidence the adapter assigns to an operator-published state. */
const STATE_CONFIDENCE: Record<UtilityFeedRecord["state"], number> = {
  stable: 0,
  limited: 0.85,
  emergency: 0.92,
  blackout: 0.95,
};

/** Coverage fallback per state when the operator omits affectedFraction. */
const STATE_COVERAGE: Record<UtilityFeedRecord["state"], number> = {
  stable: 0,
  limited: 0.25,
  emergency: 0.5,
  blackout: 0.85,
};

/**
 * Normalise raw operator feed records into OutageSignals.
 * "stable" records produce no signal (no outage to report).
 */
export function normaliseUtilityRecords(records: UtilityFeedRecord[]): OutageSignal[] {
  const signals: OutageSignal[] = [];
  for (const r of records) {
    if (r.state === "stable") continue;
    signals.push({
      source: "telegram_channel", // utility feeds enter the fusion model as official-operator signals
      regionCode: r.regionCode,
      confidence: STATE_CONFIDENCE[r.state],
      detectedAt: r.publishedAt,
      cause: r.reason,
      estimatedCoverage: r.affectedFraction ?? STATE_COVERAGE[r.state],
      rawData: {
        feed: "utility",
        operator: r.operator,
        state: r.state,
        sourceUrl: r.sourceUrl,
      },
    });
  }
  return signals;
}

/** Demo feed standing in for live Ukrenergo + oblenergo polling. */
const DEMO_FEED: UtilityFeedRecord[] = [
  {
    operator: "ukrenergo",
    regionCode: "UA-63",
    state: "emergency",
    reason: "damage",
    affectedFraction: 0.45,
    publishedAt: new Date(Date.now() - 90 * 60_000).toISOString(),
    sourceUrl: "https://ua.energy",
  },
  {
    operator: "kharkivoblenergo",
    regionCode: "UA-63",
    state: "limited",
    reason: "scheduled",
    publishedAt: new Date(Date.now() - 30 * 60_000).toISOString(),
    sourceUrl: "https://www.oblenergo.kharkov.ua",
  },
  {
    operator: "dtek-donetsk",
    regionCode: "UA-14",
    state: "blackout",
    reason: "damage",
    affectedFraction: 0.7,
    publishedAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
    sourceUrl: "https://www.dtek-dnem.com.ua",
  },
];

/**
 * Fetch normalised utility signals.
 * In production: poll Ukrenergo + oblenergo endpoints. Falls back to demo data.
 */
export async function getUtilitySignals(records?: UtilityFeedRecord[]): Promise<OutageSignal[]> {
  return normaliseUtilityRecords(records ?? DEMO_FEED);
}
