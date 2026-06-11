/**
 * Barrel — Semantic SEO & Knowledge Graph module.
 *
 * Exports:
 *   types               — SchemaEntityType, SameAsLink, EntityMention,
 *                          SemanticPageSchema, InlineEntitySchema
 *   entity-schema       — buildEntitySchema, buildAboutMentionsSchema,
 *                          buildFaqSchema, buildHowToSchema
 *   defined-term-linker — GlossaryTerm, linkDefinedTerms,
 *                          extractEntityMentions
 *   schema-validation   — SchemaValidationResult, REQUIRED_FIELDS,
 *                          validateEntitySchema, validatePageSchema,
 *                          auditPageForSchemaCoverage
 */

export * from "./types";
export * from "./entity-schema";
export * from "./defined-term-linker";
export * from "./schema-validation";
