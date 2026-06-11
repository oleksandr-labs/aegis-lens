/**
 * Per-template internal-link rules.
 *
 * Declarative spec of WHAT each template should link to and HOW MANY, e.g.
 * "a region page links 5 events + 3 reports + 2 sibling regions". The engine
 * (embeddings + KG + overrides) supplies *ranked candidates per target kind*;
 * this module decides the slot allocation and assembles the final, budget-
 * respecting link set with the right `LinkRelation` tags for crawl-shape.
 *
 * Locale-preserving: a rule never specifies a target in another locale; the
 * candidate providers the caller passes in must already be locale-filtered.
 */

import type { LinkEdge, LinkRelation, PageTemplate } from "./link-graph";
import { budgetFor } from "./link-budget";

/** A kind of target a rule can request. */
export type TargetKind =
  | "event"
  | "report"
  | "sibling-region"
  | "topic"
  | "entity"
  | "related"
  | "hub";

export interface RuleSlot {
  kind: TargetKind;
  count: number;
  relation: LinkRelation;
}

export interface TemplateRule {
  template: PageTemplate;
  slots: RuleSlot[];
}

/**
 * The link rulebook. Counts are *targets*, not hard guarantees — if fewer
 * candidates exist, fewer links are emitted. Total across slots should stay at
 * or below the template's link budget (enforced again at assembly time).
 */
export const TEMPLATE_RULES: Record<PageTemplate, RuleSlot[]> = {
  home: [
    { kind: "topic", count: 6, relation: "hub-to-spoke" },
    { kind: "report", count: 4, relation: "related" },
  ],
  "region-hub": [
    { kind: "sibling-region", count: 12, relation: "hub-to-spoke" },
  ],
  region: [
    { kind: "event", count: 5, relation: "related" },
    { kind: "report", count: 3, relation: "related" },
    { kind: "sibling-region", count: 2, relation: "sibling" },
    { kind: "hub", count: 1, relation: "spoke-to-hub" },
  ],
  "topic-hub": [{ kind: "topic", count: 18, relation: "hub-to-spoke" }],
  topic: [
    { kind: "event", count: 6, relation: "related" },
    { kind: "report", count: 3, relation: "related" },
    { kind: "topic", count: 2, relation: "sibling" },
    { kind: "hub", count: 1, relation: "spoke-to-hub" },
  ],
  "entity-hub": [{ kind: "entity", count: 18, relation: "hub-to-spoke" }],
  entity: [
    { kind: "entity", count: 4, relation: "related" },
    { kind: "event", count: 3, relation: "related" },
    { kind: "report", count: 2, relation: "related" },
    { kind: "hub", count: 1, relation: "spoke-to-hub" },
  ],
  event: [
    { kind: "related", count: 4, relation: "related" },
    { kind: "entity", count: 2, relation: "related" },
    { kind: "topic", count: 1, relation: "spoke-to-hub" },
  ],
  report: [
    { kind: "entity", count: 3, relation: "related" },
    { kind: "event", count: 3, relation: "related" },
    { kind: "related", count: 2, relation: "related" },
    { kind: "hub", count: 1, relation: "spoke-to-hub" },
  ],
  "reports-hub": [{ kind: "report", count: 18, relation: "hub-to-spoke" }],
  tag: [{ kind: "related", count: 10, relation: "related" }],
  other: [{ kind: "related", count: 6, relation: "related" }],
};

export function ruleFor(template: PageTemplate): TemplateRule {
  return { template, slots: TEMPLATE_RULES[template] ?? TEMPLATE_RULES.other };
}

/** A candidate target the caller provides for one kind, already ranked. */
export interface RuleCandidate {
  url: string;
  anchor: string;
}

/**
 * Assemble the final link set for a page from per-kind ranked candidate lists.
 * Fills each slot up to its count, dedupes targets across slots (first slot
 * wins to keep the strongest relation), and trims the whole set to the
 * template's link budget. Returns `LinkEdge`s ready to merge into the graph.
 */
export function assembleLinks(
  fromUrl: string,
  template: PageTemplate,
  candidatesByKind: Partial<Record<TargetKind, RuleCandidate[]>>,
): LinkEdge[] {
  const edges: LinkEdge[] = [];
  const used = new Set<string>([fromUrl]);

  for (const slot of TEMPLATE_RULES[template] ?? TEMPLATE_RULES.other) {
    const pool = candidatesByKind[slot.kind] ?? [];
    let filled = 0;
    for (const c of pool) {
      if (filled >= slot.count) break;
      if (used.has(c.url)) continue;
      used.add(c.url);
      edges.push({ from: fromUrl, to: c.url, anchor: c.anchor, relation: slot.relation });
      filled++;
    }
  }

  return edges.slice(0, budgetFor(template));
}
