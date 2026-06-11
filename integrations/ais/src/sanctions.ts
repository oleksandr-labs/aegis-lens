/**
 * Sanctions screening for vessels.
 * Checks MMSI and IMO against OFAC SDN list and EU consolidated list.
 *
 * In production: lists are fetched daily from official sources and
 * stored in a local DB for fast lookup.
 *
 * OFAC SDN list: https://www.treasury.gov/ofac/downloads/sdn.csv
 * EU consolidated: https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList/content
 */

import type { SanctionsStatus } from "./types";

export interface SanctionsEntry {
  mmsi?: string;
  imo?: string;
  vessel_name?: string;
  lists: string[];
  added_at: string;
}

export interface SanctionsStore {
  checkMMSI(mmsi: string): Promise<SanctionsEntry | null>;
  checkIMO(imo: string): Promise<SanctionsEntry | null>;
  /** Bulk upsert from a parsed sanctions file */
  upsert(entries: SanctionsEntry[]): Promise<number>;
}

/** In-memory store; replace with Postgres/Redis in production */
export class InMemorySanctionsStore implements SanctionsStore {
  private byMMSI = new Map<string, SanctionsEntry>();
  private byIMO = new Map<string, SanctionsEntry>();

  async checkMMSI(mmsi: string): Promise<SanctionsEntry | null> {
    return this.byMMSI.get(mmsi) ?? null;
  }

  async checkIMO(imo: string): Promise<SanctionsEntry | null> {
    return this.byIMO.get(imo) ?? null;
  }

  async upsert(entries: SanctionsEntry[]): Promise<number> {
    for (const e of entries) {
      if (e.mmsi) this.byMMSI.set(e.mmsi, e);
      if (e.imo) this.byIMO.set(e.imo, e);
    }
    return entries.length;
  }
}

export async function screenVessel(
  mmsi: string,
  imo: string | null,
  store: SanctionsStore,
): Promise<{ sanctioned: boolean; lists: string[] }> {
  const byMMSI = await store.checkMMSI(mmsi);
  const byIMO = imo ? await store.checkIMO(imo) : null;

  const hit = byMMSI ?? byIMO;
  if (!hit) return { sanctioned: false, lists: [] };
  return { sanctioned: true, lists: hit.lists };
}

// ── OFAC / EU screening + map highlight ─────────────────────────────────────────

export interface SanctionsScreenResult {
  sanctioned: boolean;
  lists: string[];
  /** Programme code: OFAC, EU, UK, UN, etc. */
  programmes: string[];
  status: SanctionsStatus;
  /** True when the vessel should be visually highlighted on the map */
  highlight: boolean;
  /** Highlight color used by the paint spec / legend */
  highlight_color: string;
  /** When the sanctions data was last refreshed (stale = legal risk) */
  list_refreshed_at: string | null;
  labelEn: string;
  labelUk: string;
}

const OFAC_KEYS = ["OFAC", "SDN", "US"];
const EU_KEYS = ["EU", "EU_CONSOLIDATED"];
const UK_KEYS = ["UK", "OFSI", "HMT"];

function classifyProgrammes(lists: string[]): { programmes: string[]; status: SanctionsStatus } {
  const upper = lists.map((l) => l.toUpperCase());
  const has = (keys: string[]) => upper.some((l) => keys.some((k) => l.includes(k)));
  const ofac = has(OFAC_KEYS);
  const eu = has(EU_KEYS);
  const uk = has(UK_KEYS);

  const programmes: string[] = [];
  if (ofac) programmes.push("OFAC");
  if (eu) programmes.push("EU");
  if (uk) programmes.push("UK");

  let status: SanctionsStatus = "flagged";
  if (ofac && eu) status = "ofac_eu";
  else if (ofac) status = "ofac";
  else if (eu) status = "eu";
  else if (uk) status = "uk";
  return { programmes, status };
}

/**
 * Screen a vessel against OFAC + EU (+ UK) lists and produce a highlight
 * decision for the map. Highlighting is intentionally conservative: any
 * confirmed list hit highlights in red.
 */
export async function screenVesselDetailed(
  mmsi: string,
  imo: string | null,
  store: SanctionsStore,
  opts: { list_refreshed_at?: string | null } = {},
): Promise<SanctionsScreenResult> {
  const byMMSI = await store.checkMMSI(mmsi);
  const byIMO = imo ? await store.checkIMO(imo) : null;
  const hit = byMMSI ?? byIMO;

  if (!hit) {
    return {
      sanctioned: false,
      lists: [],
      programmes: [],
      status: "clear",
      highlight: false,
      highlight_color: "#64748b",
      list_refreshed_at: opts.list_refreshed_at ?? null,
      labelEn: "Not listed",
      labelUk: "Не у списках",
    };
  }

  const { programmes, status } = classifyProgrammes(hit.lists);
  return {
    sanctioned: true,
    lists: hit.lists,
    programmes,
    status,
    highlight: true,
    highlight_color: "#dc2626",
    list_refreshed_at: opts.list_refreshed_at ?? null,
    labelEn: `Sanctioned (${programmes.join(" + ") || "listed"})`,
    labelUk: `Під санкціями (${programmes.join(" + ") || "у списках"})`,
  };
}

/** True when the loaded sanctions lists are older than the allowed staleness. */
export function isSanctionsDataStale(
  list_refreshed_at: string | null,
  maxAgeHours = 24,
): boolean {
  if (!list_refreshed_at) return true;
  const ageH = (Date.now() - new Date(list_refreshed_at).getTime()) / 3_600_000;
  return ageH > maxAgeHours;
}
