/**
 * Cost-per-page tracking.
 *
 * Estimates USD cost from token usage using the pricing table in llm.ts, then
 * aggregates per page and per kind so the editorial team can watch the
 * cost/quality trade-off (reviewer time is the moat — see TODO notes).
 *
 * In production the `CostLedger` would persist to Postgres; here it is an
 * in-memory accumulator with the same API surface.
 */

import { MODEL_PRICING_USD_PER_MTOK } from "./llm";
import type { GenerationCost, LLMResult, SeoArtifactKind } from "./types";

/** Compute USD cost for one LLM call. Unknown models default to Haiku-ish pricing. */
export function estimateCost(result: LLMResult): GenerationCost {
  const usage = result.usage ?? { inputTokens: 0, outputTokens: 0 };
  const price = MODEL_PRICING_USD_PER_MTOK[result.model] ?? { input: 1.0, output: 5.0 };
  const usdCost =
    (usage.inputTokens / 1_000_000) * price.input + (usage.outputTokens / 1_000_000) * price.output;
  return {
    model: result.model,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    usdCost: Number(usdCost.toFixed(6)),
  };
}

export interface CostEntry extends GenerationCost {
  pageId: string;
  kind: SeoArtifactKind;
  at: string;
}

export interface PageCostSummary {
  pageId: string;
  totalUsd: number;
  calls: number;
  byKind: Partial<Record<SeoArtifactKind, number>>;
}

export class CostLedger {
  private readonly entries: CostEntry[] = [];

  record(pageId: string, kind: SeoArtifactKind, cost: GenerationCost): void {
    this.entries.push({ ...cost, pageId, kind, at: new Date().toISOString() });
  }

  recordResult(pageId: string, kind: SeoArtifactKind, result: LLMResult): GenerationCost {
    const cost = estimateCost(result);
    this.record(pageId, kind, cost);
    return cost;
  }

  perPage(pageId: string): PageCostSummary {
    const rows = this.entries.filter((e) => e.pageId === pageId);
    const byKind: Partial<Record<SeoArtifactKind, number>> = {};
    let totalUsd = 0;
    for (const r of rows) {
      totalUsd += r.usdCost;
      byKind[r.kind] = (byKind[r.kind] ?? 0) + r.usdCost;
    }
    return { pageId, totalUsd: Number(totalUsd.toFixed(6)), calls: rows.length, byKind };
  }

  totalUsd(): number {
    return Number(this.entries.reduce((s, e) => s + e.usdCost, 0).toFixed(6));
  }

  all(): readonly CostEntry[] {
    return this.entries;
  }
}
