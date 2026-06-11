/**
 * Entity-page enrichment (Task 9).
 *
 * The high-level façade the product calls to render an enriched entity page from
 * just a ЄДРПОУ: resolve registry facts → fetch procurement footprint → collect
 * investigation cross-links → build the KG RegistryEntity. Returns a single
 * `EnrichedEntityView` with everything an `/entities/<slug>` page needs, plus the
 * attribution citations required by COMPLIANCE.md.
 *
 * Every underlying client degrades to demo data without secrets, so this is
 * usable offline and from the API route.
 */

import type {
  RegistryEntity,
  ProcurementTender,
  InvestigationLink,
  RegistrySource,
} from "./types";
import { normalizeEdrpou, isValidEdrpou } from "./types";
import { resolveEdrpou } from "./edr-resolver";
import { ProzorroClient } from "./prozorro-client";
import { investigationLinksFor } from "./investigation-link";
import { enrichEntity } from "./kg-enrichment";

export interface EnrichedEntityView {
  edrpou: string;
  entity: RegistryEntity;
  procurement: ProcurementTender[];
  investigations: InvestigationLink[];
  /** Distinct attribution citations (one per provider) for the page footer. */
  attribution: RegistrySource[];
  generatedAt: string;
}

export interface EntityEnrichmentConfig {
  prozorro?: ProzorroClient;
  /** Skip the proprietary verification step (default: include). */
  verify?: boolean;
}

/** Build the enriched entity view for one ЄДРПОУ. Returns null if invalid. */
export async function enrichEntityPage(
  edrpou: string,
  config: EntityEnrichmentConfig = {},
): Promise<EnrichedEntityView | null> {
  const code = normalizeEdrpou(edrpou);
  if (!isValidEdrpou(code)) return null;

  const { record } = await resolveEdrpou(code, { verify: config.verify });
  if (!record) return null;

  const prozorro = config.prozorro ?? new ProzorroClient();
  const procurement = await prozorro.tendersForEdrpou(code);
  const investigations = await investigationLinksFor(code, { prozorro });

  const entity = enrichEntity({ record, tenders: procurement, investigationLinks: investigations });

  // De-dupe attribution by provider.
  const byProvider = new Map<string, RegistrySource>();
  for (const s of record.sources) if (!byProvider.has(s.provider)) byProvider.set(s.provider, s);

  return {
    edrpou: code,
    entity,
    procurement,
    investigations,
    attribution: [...byProvider.values()],
    generatedAt: new Date().toISOString(),
  };
}
