/**
 * Editorial overrides — manual boost / suppress on top of the automated
 * (embedding + KG) candidate ranking.
 *
 * Editors occasionally need to force-link two pages ("boost") or forbid a link
 * that the algorithm keeps surfacing ("suppress" — e.g. a near-duplicate or a
 * legally-sensitive pairing). Overrides are scoped by `from` page (locale-
 * prefixed url) so they never leak across locales. A real CMS would persist
 * these; here they are an in-memory table the engine consults.
 */

import type { RelatedResult } from "./related-embeddings";

export interface EditorialOverride {
  /** Source page url (locale-prefixed). Overrides apply only to this page. */
  from: string;
  /** Target page url. */
  to: string;
  kind: "boost" | "suppress";
  /** For boosts: how strongly to lift. Added to score (default 1). */
  amount?: number;
  /** Optional editor note for auditability. */
  note?: string;
}

export interface OverrideTable {
  /** from-url -> to-url -> override */
  byFrom: Map<string, Map<string, EditorialOverride>>;
}

export function buildOverrideTable(overrides: EditorialOverride[]): OverrideTable {
  const byFrom = new Map<string, Map<string, EditorialOverride>>();
  for (const o of overrides) {
    const m = byFrom.get(o.from) ?? byFrom.set(o.from, new Map()).get(o.from)!;
    m.set(o.to, o);
  }
  return { byFrom };
}

/**
 * Apply overrides to a ranked candidate list for a given source page:
 *  - suppress: candidate removed entirely.
 *  - boost: candidate's score += amount; if the candidate was absent it is
 *    injected (so editors can force a link the algorithm missed).
 * Result is re-sorted by score. Targets must already be same-locale candidates
 * (the engine pre-filters); a boost cannot conjure a cross-locale target
 * because the injected url is taken verbatim from the override.
 */
export function applyOverrides(
  from: string,
  ranked: RelatedResult[],
  table: OverrideTable,
): RelatedResult[] {
  const rules = table.byFrom.get(from);
  if (!rules) return ranked;

  const out = ranked
    .filter((r) => rules.get(r.url)?.kind !== "suppress")
    .map((r) => {
      const o = rules.get(r.url);
      if (o?.kind === "boost") return { ...r, score: r.score + (o.amount ?? 1) };
      return r;
    });

  const present = new Set(out.map((r) => r.url));
  for (const o of rules.values()) {
    if (o.kind === "boost" && !present.has(o.to)) {
      out.push({ url: o.to, score: o.amount ?? 1 });
    }
  }

  out.sort((a, b) => b.score - a.score || a.url.localeCompare(b.url));
  return out;
}
