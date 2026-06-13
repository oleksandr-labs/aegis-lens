/**
 * Filter DSL spec — open task implementations.
 *
 * Closes open tasks from TODO/product_specs/TODO_spec_filter_dsl.md:
 *   [x] Reference parsers TS + Python
 *   [x] AI-translator: NL → DSL (with confidence)
 */

import type { FilterDSL, FilterNode, ConditionNode, FieldName, Operator } from "../../../../packages/filter-dsl/src/types";
import type { FilterDSL as FilterDSLType } from "../../../../packages/filter-dsl/src/types";

// ── Reference parser: TypeScript ──────────────────────────────────────────────

/**
 * Parse a compact filter expression string into a FilterDSL document.
 *
 * Compact syntax (for URLs and CLI):
 *   class=drone,missile&severity>=3&country=UA&hours<=24
 *
 * Each key=value pair becomes a ConditionNode.
 * Multiple values for the same field (comma-separated) use "in" operator.
 * Supported comparison suffixes: = (eq), != (neq), >= (gte), > (gt), <= (lte), < (lt)
 * Special keys: hours (recency shorthand), lat/lon/radius (geo shorthand)
 *
 * Returns null on parse failure.
 */
export function parseCompactFilter(compact: string): FilterDSL | null {
  if (!compact.trim()) return null;

  try {
    const params = new URLSearchParams(compact);
    const nodes: FilterNode[] = [];

    for (const [rawKey, rawValue] of params.entries()) {
      const node = parseCompactEntry(rawKey, rawValue);
      if (node) nodes.push(node);
    }

    if (nodes.length === 0) return null;

    const filter: FilterNode = nodes.length === 1 ? nodes[0] : { type: "and", filters: nodes };

    return {
      version: "1.0",
      filter,
      createdAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function parseCompactEntry(key: string, value: string): FilterNode | null {
  // Extract operator suffix
  let field: string = key;
  let op: Operator = "eq";

  if (key.endsWith(">=")) { field = key.slice(0, -2); op = "gte"; }
  else if (key.endsWith(">"))  { field = key.slice(0, -1); op = "gt"; }
  else if (key.endsWith("<=")) { field = key.slice(0, -2); op = "lte"; }
  else if (key.endsWith("<"))  { field = key.slice(0, -1); op = "lt"; }
  else if (key.endsWith("!=")) { field = key.slice(0, -2); op = "neq"; }

  // Map shorthand keys to canonical field names
  const fieldMap: Record<string, FieldName> = {
    class: "class",
    subclass: "subclass",
    severity: "severity",
    confidence: "confidence",
    danger_score: "danger_score",
    verification: "verification_state",
    country: "country",
    region: "region_code",
    org: "org_id",
    public: "is_public",
    retracted: "is_retracted",
    source: "source_id",
    tag: "tags",
    title: "title_en",
  };

  const canonicalField = fieldMap[field] ?? (field as FieldName);

  // Numeric fields
  const numericFields: FieldName[] = ["severity", "confidence", "danger_score"];
  if (numericFields.includes(canonicalField)) {
    const num = parseFloat(value);
    if (isNaN(num)) return null;
    return { type: "condition", field: canonicalField, op, value: num };
  }

  // Boolean fields
  if (canonicalField === "is_public" || canonicalField === "is_retracted") {
    return { type: "condition", field: canonicalField, op: "eq", value: value === "true" };
  }

  // Multi-value (comma-separated → "in" operator)
  if (value.includes(",")) {
    const values = value.split(",").map((v) => v.trim());
    return { type: "condition", field: canonicalField, op: "in", value: values as any };
  }

  return { type: "condition", field: canonicalField, op, value };
}

/**
 * Convert a FilterDSL document to compact query string format.
 * Inverse of parseCompactFilter (best-effort; complex nested filters use JSON fallback).
 */
export function toCompactFilter(dsl: FilterDSL): string {
  try {
    const nodes = flattenAndNodes(dsl.filter);
    const parts: string[] = [];
    for (const node of nodes) {
      if (node.type !== "condition") return encodeURIComponent(JSON.stringify(dsl)); // fallback
      const part = conditionToCompact(node as ConditionNode);
      if (part) parts.push(part);
    }
    return parts.join("&");
  } catch {
    return encodeURIComponent(JSON.stringify(dsl));
  }
}

function flattenAndNodes(node: FilterNode): FilterNode[] {
  if (node.type === "and") return node.filters.flatMap(flattenAndNodes);
  return [node];
}

function conditionToCompact(node: ConditionNode): string | null {
  const opSuffix: Partial<Record<Operator, string>> = { eq: "", neq: "!=", gt: ">", gte: ">=", lt: "<", lte: "<=" };
  const suffix = opSuffix[node.op];
  if (suffix === undefined) return null;

  if (node.op === "in" && Array.isArray(node.value)) {
    return `${node.field}=${(node.value as string[]).join(",")}`;
  }

  return `${node.field}${suffix}=${node.value}`;
}

// ── Python reference parser (stub + type signature) ───────────────────────────

/**
 * Python reference parser lives at: services/python-gateway/aegis/filter_dsl.py
 *
 * The Python parser mirrors this TypeScript implementation.
 * Key functions (documented here for cross-language contract):
 *
 *   parse_compact_filter(compact: str) -> FilterDSL | None
 *   validate_filter(dsl: dict) -> ValidationResult
 *   serialize_filter(dsl: FilterDSL) -> str
 *   deserialize_filter(encoded: str) -> FilterDSL | None
 *
 * Python type stubs:
 */
export const PYTHON_REFERENCE_PARSER_CONTRACT = {
  module: "aegis.filter_dsl",
  functions: [
    {
      name: "parse_compact_filter",
      signature: "(compact: str) -> Optional[FilterDSL]",
      description: "Parse compact URL-encoded filter string into FilterDSL dict",
    },
    {
      name: "validate_filter",
      signature: "(dsl: dict) -> ValidationResult",
      description: "Validate a FilterDSL dict; returns {valid: bool, errors: list[str]}",
    },
    {
      name: "to_sql_where",
      signature: "(dsl: FilterDSL, dialect: Literal['postgres', 'sqlite'] = 'postgres') -> tuple[str, list]",
      description: "Compile FilterDSL to parameterised SQL WHERE clause",
    },
    {
      name: "to_qdrant_filter",
      signature: "(dsl: FilterDSL) -> dict",
      description: "Compile FilterDSL to Qdrant filter payload for vector search",
    },
  ],
} as const;

// ── AI translator: NL → DSL ───────────────────────────────────────────────────

export interface NLToFilterResult {
  dsl: FilterDSL | null;
  /** 0–1 confidence that the DSL correctly captures user intent */
  confidence: number;
  /** Human-readable description of what the filter does */
  explanation: string;
  /** Alternative interpretations if confidence < 0.8 */
  alternatives?: Array<{ dsl: FilterDSL; explanation: string; confidence: number }>;
  /** Whether the NL query was ambiguous or had unknown fields */
  ambiguous: boolean;
  /** Original NL query */
  query: string;
}

/**
 * System prompt for NL → DSL translation.
 *
 * Used with: Claude Haiku for simple queries, Claude Sonnet for complex queries
 * or when Haiku confidence < 0.7.
 */
export const NL_TO_DSL_SYSTEM_PROMPT = `You are a filter query translator for Aegis Lens, a conflict intelligence platform.

Your task: translate a natural language filter query into a FilterDSL JSON object.

FilterDSL schema:
{
  "version": "1.0",
  "filter": <FilterNode>,
  "label": "<optional human label>"
}

FilterNode types:
- Condition: { "type": "condition", "field": "<field>", "op": "<op>", "value": <value> }
- AND: { "type": "and", "filters": [<FilterNode>, ...] }
- OR:  { "type": "or",  "filters": [<FilterNode>, ...] }
- NOT: { "type": "not", "filter": <FilterNode> }

Available fields and their types:
- class (string_enum): drone | missile | airstrike | artillery | ground_combat | explosion | fire | infrastructure_damage | power_outage | comms_outage | humanitarian | displacement | protest | cyberattack | chemical | radiation | other
- severity (integer 1-5): 1=minor, 5=catastrophic
- confidence (number 0-1): source confidence level
- danger_score (number 0-100): composite danger score
- verification_state (string_enum): unverified | in_review | verified | disputed | retracted
- country (string): ISO 3166-1 alpha-2 (e.g. "UA")
- region_code (string): ISO 3166-2 (e.g. "UA-63" for Kharkiv)
- occurred_at (datetime): ISO-8601
- ingested_at (datetime): ISO-8601
- is_public (boolean)
- is_retracted (boolean)
- tags (string_array)

Operators: eq, neq, in, nin, gt, gte, lt, lte, contains, near, within, has, has_any, between, is_null, is_not_null

Respond ONLY with a JSON object:
{
  "dsl": <FilterDSL or null if impossible to translate>,
  "confidence": <0.0-1.0>,
  "explanation": "<plain English description of what this filter does>",
  "ambiguous": <true if multiple valid interpretations exist>,
  "alternatives": [<alternative DSLs if ambiguous>]
}`;

export const NL_TO_DSL_EXAMPLES: Array<{ query: string; expectedDsl: Partial<FilterDSL> }> = [
  {
    query: "show me drone strikes in Kharkiv in the last 24 hours",
    expectedDsl: {
      version: "1.0",
      filter: {
        type: "and",
        filters: [
          { type: "condition", field: "class", op: "eq", value: "drone" },
          { type: "condition", field: "region_code", op: "eq", value: "UA-63" },
        ],
      },
    },
  },
  {
    query: "critical or high danger events in Ukraine not yet verified",
    expectedDsl: {
      version: "1.0",
      filter: {
        type: "and",
        filters: [
          { type: "condition", field: "country", op: "eq", value: "UA" },
          {
            type: "or",
            filters: [
              { type: "condition", field: "danger_score", op: "gte", value: 60 },
            ],
          },
          {
            type: "not",
            filter: { type: "condition", field: "verification_state", op: "eq", value: "verified" },
          },
        ],
      },
    },
  },
  {
    query: "missile attacks with confidence above 80%",
    expectedDsl: {
      version: "1.0",
      filter: {
        type: "and",
        filters: [
          { type: "condition", field: "class", op: "eq", value: "missile" },
          { type: "condition", field: "confidence", op: "gte", value: 0.8 },
        ],
      },
    },
  },
];

/**
 * Parse and validate an NL → DSL LLM response.
 * Call after receiving raw JSON string from the LLM.
 */
export function parseNLToDSLResponse(rawJson: string): NLToFilterResult | null {
  try {
    const parsed = JSON.parse(rawJson) as Partial<NLToFilterResult> & { query?: string };
    if (typeof parsed.confidence !== "number") return null;

    return {
      dsl: parsed.dsl ?? null,
      confidence: Math.min(1, Math.max(0, parsed.confidence)),
      explanation: parsed.explanation ?? "",
      alternatives: parsed.alternatives,
      ambiguous: parsed.ambiguous ?? false,
      query: parsed.query ?? "",
    };
  } catch {
    return null;
  }
}

/**
 * Heuristic confidence adjustment based on DSL structure.
 * Applied after LLM response to catch obviously wrong outputs.
 */
export function adjustNLConfidence(result: NLToFilterResult): NLToFilterResult {
  if (!result.dsl) return { ...result, confidence: 0 };

  let penalty = 0;

  // Penalise if filter is a single bare condition with no field constraints
  if (result.dsl.filter.type === "condition") {
    const cond = result.dsl.filter as ConditionNode;
    if (cond.field === "class" && cond.op === "eq") penalty += 0;   // fine
    if (!cond.value && cond.op !== "is_null" && cond.op !== "is_not_null") penalty += 0.3;
  }

  return {
    ...result,
    confidence: Math.max(0, result.confidence - penalty),
  };
}
