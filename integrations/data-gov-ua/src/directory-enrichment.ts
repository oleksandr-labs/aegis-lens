/**
 * Directory / companies-directory enrichment (Task 10).
 *
 * Where Task 9 enriches a single entity page, this builds the LIST surface: a
 * browsable, filterable companies/institutions directory backed by registry +
 * procurement + investigation signals. It resolves a batch of ЄДРПОУ codes into
 * compact directory rows, supports filtering (by type / status / risk) and
 * sorting (by name / procurement volume / risk-first), and reports facet counts
 * for the directory UI.
 *
 * Rows are lighter than full entity views (no per-tender list) so a directory of
 * hundreds of entities stays cheap; the row links to the full page by slug.
 */

import type {
  RegistryEntity,
  KgEntityType,
  CompanyStatus,
  ProcurementTender,
} from "./types";
import { resolveMany } from "./edr-resolver";
import { ProzorroClient } from "./prozorro-client";
import { enrichEntity } from "./kg-enrichment";

export interface DirectoryRow {
  slug: string;
  edrpou: string;
  entityType: KgEntityType;
  name: { en: string; uk?: string };
  status: CompanyStatus;
  flaggedRisk: boolean;
  /** Total UAH won via procurement (0 if none). */
  procurementVolumeUah: number;
  investigationCount: number;
}

export type DirectorySort = "name" | "procurement" | "risk";

export interface DirectoryFilter {
  entityType?: KgEntityType;
  status?: CompanyStatus;
  /** Only entities flagged in risk/verification checks. */
  riskOnly?: boolean;
}

export interface DirectoryResult {
  rows: DirectoryRow[];
  facets: {
    total: number;
    byType: Record<KgEntityType, number>;
    flaggedRisk: number;
    withProcurement: number;
  };
  generatedAt: string;
}

function toRow(entity: RegistryEntity): DirectoryRow {
  return {
    slug: entity.slug,
    edrpou: entity.edrpou,
    entityType: entity.entityType,
    name: entity.name,
    status: entity.status,
    flaggedRisk: Boolean(entity.flaggedRisk),
    procurementVolumeUah: entity.procurement?.totalAwardedUah ?? 0,
    investigationCount: entity.investigationLinks?.length ?? 0,
  };
}

export interface DirectoryConfig {
  prozorro?: ProzorroClient;
  filter?: DirectoryFilter;
  sort?: DirectorySort;
  verify?: boolean;
}

/**
 * Build a directory from a batch of ЄДРПОУ codes. All clients degrade to demo
 * data without secrets, so this works offline.
 */
export async function buildDirectory(
  edrpouCodes: string[],
  config: DirectoryConfig = {},
): Promise<DirectoryResult> {
  const prozorro = config.prozorro ?? new ProzorroClient();
  const records = await resolveMany(edrpouCodes, { verify: config.verify });

  const entities: RegistryEntity[] = [];
  for (const record of records) {
    const tenders: ProcurementTender[] = await prozorro.tendersForEdrpou(record.edrpou);
    entities.push(enrichEntity({ record, tenders }));
  }

  let rows = entities.map(toRow);

  // ── Filter ──
  const f = config.filter;
  if (f?.entityType) rows = rows.filter((r) => r.entityType === f.entityType);
  if (f?.status) rows = rows.filter((r) => r.status === f.status);
  if (f?.riskOnly) rows = rows.filter((r) => r.flaggedRisk);

  // ── Sort ──
  switch (config.sort) {
    case "procurement":
      rows.sort((a, b) => b.procurementVolumeUah - a.procurementVolumeUah);
      break;
    case "risk":
      rows.sort((a, b) => Number(b.flaggedRisk) - Number(a.flaggedRisk) || b.procurementVolumeUah - a.procurementVolumeUah);
      break;
    default:
      rows.sort((a, b) => (a.name.en ?? "").localeCompare(b.name.en ?? ""));
  }

  // ── Facets (computed over ALL resolved entities, pre-filter) ──
  const byType: Record<KgEntityType, number> = { company: 0, institution: 0, ngo: 0 };
  let flagged = 0;
  let withProc = 0;
  for (const e of entities) {
    byType[e.entityType]++;
    if (e.flaggedRisk) flagged++;
    if (e.procurement) withProc++;
  }

  return {
    rows,
    facets: { total: entities.length, byType, flaggedRisk: flagged, withProcurement: withProc },
    generatedAt: new Date().toISOString(),
  };
}
