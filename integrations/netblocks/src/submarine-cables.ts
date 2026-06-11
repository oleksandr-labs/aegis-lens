/**
 * Submarine cable status (TeleGeography).
 *
 * TeleGeography maintains the authoritative submarine-cable map and a Cable
 * Outage / maintenance feed. Cuts or faults on cables that carry transit for a
 * country can cause partial international connectivity loss. While Ukraine is
 * predominantly served by terrestrial fibre, Black Sea cables (and neighbours'
 * cables that carry UA transit) remain relevant to regional comms resilience.
 *
 * Production sources:
 *   - https://www.submarinecablemap.com/api/v3/cable/cable-geo.json
 *   - TeleGeography cable outage notices (partner feed)
 *
 * Demo mode returns seeded cable-status records. Editorial neutrality: a fault
 * is reported as a fault; cause (anchor, seismic, deliberate) is left open.
 */

import type { NetBlocksIncident } from "./types";

export type CableStatus = "operational" | "degraded" | "fault" | "maintenance";

export interface CableStatusRecord {
  cableId: string;
  cableName: string;
  /** ISO 3166-1 alpha-2 landing-point / served countries. */
  countries: string[];
  status: CableStatus;
  /** Fraction of the cable's capacity affected, 0–1. */
  capacityAffected?: number;
  /** Operator-declared note. */
  note?: { en: string; uk: string };
  reportedAt: string; // ISO 8601
  expectedRepairAt?: string | null;
  sourceUrl?: string;
}

const STATUS_FRACTION: Record<CableStatus, number> = {
  operational: 0,
  maintenance: 0.15,
  degraded: 0.4,
  fault: 0.7,
};

const DEMO_CABLES: CableStatusRecord[] = [
  {
    cableId: "kerch-strait-1",
    cableName: "Black Sea regional segment",
    countries: ["UA", "RO", "BG"],
    status: "degraded",
    capacityAffected: 0.35,
    note: {
      en: "Reduced capacity reported on a Black Sea segment carrying regional transit.",
      uk: "Повідомлено про зниження пропускної здатності на чорноморському сегменті регіонального транзиту.",
    },
    reportedAt: new Date(Date.now() - 8 * 3600_000).toISOString(),
    expectedRepairAt: null,
    sourceUrl: "https://www.submarinecablemap.com",
  },
  {
    cableId: "tgn-eurasia",
    cableName: "TGN-Eurasia (neighbour transit)",
    countries: ["RO", "TR"],
    status: "maintenance",
    capacityAffected: 0.1,
    note: {
      en: "Scheduled maintenance window; transient capacity reduction possible.",
      uk: "Планове технічне обслуговування; можливе тимчасове зниження пропускної здатності.",
    },
    reportedAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
    expectedRepairAt: new Date(Date.now() + 6 * 3600_000).toISOString(),
    sourceUrl: "https://www.submarinecablemap.com",
  },
];

/** Fetch cable-status records (injected or demo). */
export async function getSubmarineCableStatus(records?: CableStatusRecord[]): Promise<CableStatusRecord[]> {
  return records ?? DEMO_CABLES;
}

const STATUS_TEXT: Record<CableStatus, { en: string; uk: string }> = {
  operational: { en: "operational", uk: "у роботі" },
  maintenance: { en: "maintenance", uk: "технічне обслуговування" },
  degraded: { en: "degraded", uk: "зниження пропускної здатності" },
  fault: { en: "fault", uk: "пошкодження" },
};

/**
 * Convert non-operational cable records into NetBlocksIncident records.
 * One incident is emitted per affected country so the layer can attribute the
 * impact regionally.
 */
export function cableStatusToIncidents(records: CableStatusRecord[]): NetBlocksIncident[] {
  const incidents: NetBlocksIncident[] = [];
  for (const r of records) {
    if (r.status === "operational") continue;
    const fraction = r.capacityAffected ?? STATUS_FRACTION[r.status];
    const txt = STATUS_TEXT[r.status];
    for (const country of r.countries) {
      incidents.push({
        incidentId: `CABLE-${r.cableId}-${country}-${new Date(r.reportedAt).getTime()}`,
        type: "submarine_cable",
        status: r.status === "maintenance" ? "monitoring" : "ongoing",
        country,
        affectedNetworks: [r.cableName],
        severityFraction: fraction,
        startedAt: r.reportedAt,
        resolvedAt: null,
        sourceUrl: r.sourceUrl,
        summary: `Submarine cable ${r.cableName}: ${txt.en} (~${Math.round(fraction * 100)}% capacity affected). ${r.note?.en ?? ""}`.trim(),
        summaryUk: `Підводний кабель ${r.cableName}: ${txt.uk} (~${Math.round(fraction * 100)}% потужності зачеплено). ${r.note?.uk ?? ""}`.trim(),
      });
    }
  }
  return incidents;
}
