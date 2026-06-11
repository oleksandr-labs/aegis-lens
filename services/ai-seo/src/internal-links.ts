/**
 * Internal-link suggester (KG + semantic similarity).
 *
 * Deterministic, no LLM required: ranks candidate related pages by a blend of
 * knowledge-graph entity overlap, embedding cosine similarity, and keyword
 * overlap. Returns the top-N suggestions with anchor text and a rationale.
 *
 * Anchor text is derived from the target page title (truncated) — never
 * invented — so this module is hallucination-free by construction.
 */

import { cosine } from "./dedup";
import type {
  InternalLinkSuggestion,
  InternalLinksContent,
  PageContext,
  RelatedPage,
  SeoArtifact,
} from "./types";

export interface InternalLinkConfig {
  maxSuggestions: number;
  /** Min blended relevance to include. */
  minRelevance: number;
  /** Blend weights (sum need not be 1; normalized internally). */
  weights: { kg: number; semantic: number; keyword: number };
  /** Embedding of the current page, if available, for semantic scoring. */
  pageEmbedding?: number[];
}

export const DEFAULT_LINK_CONFIG: InternalLinkConfig = {
  maxSuggestions: 6,
  minRelevance: 0.2,
  weights: { kg: 0.5, semantic: 0.35, keyword: 0.15 },
};

function jaccardIds(a: string[] = [], b: string[] = []): number {
  const sa = new Set(a),
    sb = new Set(b);
  if (sa.size === 0 && sb.size === 0) return 0;
  let inter = 0;
  for (const x of sa) if (sb.has(x)) inter++;
  return inter / (sa.size + sb.size - inter);
}

function scorePage(
  ctx: PageContext,
  page: RelatedPage,
  cfg: InternalLinkConfig,
): { relevance: number; rationale: InternalLinkSuggestion["rationale"] } {
  // KG signal: overlap between this page's event ids (from grounding facts)
  // and the candidate page's knowledge-graph entity ids.
  const pageEntityIds = ctx.facts.flatMap((f) => (f.eventId ? [f.eventId] : []));
  const kgScore = jaccardIds(pageEntityIds, page.kgEntityIds);
  const sem = cfg.pageEmbedding && page.embedding ? cosine(cfg.pageEmbedding, page.embedding) : 0;
  const kw = jaccardIds(ctx.keywords, page.keywords);

  const w = cfg.weights;
  const denom = w.kg + w.semantic + w.keyword || 1;
  const relevance = (w.kg * kgScore + w.semantic * sem + w.keyword * kw) / denom;

  const rationale: InternalLinkSuggestion["rationale"] =
    kgScore >= sem && kgScore >= kw ? "kg_entity_overlap" : sem >= kw ? "semantic_similarity" : "keyword_overlap";
  return { relevance, rationale };
}

export function suggestInternalLinks(
  ctx: PageContext,
  config: Partial<InternalLinkConfig> = {},
): SeoArtifact<InternalLinksContent> {
  const cfg = { ...DEFAULT_LINK_CONFIG, ...config, weights: { ...DEFAULT_LINK_CONFIG.weights, ...config.weights } };
  const candidates = (ctx.relatedPages ?? []).filter((p) => p.pageId !== ctx.pageId);

  const suggestions: InternalLinkSuggestion[] = candidates
    .map((page) => {
      const { relevance, rationale } = scorePage(ctx, page, cfg);
      return {
        targetPageId: page.pageId,
        targetUrl: page.url,
        anchorText: page.title.slice(0, 80),
        relevance: Number(relevance.toFixed(4)),
        rationale,
      };
    })
    .filter((s) => s.relevance >= cfg.minRelevance)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, cfg.maxSuggestions);

  return {
    artifactId: `seo_internal_links_${ctx.pageId}_${Date.now().toString(36)}`,
    kind: "internal_links",
    pageId: ctx.pageId,
    pageType: ctx.pageType,
    locale: ctx.locale,
    // deterministic + hallucination-free → safe to auto-approve
    status: "approved",
    content: { suggestions },
    confidence: {
      score: suggestions.length ? Number((suggestions[0].relevance).toFixed(4)) : 0,
      components: { grounding: 1, sourceConfidence: 1, qualityPenalty: 0 },
    },
    issues: [],
    usedFactIds: [],
    model: "deterministic-ranker",
    createdAt: new Date().toISOString(),
  };
}
