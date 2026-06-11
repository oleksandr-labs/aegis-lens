/**
 * Entity schema definition and validation for the Aegis Lens KG.
 *
 * KG_SCHEMA_V1 is the canonical v1 shape. validateEntity() is the
 * single gate used before any entity write to the graph.
 */

import type { Entity, EntityId, EntityType } from "./types";

// ── Schema interface ──────────────────────────────────────────────────────

export interface EntitySchema {
  version: string;
  types: EntityType[];
  /**
   * Fields that MUST be present for each entity type.
   * Keys are EntityType; values list the required Entity keys.
   */
  requiredFields: Record<EntityType, (keyof Entity)[]>;
  /**
   * Additional attribute keys that are expected (not enforced) per type.
   */
  optionalFields: Record<EntityType, string[]>;
}

// ── v1 schema constant ────────────────────────────────────────────────────

export const KG_SCHEMA_V1: EntitySchema = {
  version: "1.0.0",
  types: [
    "military_unit",
    "equipment",
    "region",
    "organization",
    "person",
    "conflict",
    "incident",
    "weapon",
    "location",
    "country",
  ],
  requiredFields: {
    military_unit:  ["id", "type", "names", "attributes"],
    equipment:      ["id", "type", "names"],
    region:         ["id", "type", "names", "attributes"],
    organization:   ["id", "type", "names"],
    person:         ["id", "type", "names"],
    conflict:       ["id", "type", "names", "attributes"],
    incident:       ["id", "type", "names"],
    weapon:         ["id", "type", "names"],
    location:       ["id", "type", "names"],
    country:        ["id", "type", "names"],
  },
  optionalFields: {
    // attributes sub-keys that are expected per type
    military_unit:  ["country", "branch", "status"],
    equipment:      ["category", "manufacturer", "country_of_origin"],
    region:         ["country", "admin_level", "centroid"],
    organization:   ["country", "founding_date", "dissolved_date"],
    person:         ["role", "affiliation"],
    conflict:       ["start_date", "parties", "theater"],
    incident:       ["date", "location", "casualties"],
    weapon:         ["category", "calibre", "country_of_origin"],
    location:       ["coordinates", "admin_area"],
    country:        ["iso_a2", "iso_a3", "capital"],
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Normalise a string into a URL-safe, deterministic slug.
 * e.g. "1st Tank Army" → "1st-tank-army"
 */
function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-{2,}/g, "-");
}

/**
 * Generate a deterministic, branded EntityId from a type + canonical name.
 *
 * Format: `<type>/<slug>`
 * Example: createEntityId("military_unit", "1st Guards Tank Army")
 *          → "military_unit/1st-guards-tank-army" as EntityId
 */
export function createEntityId(type: EntityType, name: string): EntityId {
  return `${type}/${toSlug(name)}` as EntityId;
}

// ── Validation ────────────────────────────────────────────────────────────

/**
 * Validate a (possibly partial) entity against KG_SCHEMA_V1.
 *
 * Returns { valid: true, errors: [] } on success, or
 *         { valid: false, errors: string[] } listing every violation.
 */
export function validateEntity(
  entity: Partial<Entity>,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 1. type must be present and known
  if (!entity.type) {
    errors.push("Missing required field: type");
    // Cannot check type-specific rules without knowing the type
    return { valid: false, errors };
  }

  const knownType = KG_SCHEMA_V1.types.includes(entity.type);
  if (!knownType) {
    errors.push(`Unknown entity type: "${entity.type}"`);
    return { valid: false, errors };
  }

  // 2. check all required fields for this type
  const required = KG_SCHEMA_V1.requiredFields[entity.type];
  for (const field of required) {
    const value = entity[field as keyof Entity];
    if (value === undefined || value === null) {
      errors.push(`Missing required field for ${entity.type}: ${field}`);
    }
  }

  // 3. names must be a non-empty object with at least one locale entry
  if (entity.names !== undefined) {
    const localeKeys = Object.keys(entity.names) as string[];
    if (localeKeys.length === 0) {
      errors.push("names must contain at least one locale entry");
    } else {
      for (const locale of localeKeys) {
        const labels = (entity.names as Record<string, string[]>)[locale];
        if (!Array.isArray(labels) || labels.length === 0) {
          errors.push(
            `names["${locale}"] must be a non-empty array of strings`,
          );
        }
      }
    }
  }

  // 4. confidence must be in [0, 1] if provided
  if (entity.confidence !== undefined) {
    if (
      typeof entity.confidence !== "number" ||
      entity.confidence < 0 ||
      entity.confidence > 1
    ) {
      errors.push("confidence must be a number between 0 and 1");
    }
  }

  // 5. sameAs entries must have uri + source
  if (entity.sameAs !== undefined) {
    entity.sameAs.forEach((ref, i) => {
      if (!ref.uri) errors.push(`sameAs[${i}] missing uri`);
      if (!ref.source) errors.push(`sameAs[${i}] missing source`);
    });
  }

  return { valid: errors.length === 0, errors };
}
