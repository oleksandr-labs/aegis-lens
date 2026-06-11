import "server-only";

/**
 * OpenAPI 3.1 Schema Validation at the Edge.
 *
 * Validates request body and query parameters against JSON Schema definitions
 * embedded in the project's OpenAPI spec at `/api/openapi.json`.
 *
 * Design:
 * - Schema definitions are fetched once at server start and cached in memory.
 * - Validation uses a lightweight pure-TS JSON Schema validator (Ajv-compatible
 *   interface). No Ajv dependency is required at runtime — the types match the
 *   standard JSON Schema Draft-07/2020-12 subset used by OpenAPI 3.1.
 * - `$ref` resolution is handled by `resolveSchemaRef` using the cached spec.
 * - Errors are returned as human-readable strings; never throw from validation.
 *
 * To add a new schema:
 *   1. Add it to `docs/openapi.yaml` under `components/schemas/<Name>`.
 *   2. Rebuild `/api/openapi.json` (CI step: `npm run openapi:build`).
 *   3. Reference it as `"#/components/schemas/<Name>"` in `validateRequestBody`.
 */

// ── JSON Schema subset types (Ajv-compatible) ─────────────────────────────────

export interface JsonSchema {
  type?: string | string[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  additionalProperties?: boolean | JsonSchema;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  enum?: unknown[];
  $ref?: string;
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
  allOf?: JsonSchema[];
  nullable?: boolean;
  format?: string;
  pattern?: string;
  description?: string;
}

export interface OpenApiSpec {
  components?: {
    schemas?: Record<string, JsonSchema>;
  };
}

// ── Validation result ─────────────────────────────────────────────────────────

export interface SchemaValidationResult {
  valid: boolean;
  errors: string[];
}

const VALID: SchemaValidationResult = { valid: true, errors: [] };

function invalid(errors: string[]): SchemaValidationResult {
  return { valid: false, errors };
}

// ── Spec cache ────────────────────────────────────────────────────────────────

let cachedSpec: OpenApiSpec | null = null;

async function loadSpec(): Promise<OpenApiSpec> {
  if (cachedSpec) return cachedSpec;

  const specUrl = process.env.OPENAPI_SPEC_URL ?? "/api/openapi.json";
  try {
    const res = await fetch(specUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    cachedSpec = (await res.json()) as OpenApiSpec;
    return cachedSpec;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[schema-validation] Could not load OpenAPI spec from ${specUrl}: ${msg}`);
    // Return an empty spec so that validation falls back to "valid" (fail-open)
    // rather than blocking all requests when the spec is unavailable.
    return {};
  }
}

/** Invalidate the in-memory spec cache (useful in tests). */
export function resetSpecCache(): void {
  cachedSpec = null;
}

// ── $ref resolution ───────────────────────────────────────────────────────────

function resolveSchemaRef(
  ref: string,
  spec: OpenApiSpec,
): JsonSchema | null {
  // Only support local component refs: "#/components/schemas/<Name>"
  const match = ref.match(/^#\/components\/schemas\/(.+)$/);
  if (!match) return null;
  return spec.components?.schemas?.[match[1]] ?? null;
}

function resolveSchema(schema: JsonSchema, spec: OpenApiSpec): JsonSchema {
  if (schema.$ref) {
    return resolveSchemaRef(schema.$ref, spec) ?? schema;
  }
  return schema;
}

// ── Core validator ────────────────────────────────────────────────────────────

function validateValue(
  value: unknown,
  schema: JsonSchema,
  spec: OpenApiSpec,
  path: string,
): string[] {
  const resolved = resolveSchema(schema, spec);
  const errors: string[] = [];

  // Handle null / nullable
  if (value === null || value === undefined) {
    if (resolved.nullable) return [];
    if (
      Array.isArray(resolved.type)
        ? resolved.type.includes("null")
        : resolved.type === "null"
    ) {
      return [];
    }
    errors.push(`${path}: required but got ${value}`);
    return errors;
  }

  // Type check
  if (resolved.type) {
    const types = Array.isArray(resolved.type) ? resolved.type : [resolved.type];
    const actualType = Array.isArray(value)
      ? "array"
      : value === null
        ? "null"
        : typeof value;
    const typeOk = types.some((t) => {
      if (t === "integer") return Number.isInteger(value);
      return t === actualType;
    });
    if (!typeOk) {
      errors.push(
        `${path}: expected type "${types.join("|")}" but got "${actualType}"`,
      );
      return errors; // no point continuing if type is wrong
    }
  }

  // String constraints
  if (typeof value === "string") {
    if (resolved.minLength !== undefined && value.length < resolved.minLength) {
      errors.push(`${path}: minLength ${resolved.minLength} (got ${value.length})`);
    }
    if (resolved.maxLength !== undefined && value.length > resolved.maxLength) {
      errors.push(`${path}: maxLength ${resolved.maxLength} (got ${value.length})`);
    }
    if (resolved.pattern && !new RegExp(resolved.pattern).test(value)) {
      errors.push(`${path}: does not match pattern /${resolved.pattern}/`);
    }
    if (resolved.enum && !resolved.enum.includes(value)) {
      errors.push(`${path}: must be one of [${resolved.enum.join(", ")}]`);
    }
  }

  // Number constraints
  if (typeof value === "number") {
    if (resolved.minimum !== undefined && value < resolved.minimum) {
      errors.push(`${path}: minimum ${resolved.minimum} (got ${value})`);
    }
    if (resolved.maximum !== undefined && value > resolved.maximum) {
      errors.push(`${path}: maximum ${resolved.maximum} (got ${value})`);
    }
  }

  // Object properties
  if (resolved.type === "object" && typeof value === "object" && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    // Required fields
    for (const req of resolved.required ?? []) {
      if (!(req in obj)) {
        errors.push(`${path}.${req}: required field missing`);
      }
    }
    // Properties
    for (const [key, propSchema] of Object.entries(resolved.properties ?? {})) {
      if (key in obj) {
        errors.push(
          ...validateValue(obj[key], propSchema, spec, `${path}.${key}`),
        );
      }
    }
  }

  // Array items
  if (resolved.type === "array" && Array.isArray(value) && resolved.items) {
    value.forEach((item, idx) => {
      errors.push(
        ...validateValue(item, resolved.items!, spec, `${path}[${idx}]`),
      );
    });
  }

  // anyOf / oneOf (simplified: pass if any branch validates without errors)
  const composites = resolved.anyOf ?? resolved.oneOf;
  if (composites) {
    const branchResults = composites.map((branch) =>
      validateValue(value, branch, spec, path),
    );
    const anyPassed = branchResults.some((e) => e.length === 0);
    if (!anyPassed) {
      errors.push(
        `${path}: does not match any of the allowed schemas`,
      );
    }
  }

  return errors;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Validate a parsed request body against an OpenAPI component schema.
 *
 * @param body       Parsed JSON body (already deserialized).
 * @param schemaRef  JSON Schema `$ref`, e.g. "#/components/schemas/CreateEventRequest".
 */
export async function validateRequestBody(
  body: unknown,
  schemaRef: string,
): Promise<SchemaValidationResult> {
  const spec = await loadSpec();
  const schema = resolveSchemaRef(schemaRef, spec);
  if (!schema) {
    // Unknown ref — fail-open so a missing schema doesn't block production.
    console.warn(`[schema-validation] Unknown schema ref: ${schemaRef}`);
    return VALID;
  }
  const errors = validateValue(body, schema, spec, "body");
  return errors.length === 0 ? VALID : invalid(errors);
}

/**
 * Validate URL query parameters (all values are strings from the URL) against
 * an OpenAPI component schema. Query params are coerced to their declared types
 * before validation (string "42" → number 42 if schema type is "number").
 *
 * @param params    Key-value map from `request.nextUrl.searchParams`.
 * @param schemaRef JSON Schema `$ref`, e.g. "#/components/schemas/SearchQuery".
 */
export async function validateQueryParams(
  params: Record<string, string>,
  schemaRef: string,
): Promise<SchemaValidationResult> {
  const spec = await loadSpec();
  const schema = resolveSchemaRef(schemaRef, spec);
  if (!schema) {
    console.warn(`[schema-validation] Unknown schema ref: ${schemaRef}`);
    return VALID;
  }

  // Coerce string values to declared types.
  const coerced: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(params)) {
    const propSchema = schema.properties?.[key];
    if (!propSchema) {
      coerced[key] = raw;
      continue;
    }
    const types = Array.isArray(propSchema.type)
      ? propSchema.type
      : propSchema.type
        ? [propSchema.type]
        : [];
    if (types.includes("number") || types.includes("integer")) {
      const n = Number(raw);
      coerced[key] = isNaN(n) ? raw : n;
    } else if (types.includes("boolean")) {
      coerced[key] = raw === "true" ? true : raw === "false" ? false : raw;
    } else {
      coerced[key] = raw;
    }
  }

  const errors = validateValue(coerced, schema, spec, "query");
  return errors.length === 0 ? VALID : invalid(errors);
}
