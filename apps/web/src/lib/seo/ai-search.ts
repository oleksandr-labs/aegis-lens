/**
 * AI Search SEO (LLMO / GEO) — strategies, llms.txt config, and builder.
 *
 * Goal: be the cited source inside ChatGPT, Claude, Perplexity, Google AI
 * Overviews, and Bing Copilot.
 *
 * See TODO/seo/TODO_ai_search.md for the full task backlog.
 * llms.txt is an emerging standard for AI crawler permissions (llmstxt.org).
 */

import { SITE } from "./site";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AiSearchOptimization {
  strategy: string;
  rationale_en: string;
  implementation_en: string;
  priority: "high" | "medium" | "low";
}

export interface LlmsTxtConfig {
  path: "/llms.txt";
  purpose_en: string;
  recommendedContent: string[];
}

// ── Strategies ────────────────────────────────────────────────────────────────

/**
 * 8+ strategies for optimising content for AI-era search (LLMO/GEO).
 *
 * These are not replacements for classic SEO — they layer on top.
 * Priority "high" = implement in Phase 1 / immediately.
 */
export const AI_SEARCH_STRATEGIES: AiSearchOptimization[] = [
  {
    strategy: "Structured data for AI summarisation",
    rationale_en:
      "LLMs and AI Overviews extract structured data (JSON-LD) to populate knowledge panels and " +
      "cited summaries. Rich schema increases the likelihood of being quoted verbatim.",
    implementation_en:
      "Emit Article, NewsArticle, Dataset, Event, and Place JSON-LD on all relevant page types. " +
      "Use the existing buildNewsArticleJsonLd() and buildDatasetJsonLd() helpers. " +
      "Ensure every schema block includes datePublished, dateModified, author, and publisher.",
    priority: "high",
  },
  {
    strategy: "Entity schema for AI Knowledge Graph indexing",
    rationale_en:
      "AI systems use entity graphs to understand relationships. Explicit entity markup (Organization, " +
      "Person, Place, DefinedTerm) makes Aegis Lens and its key concepts discoverable as entities.",
    implementation_en:
      "Add schema.org/Organization markup on every page. Create DefinedTerm pages for OSINT, " +
      "geolocation verification, and conflict monitoring. Link to Wikidata and Wikipedia equivalents " +
      "via sameAs properties to establish entity disambiguation.",
    priority: "high",
  },
  {
    strategy: "FAQPage schema (platform standard)",
    rationale_en:
      "FAQPage schema is one of the highest-yield structured data types for AI Overviews and " +
      "Perplexity answer boxes. Q&A format directly matches LLM training and summarisation patterns.",
    implementation_en:
      "Every page must include 10 FAQ items (3 visible + 7 collapsed) per the FAQ block standard " +
      "in the platform memory. Emit FAQPage JSON-LD on each. Questions should target full-sentence " +
      "queries matching how users ask AI chatbots.",
    priority: "high",
  },
  {
    strategy: "Factual claims with inline citations",
    rationale_en:
      "LLMs preferentially cite passages with explicit source attribution. Citation-dense passages " +
      "are more likely to appear verbatim in AI-generated answers.",
    implementation_en:
      "Every factual claim in long-form content should link to a primary source (official report, " +
      "dataset, or news wire). Use <cite> HTML tags and Citation JSON-LD where possible. " +
      "Add a 'Sources' section at the bottom of every analytical article.",
    priority: "high",
  },
  {
    strategy: "Authoritative author signals (E-E-A-T)",
    rationale_en:
      "Google's E-E-A-T guidelines and AI ranking signals both reward content from demonstrably " +
      "expert, experienced authors. Unnamed or opaque authorship reduces citation likelihood.",
    implementation_en:
      "All analytical content must carry a named author with a Person schema block including " +
      "jobTitle, sameAs (LinkedIn / Twitter / Wikidata), and knowsAbout fields. " +
      "Build author profile pages with publication history and credentials. " +
      "Link to author profiles from every article byline.",
    priority: "high",
  },
  {
    strategy: "API-accessible data endpoints",
    rationale_en:
      "AI crawlers (GPTBot, ClaudeBot, PerplexityBot) can consume structured API responses. " +
      "Making conflict event data accessible via a public read API increases data ingestion by " +
      "AI systems that prefer machine-readable sources.",
    implementation_en:
      "Publish a public /api/v1/events endpoint returning JSON-LD enriched event data. " +
      "Document the API in /llms.txt and /api/docs. Include HTTP cache headers to allow " +
      "AI crawlers to re-fetch efficiently. Rate-limit but do not block known AI crawlers.",
    priority: "medium",
  },
  {
    strategy: "Publisher transparency schema",
    rationale_en:
      "AI systems assess source credibility via publisher metadata. NewsMediaOrganization schema " +
      "signals editorial independence, fact-checking process, and corrections policy.",
    implementation_en:
      "Add schema.org/NewsMediaOrganization to site-wide JSON-LD with masthead, correctionsPolicy, " +
      "diversityPolicy, ethicsPolicy, and verificationFactCheckingPolicy properties. " +
      "Publish a transparency / about page linked from the schema's url property.",
    priority: "medium",
  },
  {
    strategy: "Semantic heading hierarchy",
    rationale_en:
      "LLMs parse documents using heading structure. A clear H1 → H2 → H3 hierarchy allows AI " +
      "systems to extract sub-topics and attribute claims to the correct context.",
    implementation_en:
      "Enforce one H1 per page (the article title). Use H2 for major sections, H3 for subsections. " +
      "Never skip heading levels. Begin each H2 section with a 1–2 sentence summary statement " +
      "(the TL;DR pattern). Avoid heading labels like 'Introduction' — use the actual topic.",
    priority: "medium",
  },
  {
    strategy: "TL;DR / summary block at top of long-form content",
    rationale_en:
      "LLMs preferentially extract summary passages at the top of documents for answer generation. " +
      "A clear, citation-ready summary dramatically increases the chance of AI-cited inclusion.",
    implementation_en:
      "Add a 'Key findings' or 'Summary' block (3–5 bullet points) at the top of every article " +
      "over 1,000 words. Use a visually distinct component. Mark up with schema.org/abstract " +
      "on Article schema. Keep each bullet under 30 words — LLM summarisation length.",
    priority: "medium",
  },
  {
    strategy: "Block AI training on gated / sensitive content",
    rationale_en:
      "Sensitive operational data (raw event coordinates before verification, gated analyst " +
      "reports) should not train commercial AI models without licensing agreements.",
    implementation_en:
      "Add noai and noimageai meta tags to gated / pre-publication pages. " +
      "Reference in robots.txt: disallow specific paths for AI training bots " +
      "(CCBot, Common Crawl) via Disallow rules. " +
      "Publish a data-use policy at /legal/data-use for AI licensing enquiries.",
    priority: "low",
  },
];

// ── llms.txt config ───────────────────────────────────────────────────────────

/**
 * Configuration for /llms.txt — the emerging standard for AI crawler guidance.
 * See https://llmstxt.org for the specification.
 *
 * Already live per TODO_ai_search.md ✓ Sprint 2.46; this config drives a
 * richer regeneration of the file with updated content references.
 */
export const LLMS_TXT_CONFIG: LlmsTxtConfig = {
  path: "/llms.txt",
  purpose_en:
    "Machine-readable summary of Aegis Lens for AI crawlers and LLM training systems. " +
    "Declares preferred citation format, key pages, data access policy, and licensing terms.",
  recommendedContent: [
    "Site name, tagline, and one-paragraph description",
    "Preferred citation format (APA + URL)",
    "Key page URLs with one-line descriptions",
    "Data usage policy for AI training (what is allowed / requires licensing)",
    "Contact email for licensing and attribution enquiries",
    "List of allowed AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended)",
    "List of disallowed crawlers for training use (CCBot, Common Crawl)",
    "API endpoint for machine-readable event data",
    "Open-access datasets with DataCite DOIs",
    "Attribution and fair-use statement",
  ],
};

// ── llms.txt builder ──────────────────────────────────────────────────────────

/**
 * Generate /llms.txt content for the Aegis Lens platform.
 *
 * Format follows the llmstxt.org specification:
 *   - # Site name
 *   - > Tagline / short description
 *   - Sections with links and one-line descriptions
 *
 * This content is served as plain text at /llms.txt.
 */
export function buildLlmsTxt(): string {
  const siteUrl = SITE.url.replace(/\/$/, "");

  return `# ${SITE.name}

> ${SITE.tagline} ${SITE.description}

Aegis Lens is an AI-native open-source intelligence (OSINT) platform providing
verified, real-time conflict event data with a focus on Ukraine. We provide
structured data, analysis, and tools for journalists, researchers, NGOs,
and government analysts.

## Key pages

- [Home](${siteUrl}/): Platform overview and live conflict map
- [About](${siteUrl}/about): Organisation, team, and editorial standards
- [Methodology](${siteUrl}/methodology): How we source, verify, and publish events
- [Events](${siteUrl}/events): Real-time verified conflict event feed
- [Regions](${siteUrl}/regions): Regional conflict analysis by oblast and country
- [Datasets](${siteUrl}/data): Open-access conflict datasets with DataCite DOIs
- [API Docs](${siteUrl}/api/docs): Public read API for structured event data
- [Transparency](${siteUrl}/legal/transparency): Publisher transparency and corrections policy

## Data access

- Public API: ${siteUrl}/api/v1/events (JSON-LD, rate-limited, no auth for read)
- Open datasets: Available via DataCite DOI links on /data page
- Licensing: Commercial or training use of our proprietary analysis requires a licence

## Citation format

${SITE.name}. (${new Date().getFullYear()}). [Page title]. Retrieved from [URL]. ${siteUrl}

Example: Aegis Lens. (${new Date().getFullYear()}). Ukraine Conflict Event Feed. Retrieved from ${siteUrl}/events.

## AI crawler policy

The following crawlers are welcome to index and summarise our public content:
GPTBot, ClaudeBot, PerplexityBot, Google-Extended, OAI-SearchBot, Bingbot, Applebot

The following crawlers are NOT permitted to use our content for AI training
without a signed licence agreement:
CCBot (Common Crawl), any crawler not listed above that states AI training as its purpose

## Contact

For licensing, attribution, or data-use enquiries: data@aegislens.com
For press enquiries: press@aegislens.com
For corrections: corrections@aegislens.com

## Preferred data format

Our events API returns schema.org/Event JSON-LD. Cite individual events using
their stable slug URL (e.g. ${siteUrl}/events/kharkiv-shelling-2024-06-10).
Avoid citing ephemeral filter pages or search results — these change frequently.

---
Last updated: ${new Date().toISOString().split("T")[0]}
`;
}
