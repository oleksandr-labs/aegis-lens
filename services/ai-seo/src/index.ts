/**
 * @ua-map/ai-seo — AI-assisted SEO asset generation.
 *
 * All generators are grounded in supplied facts and pass through a
 * hallucination/quality gate (fail-closed for YMYL) and an editorial review
 * gate before any artifact may be indexed. See COMPLIANCE.md for the
 * AI-generated-content policy (native review, no fabricated facts, disclosure).
 *
 * LLM coupling is loose: inject any `LLMBackend` (the future
 * integrations/llm-providers, the bundled Anthropic adapter, or StubBackend).
 */

export * from "./types";
export * from "./llm";
export * from "./quality-gate";
export * from "./confidence";
export * from "./dedup";
export * from "./cost-tracking";
export * from "./review-gate";
export * from "./generate-common";

// Generators
export * from "./metadata";
export * from "./faq";
export * from "./intro";
export * from "./internal-links";
export * from "./schema-org";
export * from "./alt-text";
export * from "./locale-variants";
