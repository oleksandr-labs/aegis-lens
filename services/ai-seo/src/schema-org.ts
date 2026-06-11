/**
 * Schema.org JSON-LD generator (per page-type).
 *
 * Deterministic mapping from a page + its generated assets to a valid
 * schema.org node. Hallucination-free by construction: it only emits fields it
 * is given (subject, FAQ items, dates). No LLM call. Schema type is chosen from
 * the page type.
 */

import type {
  FaqContent,
  JsonLd,
  PageContext,
  SchemaOrgContent,
  SeoArtifact,
} from "./types";

const PAGE_TYPE_TO_SCHEMA: Record<string, string> = {
  event_detail: "NewsArticle",
  region_overview: "CollectionPage",
  layer_explainer: "TechArticle",
  glossary_term: "DefinedTerm",
  category_index: "CollectionPage",
  safety_advisory: "Article",
  methodology: "TechArticle",
};

export interface SchemaOrgInput {
  ctx: PageContext;
  url: string;
  title: string;
  description?: string;
  /** Optional FAQ to embed as a FAQPage / mainEntity. */
  faq?: FaqContent;
  datePublished?: string;
  dateModified?: string;
}

export function buildJsonLd(input: SchemaOrgInput): JsonLd {
  const { ctx, url, title, description } = input;
  const type = PAGE_TYPE_TO_SCHEMA[ctx.pageType] ?? "WebPage";

  const node: JsonLd = {
    "@context": "https://schema.org",
    "@type": type,
    name: title,
    headline: title,
    url,
    inLanguage: ctx.locale,
  };
  if (description) node.description = description;
  if (input.datePublished) node.datePublished = input.datePublished;
  if (input.dateModified) node.dateModified = input.dateModified;

  // Embed FAQ as a FAQPage mainEntity when present.
  if (input.faq && input.faq.items.length > 0) {
    node.mainEntity = input.faq.items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    }));
  }

  // Attach the source URLs as citations when available.
  const citations = ctx.facts.map((f) => f.sourceUrl).filter(Boolean);
  if (citations.length) node.citation = citations;

  return node;
}

export function generateSchemaOrg(input: SchemaOrgInput): SeoArtifact<SchemaOrgContent> {
  const jsonLd = buildJsonLd(input);
  return {
    artifactId: `seo_schema_org_${input.ctx.pageId}_${Date.now().toString(36)}`,
    kind: "schema_org",
    pageId: input.ctx.pageId,
    pageType: input.ctx.pageType,
    locale: input.ctx.locale,
    status: "approved", // deterministic, no generated prose of its own
    content: { jsonLd },
    confidence: { score: 1, components: { grounding: 1, sourceConfidence: 1, qualityPenalty: 0 } },
    issues: [],
    usedFactIds: input.ctx.facts.map((f) => f.id),
    model: "deterministic-jsonld",
    createdAt: new Date().toISOString(),
  };
}
