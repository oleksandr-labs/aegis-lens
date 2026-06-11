import { FilterDSL, FilterNode, ConditionNode, Operator } from "./types";
import { getFieldDef } from "./field-catalog";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/** Validate a complete FilterDSL document. */
export function validateFilter(dsl: unknown): ValidationResult {
  const errors: string[] = [];

  if (!dsl || typeof dsl !== "object") {
    return { valid: false, errors: ["Filter must be an object"] };
  }

  const obj = dsl as Record<string, unknown>;
  if (obj.version !== "1.0") errors.push(`Unsupported version: ${obj.version}. Expected "1.0"`);
  if (!obj.filter) errors.push("Missing required field: filter");
  else validateNode(obj.filter as FilterNode, errors, "$");

  return { valid: errors.length === 0, errors };
}

function validateNode(node: FilterNode, errors: string[], path: string): void {
  if (!node || typeof node !== "object") {
    errors.push(`${path}: expected a filter node object`);
    return;
  }

  const { type } = node;

  if (type === "and" || type === "or") {
    const combined = node as { filters: FilterNode[] };
    if (!Array.isArray(combined.filters) || combined.filters.length === 0) {
      errors.push(`${path}: "${type}" must have at least one filter`);
      return;
    }
    combined.filters.forEach((child, i) => validateNode(child, errors, `${path}.filters[${i}]`));
  } else if (type === "not") {
    const notNode = node as { filter: FilterNode };
    if (!notNode.filter) {
      errors.push(`${path}: "not" must have a filter`);
    } else {
      validateNode(notNode.filter, errors, `${path}.filter`);
    }
  } else if (type === "condition") {
    validateCondition(node as ConditionNode, errors, path);
  } else {
    errors.push(`${path}: unknown node type "${type}"`);
  }
}

function validateCondition(node: ConditionNode, errors: string[], path: string): void {
  const fieldDef = getFieldDef(node.field);
  if (!fieldDef) {
    errors.push(`${path}: unknown field "${node.field}"`);
    return;
  }

  if (!fieldDef.operators.includes(node.op as Operator)) {
    errors.push(
      `${path}: operator "${node.op}" is not valid for field "${node.field}". Valid: ${fieldDef.operators.join(", ")}`,
    );
  }

  const noValueOps: Operator[] = ["is_null", "is_not_null"];
  if (!noValueOps.includes(node.op as Operator) && node.value === undefined) {
    errors.push(`${path}: operator "${node.op}" requires a value`);
  }
}

// ── URL serialization ─────────────────────────────────────────────────────────

export function serializeFilter(dsl: FilterDSL): string {
  return encodeURIComponent(JSON.stringify(dsl));
}

export function deserializeFilter(encoded: string): FilterDSL | null {
  try {
    return JSON.parse(decodeURIComponent(encoded)) as FilterDSL;
  } catch {
    return null;
  }
}

// ── Simple builder helpers ────────────────────────────────────────────────────

import type { FieldName, ConditionValue } from "./types";

export function eq(field: FieldName, value: ConditionValue): ConditionNode {
  return { type: "condition", field, op: "eq", value };
}

export function inValues(field: FieldName, values: ConditionValue[]): ConditionNode {
  return { type: "condition", field, op: "in", value: values as any };
}

export function gt(field: FieldName, value: number): ConditionNode {
  return { type: "condition", field, op: "gt", value };
}

export function gte(field: FieldName, value: number): ConditionNode {
  return { type: "condition", field, op: "gte", value };
}

export function and(...filters: FilterNode[]): FilterNode {
  return { type: "and", filters };
}

export function or(...filters: FilterNode[]): FilterNode {
  return { type: "or", filters };
}

export function not(filter: FilterNode): FilterNode {
  return { type: "not", filter };
}

export function near(lat: number, lon: number, radiusKm: number): ConditionNode {
  return { type: "condition", field: "geom", op: "near", value: { lat, lon, radiusKm } };
}
