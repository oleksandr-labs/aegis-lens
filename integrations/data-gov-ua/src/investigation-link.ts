/**
 * Cross-link entities to relevant investigations (Task 11).
 *
 * Given a ЄДРПОУ, find the data-journalism investigations (Texty) and the
 * procurement counterparties (Prozorro) that connect to it, and emit
 * InvestigationLink records the entity page / KG can render. Two link kinds:
 *   1. "named in dataset" — the entity's ЄДРПОУ appears in a Texty dataset's
 *      `relatedEdrpou`.
 *   2. "procurement counterparty" — the entity transacts (as buyer or supplier)
 *      in a tender that a risk dataset also flags (transitive link).
 *
 * The links are evidence-preserving: each carries the source URL and a localized
 * relation reason. They power the "Related investigations" panel and feed the KG
 * enrichment (`kg-enrichment.ts`).
 */

import type {
  InvestigationLink,
  TextyDataset,
  ProcurementTender,
} from "./types";
import { normalizeEdrpou } from "./types";
import { TextyClient } from "./texty-client";
import { ProzorroClient } from "./prozorro-client";

export interface LinkConfig {
  texty?: TextyClient;
  prozorro?: ProzorroClient;
}

/** Build an InvestigationLink from a Texty dataset that names the entity. */
export function linkFromTexty(d: TextyDataset): InvestigationLink {
  return {
    investigationId: d.id,
    title: d.title,
    url: d.url,
    relation: { en: "named in dataset", uk: "згаданий у наборі даних" },
    source: "texty",
  };
}

/**
 * Build an InvestigationLink when a tender involving the entity overlaps a Texty
 * risk dataset (shared counterparty ЄДРПОУ) — a transitive investigation link.
 */
export function linkFromProcurement(
  tender: ProcurementTender,
  dataset: TextyDataset,
): InvestigationLink {
  return {
    investigationId: dataset.id,
    title: dataset.title,
    url: dataset.url,
    relation: {
      en: `procurement counterparty in tender ${tender.tenderId}`,
      uk: `контрагент у закупівлі ${tender.tenderId}`,
    },
    source: "texty",
  };
}

/** Collect all investigation links for one ЄДРПОУ. */
export async function investigationLinksFor(
  edrpou: string,
  config: LinkConfig = {},
): Promise<InvestigationLink[]> {
  const code = normalizeEdrpou(edrpou);
  const texty = config.texty ?? new TextyClient();
  const prozorro = config.prozorro ?? new ProzorroClient();

  const allDatasets = await texty.listDatasets();
  const links: InvestigationLink[] = [];
  const seen = new Set<string>();

  // 1. Direct: entity named in a dataset.
  for (const d of allDatasets) {
    if ((d.relatedEdrpou ?? []).map(normalizeEdrpou).includes(code)) {
      links.push(linkFromTexty(d));
      seen.add(d.id);
    }
  }

  // 2. Transitive: entity's tender counterparties appear in a risk dataset.
  const tenders = await prozorro.tendersForEdrpou(code);
  for (const t of tenders) {
    const counterparties = [t.buyerEdrpou, t.supplierEdrpou]
      .filter((c): c is string => Boolean(c))
      .map(normalizeEdrpou)
      .filter((c) => c !== code);
    for (const d of allDatasets) {
      if (seen.has(d.id)) continue;
      const named = (d.relatedEdrpou ?? []).map(normalizeEdrpou);
      if (counterparties.some((cp) => named.includes(cp))) {
        links.push(linkFromProcurement(t, d));
        seen.add(d.id);
      }
    }
  }

  return links;
}
