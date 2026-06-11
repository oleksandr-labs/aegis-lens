/**
 * Operator status-page ingestion (Kyivstar, Vodafone Ukraine, lifecell).
 *
 * Ukrainian mobile/ISP operators publish service status via status pages,
 * official Telegram channels, and press releases. This module models a
 * normalised operator-status record and converts degraded/outage states into
 * NetBlocksIncident records that flow through the existing adapter.
 *
 * Production sources (per operator):
 *   - Kyivstar:   kyivstar.ua status / press, @kyivstar Telegram
 *   - Vodafone UA: vodafone.ua, @Vodafone_Ukraine
 *   - lifecell:   lifecell.ua, @lifecell_ukraine
 *
 * Demo mode returns seeded records. Editorial neutrality: we report the
 * operator-declared service state and region, not the cause.
 */

import type { NetBlocksIncident } from "./types";

export type OperatorSlug = "kyivstar" | "vodafone_ua" | "lifecell";

export type OperatorServiceState =
  | "operational"
  | "degraded"
  | "partial_outage"
  | "major_outage";

export interface OperatorStatusRecord {
  operator: OperatorSlug;
  /** Human-readable operator name (en/uk). */
  name: { en: string; uk: string };
  /** ISO 3166-2:UA oblast codes affected (empty = nationwide). */
  affectedRegions: string[];
  state: OperatorServiceState;
  /** Operator-declared / inferred fraction of subscribers affected, 0–1. */
  affectedFraction?: number;
  /** Free-text status note as published. */
  note?: { en: string; uk: string };
  publishedAt: string; // ISO 8601
  sourceUrl?: string;
}

export const OPERATOR_NAMES: Record<OperatorSlug, { en: string; uk: string }> = {
  kyivstar: { en: "Kyivstar", uk: "Київстар" },
  vodafone_ua: { en: "Vodafone Ukraine", uk: "Vodafone Україна" },
  lifecell: { en: "lifecell", uk: "lifecell" },
};

const STATE_FRACTION: Record<OperatorServiceState, number> = {
  operational: 0,
  degraded: 0.2,
  partial_outage: 0.5,
  major_outage: 0.85,
};

const STATE_STATUS: Record<OperatorServiceState, NetBlocksIncident["status"]> = {
  operational: "resolved",
  degraded: "monitoring",
  partial_outage: "ongoing",
  major_outage: "ongoing",
};

const DEMO_STATUS: OperatorStatusRecord[] = [
  {
    operator: "kyivstar",
    name: OPERATOR_NAMES.kyivstar,
    affectedRegions: ["UA-63", "UA-14"],
    state: "major_outage",
    affectedFraction: 0.8,
    note: {
      en: "Mobile and home internet services unavailable in parts of the east.",
      uk: "Мобільний та домашній інтернет недоступні в частині східних областей.",
    },
    publishedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    sourceUrl: "https://kyivstar.ua",
  },
  {
    operator: "vodafone_ua",
    name: OPERATOR_NAMES.vodafone_ua,
    affectedRegions: ["UA-63"],
    state: "partial_outage",
    affectedFraction: 0.4,
    note: {
      en: "Reduced voice and data quality reported in Kharkiv oblast.",
      uk: "Повідомлення про погіршення якості голосу та даних у Харківській області.",
    },
    publishedAt: new Date(Date.now() - 90 * 60_000).toISOString(),
    sourceUrl: "https://vodafone.ua",
  },
  {
    operator: "lifecell",
    name: OPERATOR_NAMES.lifecell,
    affectedRegions: [],
    state: "degraded",
    note: {
      en: "Intermittent network congestion nationwide.",
      uk: "Періодичні перевантаження мережі по всій країні.",
    },
    publishedAt: new Date(Date.now() - 45 * 60_000).toISOString(),
    sourceUrl: "https://lifecell.ua",
  },
];

/**
 * Fetch operator status records. In production each operator has its own
 * scraper/parser; here we accept injected records or fall back to demo data.
 */
export async function getOperatorStatus(records?: OperatorStatusRecord[]): Promise<OperatorStatusRecord[]> {
  return records ?? DEMO_STATUS;
}

/** Convert non-operational operator statuses into NetBlocksIncident records. */
export function operatorStatusToIncidents(records: OperatorStatusRecord[]): NetBlocksIncident[] {
  const incidents: NetBlocksIncident[] = [];
  for (const r of records) {
    if (r.state === "operational") continue;
    const fraction = r.affectedFraction ?? STATE_FRACTION[r.state];
    const scope = r.affectedRegions.length ? r.affectedRegions.join(", ") : "nationwide";
    const scopeUk = r.affectedRegions.length ? r.affectedRegions.join(", ") : "по всій країні";
    incidents.push({
      incidentId: `OP-${r.operator}-${new Date(r.publishedAt).getTime()}`,
      type: r.state === "degraded" ? "throttling" : "internet_outage",
      status: STATE_STATUS[r.state],
      country: "UA",
      affectedNetworks: [r.name.en],
      severityFraction: fraction,
      startedAt: r.publishedAt,
      resolvedAt: null,
      sourceUrl: r.sourceUrl,
      summary: `${r.name.en}: ${r.state.replace("_", " ")} (${scope}). ${r.note?.en ?? ""}`.trim(),
      summaryUk: `${r.name.uk}: ${stateUk(r.state)} (${scopeUk}). ${r.note?.uk ?? ""}`.trim(),
    });
  }
  return incidents;
}

function stateUk(state: OperatorServiceState): string {
  switch (state) {
    case "degraded": return "погіршення якості";
    case "partial_outage": return "часткове відключення";
    case "major_outage": return "масштабне відключення";
    default: return "працює";
  }
}
