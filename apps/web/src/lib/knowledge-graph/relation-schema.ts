/**
 * Relation schema: valid predicates per entity type, temporal predicates,
 * and relation validation.
 */

import type { Entity, EntityId, EntityType, Relation, RelationPredicate } from "./types";

// ── Valid predicates per subject type ─────────────────────────────────────

/**
 * Whitelist of predicates that make semantic sense for each subject
 * EntityType. The validator rejects any predicate not in this map.
 */
export const VALID_PREDICATES_BY_SUBJECT: Record<EntityType, RelationPredicate[]> = {
  military_unit: [
    "partOf",
    "locatedIn",
    "equippedWith",
    "commandedBy",
    "participated_in",
    "opposedBy",
    "sameAs",
    "relatedTo",
  ],
  equipment: [
    "manufacturedBy",
    "partOf",
    "relatedTo",
    "sameAs",
  ],
  region: [
    "partOf",
    "locatedIn",
    "sameAs",
    "relatedTo",
  ],
  organization: [
    "partOf",
    "locatedIn",
    "relatedTo",
    "sameAs",
    "opposedBy",
  ],
  person: [
    "commandedBy",
    "partOf",
    "relatedTo",
    "sameAs",
  ],
  conflict: [
    "locatedIn",
    "participated_in",
    "relatedTo",
    "sameAs",
    "opposedBy",
  ],
  incident: [
    "locatedIn",
    "participated_in",
    "destroyed_at",
    "relatedTo",
    "sameAs",
  ],
  weapon: [
    "manufacturedBy",
    "equippedWith",
    "relatedTo",
    "sameAs",
    "destroyed_at",
  ],
  location: [
    "partOf",
    "locatedIn",
    "relatedTo",
    "sameAs",
  ],
  country: [
    "relatedTo",
    "sameAs",
    "opposedBy",
  ],
};

// ── Temporal predicates ───────────────────────────────────────────────────

/**
 * Predicates where `validFrom` / `validUntil` carry substantive meaning
 * (e.g. a unit participated in a conflict during a bounded time window).
 */
export const TEMPORAL_PREDICATES: RelationPredicate[] = [
  "participated_in",
  "destroyed_at",
];

// ── Validation ────────────────────────────────────────────────────────────

/**
 * Validate a (possibly partial) Relation.
 *
 * Checks:
 *   1. Required fields present (subject, predicate, object, confidence, sources)
 *   2. Predicate is valid for the subject entity's type
 *   3. Subject and object entities exist in the provided map
 *   4. confidence is in [0, 1]
 *   5. Temporal fields are valid ISO-8601 strings when present
 */
export function validateRelation(
  relation: Partial<Relation>,
  entities: Map<EntityId, Entity>,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // ── required fields ──
  if (!relation.subject) errors.push("Missing required field: subject");
  if (!relation.predicate) errors.push("Missing required field: predicate");
  if (!relation.object) errors.push("Missing required field: object");
  if (relation.confidence === undefined || relation.confidence === null) {
    errors.push("Missing required field: confidence");
  }
  if (!relation.sources || relation.sources.length === 0) {
    errors.push("sources must be a non-empty array");
  }

  // Early exit if structural fields are missing
  if (errors.length > 0) return { valid: false, errors };

  // ── subject entity must exist ──
  const subjectEntity = entities.get(relation.subject as EntityId);
  if (!subjectEntity) {
    errors.push(`Subject entity not found: ${relation.subject}`);
  }

  // ── object entity must exist ──
  const objectEntity = entities.get(relation.object as EntityId);
  if (!objectEntity) {
    errors.push(`Object entity not found: ${relation.object}`);
  }

  // ── predicate must be valid for subject type ──
  if (subjectEntity && relation.predicate) {
    const allowed = VALID_PREDICATES_BY_SUBJECT[subjectEntity.type];
    if (!allowed.includes(relation.predicate)) {
      errors.push(
        `Predicate "${relation.predicate}" is not valid for subject type "${subjectEntity.type}". ` +
          `Allowed: ${allowed.join(", ")}`,
      );
    }
  }

  // ── confidence range ──
  if (
    typeof relation.confidence === "number" &&
    (relation.confidence < 0 || relation.confidence > 1)
  ) {
    errors.push("confidence must be between 0 and 1");
  }

  // ── temporal fields ──
  const isoPattern = /^\d{4}-\d{2}-\d{2}(T[\d:.Z+-]+)?$/;
  if (relation.validFrom !== undefined && !isoPattern.test(relation.validFrom)) {
    errors.push(`validFrom must be an ISO-8601 date string, got: "${relation.validFrom}"`);
  }
  if (relation.validUntil !== undefined && !isoPattern.test(relation.validUntil)) {
    errors.push(`validUntil must be an ISO-8601 date string, got: "${relation.validUntil}"`);
  }
  if (relation.retractedAt !== undefined && !isoPattern.test(relation.retractedAt)) {
    errors.push(`retractedAt must be an ISO-8601 date string, got: "${relation.retractedAt}"`);
  }

  // ── validFrom must be before validUntil if both present ──
  if (relation.validFrom && relation.validUntil) {
    if (new Date(relation.validFrom) > new Date(relation.validUntil)) {
      errors.push("validFrom must not be after validUntil");
    }
  }

  return { valid: errors.length === 0, errors };
}
