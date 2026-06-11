/**
 * @ua-map/ai-seo — shared types.
 *
 * Every artifact produced by this service is a DRAFT until it passes the
 * hallucination/quality gate (`quality-gate.ts`) and the editorial gate
 * (`review-gate.ts`). YMYL (Your-Money-or-Your-Life) page types fail closed:
 * they require a native-speaker reviewer sign-off before they may be indexed.
 *
 * See COMPLIANCE.md for the AI-generated-content policy.
 */

/** Tier-1 locales get mandatory native-reviewer sign-off (see i18n in TODO). */
export type Locale = "en" | "uk" | "ru" | string;

export const TIER1_LOCALES: readonly Locale[] = ["en", "uk"] as const;

/**
 * Page archetypes the SEO generator knows how to produce copy for.
 * `safety` / `legal` / `medical-adjacent` are YMYL — gated harder.
 */
export type PageType =
  | "event_detail" // a single OSINT event page
  | "region_overview" // aggregate page for a region/oblast
  | "layer_explainer" // explains a map layer / data source
  | "glossary_term" // a definitional page
  | "category_index" // listing page for an event class
  | "safety_advisory" // YMYL: civilian-safety guidance
  | "methodology"; // how-we-verify / sourcing page

/** YMYL page types: hallucination gate fails closed for these. */
export const YMYL_PAGE_TYPES: readonly PageType[] = ["safety_advisory"] as const;

export function isYmyl(pageType: PageType): boolean {
  return YMYL_PAGE_TYPES.includes(pageType);
}

/**
 * A verifiable fact the model is ALLOWED to use. Generation is grounded:
 * the model may only assert claims traceable to one of these. The quality
 * gate checks generated text against this evidence set.
 */
export interface GroundingFact {
  id: string;
  /** The factual statement, in source form. */
  statement: string;
  /** Provenance — event id, dataset, or source URL. Required: no source → not usable. */
  sourceUrl?: string;
  eventId?: string;
  /** ISO timestamp the underlying fact was observed/verified. */
  observedAt?: string;
  /** 0–1 confidence carried from the upstream pipeline. */
  confidence?: number;
}

/** The grounding context handed to every generator. */
export interface PageContext {
  pageId: string;
  pageType: PageType;
  locale: Locale;
  /** Human-readable subject, e.g. "Kharkiv Oblast" or a glossary term. */
  subject: string;
  /** Facts the model is allowed to use. Empty → generators must refuse. */
  facts: GroundingFact[];
  /** Target keywords for this page (informs copy, never stuffed). */
  keywords?: string[];
  /** Brand-voice descriptor, e.g. "measured, factual, non-sensational". */
  brandVoice?: string;
  /** Canonical/related pages for internal-link suggestion. */
  relatedPages?: RelatedPage[];
}

export interface RelatedPage {
  pageId: string;
  url: string;
  title: string;
  /** Optional dense embedding for semantic similarity. */
  embedding?: number[];
  /** Optional knowledge-graph entity ids this page is about. */
  kgEntityIds?: string[];
  keywords?: string[];
}

/** Lifecycle of any generated artifact. */
export type ArtifactStatus =
  | "draft"
  | "quality_failed" // hallucination/quality gate rejected
  | "pending_review" // awaiting editorial / native-reviewer sign-off
  | "approved" // cleared for indexing
  | "rejected" // editor rejected
  | "published";

export type SeoArtifactKind =
  | "metadata"
  | "faq"
  | "intro"
  | "internal_links"
  | "schema_org"
  | "alt_text"
  | "locale_variant";

/** Reason codes the quality gate can emit. */
export type QualityFlag =
  | "ungrounded_claim" // assertion with no matching grounding fact
  | "no_grounding_facts" // generator ran without evidence
  | "fabricated_number" // a numeric/date claim absent from evidence
  | "missing_citation" // YMYL/intro requires citation, none present
  | "keyword_stuffing"
  | "length_out_of_range"
  | "near_duplicate" // collides with an existing page
  | "low_confidence"
  | "disclosure_missing"; // AI-disclosure not attached where required

export interface QualityIssue {
  flag: QualityFlag;
  /** 0–1 severity; >= gate threshold blocks publish. */
  severity: number;
  detail: string;
  /** The offending span, if locatable. */
  span?: string;
}

/** Confidence breakdown for a single artifact (see confidence.ts). */
export interface ArtifactConfidence {
  /** 0–1 aggregate. */
  score: number;
  components: {
    grounding: number; // share of claims traced to evidence
    sourceConfidence: number; // mean upstream fact confidence
    qualityPenalty: number; // deduction from quality issues
    localeAdaptation?: number; // for locale variants
  };
}

/** AI-content disclosure attached to every published artifact (transparency). */
export interface AiDisclosure {
  generatedByAi: true;
  model: string;
  generatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  /** Human-facing notice, localized. */
  notice: Record<Locale, string>;
}

/** Base envelope shared by all generated artifacts. */
export interface SeoArtifact<T> {
  artifactId: string;
  kind: SeoArtifactKind;
  pageId: string;
  pageType: PageType;
  locale: Locale;
  status: ArtifactStatus;
  content: T;
  confidence: ArtifactConfidence;
  issues: QualityIssue[];
  /** Grounding-fact ids actually used. */
  usedFactIds: string[];
  disclosure?: AiDisclosure;
  /** Cost accounting for this generation (see cost-tracking.ts). */
  cost?: GenerationCost;
  model: string;
  createdAt: string;
}

// ── Per-kind content shapes ───────────────────────────────────────────────────

export interface MetadataContent {
  title: string;
  metaDescription: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  /** Grounding-fact ids backing the answer. */
  factIds: string[];
}
export interface FaqContent {
  items: FaqItem[];
}

export interface IntroContent {
  paragraph: string;
  /** Inline citation markers map to fact ids; intros REQUIRE >= 1 citation. */
  citationFactIds: string[];
}

export interface InternalLinkSuggestion {
  targetPageId: string;
  targetUrl: string;
  anchorText: string;
  /** 0–1 relevance from KG overlap + semantic similarity. */
  relevance: number;
  rationale: "kg_entity_overlap" | "semantic_similarity" | "keyword_overlap";
}
export interface InternalLinksContent {
  suggestions: InternalLinkSuggestion[];
}

/** Minimal schema.org JSON-LD node (typed loosely — schema.org is open). */
export type JsonLd = Record<string, unknown> & { "@context": string; "@type": string };
export interface SchemaOrgContent {
  jsonLd: JsonLd;
}

export interface AltTextContent {
  imageRef: string;
  altText: string;
}

export interface LocaleVariantContent {
  sourceLocale: Locale;
  targetLocale: Locale;
  /** Adapted (not raw-MT) text. */
  text: string;
  /** True when an adaptation step (not literal translation) was applied. */
  adapted: boolean;
}

// ── Cost tracking ─────────────────────────────────────────────────────────────

export interface GenerationCost {
  model: string;
  inputTokens: number;
  outputTokens: number;
  usdCost: number;
}

// ── LLM abstraction (loose coupling — see llm.ts) ─────────────────────────────

/**
 * Minimal completion contract. Mirrors `services/reports` `LLMBackend` so any
 * provider (the future `integrations/llm-providers`, Anthropic, OpenAI, or a
 * deterministic test stub) can be injected. The service NEVER imports a
 * concrete provider — callers wire one in.
 */
export interface LLMBackend {
  complete(prompt: string, opts?: LLMCompleteOptions): Promise<LLMResult>;
}

export interface LLMCompleteOptions {
  system?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMResult {
  text: string;
  model: string;
  usage?: { inputTokens: number; outputTokens: number };
}
