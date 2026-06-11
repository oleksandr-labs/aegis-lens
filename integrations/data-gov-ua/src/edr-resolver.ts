/**
 * Entity-resolution from EDR codes (Task 7).
 *
 * Given a ЄДРПОУ (EDRPOU) code, resolve it to a single canonical CompanyRecord by
 * querying the available providers (data.gov.ua EDR dataset → OpenDataBot →
 * YouControl) and MERGING their facts. The merge is conservative:
 *   - the open EDR dataset / OpenDataBot supplies the registry facts;
 *   - YouControl supplies the verification / risk signal (corroboration);
 *   - provenance from every contributing provider is preserved in `sources`.
 *
 * This is the join key for KG enrichment: every enriched entity is anchored on a
 * resolved ЄДРПОУ. Resolution never invents data — if no provider answers, the
 * record is the demo/registry baseline with `status: "unknown"`.
 */

import type { CompanyRecord, RegistryOfficer, EconomicActivity } from "./types";
import { isValidEdrpou, normalizeEdrpou } from "./types";
import { OpenDataBotClient } from "./opendatabot-client";
import { YouControlClient, applyVerification } from "./youcontrol-client";

export interface ResolverConfig {
  openDataBot?: OpenDataBotClient;
  youControl?: YouControlClient;
  /** If false, skip the (proprietary) verification step. Default true. */
  verify?: boolean;
}

export interface ResolveResult {
  /** The merged record, or null if the code is invalid. */
  record: CompanyRecord | null;
  /** Why resolution produced what it did (diagnostics). */
  notes: string[];
}

/** Merge two records for the same ЄДРПОУ. `base` wins on identity fields; both
 * contribute provenance. `incoming` fills gaps and ORs the risk flag. */
export function mergeRecords(base: CompanyRecord, incoming: CompanyRecord): CompanyRecord {
  const officers: RegistryOfficer[] = dedupeOfficers([...(base.officers ?? []), ...(incoming.officers ?? [])]);
  const activities: EconomicActivity[] = dedupeActivities([
    ...(base.activities ?? []),
    ...(incoming.activities ?? []),
  ]);
  return {
    edrpou: base.edrpou,
    name: base.name.en && base.name.en !== base.edrpou ? base.name : incoming.name,
    shortName: base.shortName ?? incoming.shortName,
    status: base.status !== "unknown" ? base.status : incoming.status,
    address: base.address ?? incoming.address,
    officers: officers.length ? officers : undefined,
    activities: activities.length ? activities : undefined,
    registeredAt: base.registeredAt ?? incoming.registeredAt,
    authorizedCapitalUah: base.authorizedCapitalUah ?? incoming.authorizedCapitalUah,
    flaggedRisk: Boolean(base.flaggedRisk) || Boolean(incoming.flaggedRisk),
    providers: Array.from(new Set([...base.providers, ...incoming.providers])),
    sources: [...base.sources, ...incoming.sources],
    updatedAt: new Date().toISOString(),
  };
}

function dedupeOfficers(list: RegistryOfficer[]): RegistryOfficer[] {
  const seen = new Set<string>();
  const out: RegistryOfficer[] = [];
  for (const o of list) {
    const k = `${o.name}|${o.role.en}`;
    if (!seen.has(k)) { seen.add(k); out.push(o); }
  }
  return out;
}

function dedupeActivities(list: EconomicActivity[]): EconomicActivity[] {
  const seen = new Set<string>();
  const out: EconomicActivity[] = [];
  for (const a of list) {
    if (!seen.has(a.code)) { seen.add(a.code); out.push(a); }
  }
  return out;
}

/**
 * Resolve a ЄДРПОУ code → merged CompanyRecord.
 * Providers default to fresh clients (which themselves degrade to demo data
 * when no API key / network is available).
 */
export async function resolveEdrpou(
  edrpou: string,
  config: ResolverConfig = {},
): Promise<ResolveResult> {
  const notes: string[] = [];
  const code = normalizeEdrpou(edrpou);
  if (!isValidEdrpou(code)) {
    return { record: null, notes: [`invalid EDRPOU "${edrpou}" (expected 8 or 10 digits)`] };
  }

  const odb = config.openDataBot ?? new OpenDataBotClient();
  const base = await odb.getCompany(code);
  notes.push(`registry facts via providers: ${base.providers.join(", ")}`);

  let merged = base;
  if (config.verify !== false) {
    const yc = config.youControl ?? new YouControlClient();
    const verdict = await yc.verify(code);
    merged = applyVerification(merged, verdict);
    notes.push(
      verdict.flaggedRisk
        ? `YouControl: ${verdict.riskMarkers.length} risk marker(s)`
        : "YouControl: no risk markers",
    );
  }

  return { record: merged, notes };
}

/** Batch resolver (sequential to respect provider rate limits). */
export async function resolveMany(
  codes: string[],
  config: ResolverConfig = {},
): Promise<CompanyRecord[]> {
  const out: CompanyRecord[] = [];
  for (const c of codes) {
    const { record } = await resolveEdrpou(c, config);
    if (record) out.push(record);
  }
  return out;
}
