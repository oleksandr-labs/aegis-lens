/**
 * Per-page link budget — keep contextual internal links sane (no 200-link
 * spam). Caps how many algorithm-derived in-content links a template may emit
 * and trims a candidate list to fit, preserving the highest-ranked items.
 *
 * Note: this governs the *contextual / related* links the engine injects, not
 * global chrome (header/footer/nav), which is template-fixed and counted
 * separately by the monitoring modules.
 */

import type { PageTemplate } from "./link-graph";
import type { RelatedResult } from "./related-embeddings";

/** Max contextual internal links the engine may add, per template. */
export const LINK_BUDGET: Record<PageTemplate, number> = {
  home: 30,
  "region-hub": 24,
  region: 12,
  "topic-hub": 24,
  topic: 12,
  "entity-hub": 24,
  entity: 10,
  event: 8,
  report: 10,
  "reports-hub": 24,
  tag: 12,
  other: 8,
};

/** A hard ceiling no template may exceed regardless of its configured budget. */
export const GLOBAL_MAX_CONTEXTUAL_LINKS = 30;

export function budgetFor(template: PageTemplate): number {
  return Math.min(LINK_BUDGET[template] ?? LINK_BUDGET.other, GLOBAL_MAX_CONTEXTUAL_LINKS);
}

/** Trim a ranked candidate list to the template's budget (keeps top-N). */
export function enforceBudget(
  template: PageTemplate,
  ranked: RelatedResult[],
): RelatedResult[] {
  return ranked.slice(0, budgetFor(template));
}

export interface BudgetCheck {
  template: PageTemplate;
  count: number;
  budget: number;
  withinBudget: boolean;
  over: number;
}

/** Diagnostic: does a page's contextual link count fit its budget? */
export function checkBudget(template: PageTemplate, count: number): BudgetCheck {
  const budget = budgetFor(template);
  return {
    template,
    count,
    budget,
    withinBudget: count <= budget,
    over: Math.max(0, count - budget),
  };
}
