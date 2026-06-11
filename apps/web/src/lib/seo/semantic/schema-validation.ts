/**
 * Schema.org validation utilities — Aegis Lens SEO pipeline.
 *
 * Provides:
 *  - REQUIRED_FIELDS — minimum required properties per SchemaEntityType
 *  - validateEntitySchema — validates a single InlineEntitySchema
 *  - validatePageSchema — validates an array of raw JSON-LD objects
 *  - auditPageForSchemaCoverage — measures type coverage for a page type
 */

import type { SchemaEntityType, InlineEntitySchema } from "./types";

// ─── Result type ───────────────────────────────────────────────────────────

export interface SchemaValidationResult {
  /** True only when all required fields are present and no hard errors exist. */
  valid: boolean;
  /** Names of required fields that are absent in the schema. */
  missingFields: string[];
  /** Non-blocking issues (recommended fields absent, empty arrays, etc.). */
  warnings: string[];
}

// ─── Required fields contract ──────────────────────────────────────────────

/**
 * Minimum required properties for each SchemaEntityType.
 * Based on Google's Rich Results requirements and schema.org documentation.
 */
export const REQUIRED_FIELDS: Record<SchemaEntityType, string[]> = {
  Place: ["name"],
  Organization: ["name", "url"],
  Person: ["name"],
  Product: ["name", "description"],
  Event: ["name", "startDate", "location"],
  GeoShape: ["box"],
  FAQPage: ["mainEntity"],
  HowTo: ["step"],
  Article: ["headline", "author", "datePublished"],
};

// ─── Recommended fields (warnings only) ───────────────────────────────────

const RECOMMENDED_FIELDS: Partial<Record<SchemaEntityType, string[]>> = {
  Place: ["geo", "sameAs"],
  Organization: ["logo", "sameAs", "description"],
  Person: ["url", "sameAs"],
  Product: ["offers", "image"],
  Event: ["description", "endDate"],
  Article: ["dateModified", "description", "image"],
};

// ─── Expected schema types per page type ──────────────────────────────────

const PAGE_TYPE_EXPECTED_SCHEMAS: Record<string, SchemaEntityType[]> = {
  pillar: ["Organization", "FAQPage"],
  cluster: ["Article", "FAQPage"],
  comparison: ["Article"],
  region: ["Place", "Article"],
  tool: ["Product"],
  blog: ["Article", "FAQPage"],
  home: ["Organization", "FAQPage"],
};

// ─── Validators ────────────────────────────────────────────────────────────

/**
 * Validate a single typed InlineEntitySchema against REQUIRED_FIELDS.
 */
export function validateEntitySchema(
  schema: InlineEntitySchema,
): SchemaValidationResult {
  const type = schema["@type"];
  const required = REQUIRED_FIELDS[type] ?? [];
  const recommended = RECOMMENDED_FIELDS[type] ?? [];

  const missingFields = required.filter(
    (field) => !(field in schema) || (schema as Record<string, unknown>)[field] === undefined,
  );

  const warnings: string[] = [];

  // Name present but empty
  if ("name" in schema && !schema.name) {
    warnings.push("name is present but empty");
  }

  // Check recommended fields
  for (const rec of recommended) {
    if (!(rec in schema)) {
      warnings.push(`Recommended field "${rec}" is absent`);
    }
  }

  return {
    valid: missingFields.length === 0,
    missingFields,
    warnings,
  };
}

/**
 * Validate an array of raw JSON-LD objects (as produced by buildFaqSchema,
 * buildEntitySchema, etc.).  Each element is validated independently.
 *
 * Objects that lack a `@type` property produce a hard error.
 */
export function validatePageSchema(
  schemas: object[],
): SchemaValidationResult[] {
  return schemas.map((schema) => {
    const rec = schema as Record<string, unknown>;
    const type = rec["@type"] as SchemaEntityType | undefined;

    if (!type) {
      return {
        valid: false,
        missingFields: ["@type"],
        warnings: [],
      };
    }

    // Treat the raw object as an InlineEntitySchema for field inspection
    const asInline: InlineEntitySchema = {
      "@type": type,
      name: (rec["name"] as string) ?? "",
    };

    const required = REQUIRED_FIELDS[type] ?? [];
    const missingFields = required.filter((f) => !(f in rec) || rec[f] === undefined);

    const result = validateEntitySchema(asInline);

    return {
      ...result,
      missingFields,
    };
  });
}

/**
 * Audit a page's schema coverage:
 *  - `coverage` — fraction (0–1) of expected schema types present on the page
 *  - `missingTypes` — schema types that should be present but are absent
 *
 * @param pageType  One of the keys in PAGE_TYPE_EXPECTED_SCHEMAS (e.g. "pillar").
 * @param schemas   The JSON-LD objects currently on the page.
 */
export function auditPageForSchemaCoverage(
  pageType: string,
  schemas: object[],
): { coverage: number; missingTypes: SchemaEntityType[] } {
  const expected = PAGE_TYPE_EXPECTED_SCHEMAS[pageType] ?? [];

  if (expected.length === 0) {
    return { coverage: 1, missingTypes: [] };
  }

  if (schemas.length === 0) {
    return { coverage: 0, missingTypes: expected };
  }

  const presentTypes = new Set(
    schemas
      .map((s) => (s as Record<string, unknown>)["@type"] as SchemaEntityType | undefined)
      .filter((t): t is SchemaEntityType => t !== undefined),
  );

  const missingTypes = expected.filter((t) => !presentTypes.has(t));
  const coverage = (expected.length - missingTypes.length) / expected.length;

  return { coverage, missingTypes };
}
