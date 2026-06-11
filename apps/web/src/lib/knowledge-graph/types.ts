/**
 * Core types for the Aegis Lens Knowledge Graph.
 *
 * These are pure data-shape types — no server-only imports needed.
 * Used across lib modules, API routes, and UI components.
 */

// ── Branded primitives ────────────────────────────────────────────────────

/** Opaque entity identifier (slug-based, deterministic). */
export type EntityId = string & { __brand: "EntityId" };

// ── Enumerations ──────────────────────────────────────────────────────────

export type EntityType =
  | "military_unit"
  | "equipment"
  | "region"
  | "organization"
  | "person"
  | "conflict"
  | "incident"
  | "weapon"
  | "location"
  | "country";

export type Locale = "en" | "uk" | "ru" | "pl" | "de";

export type RelationPredicate =
  | "partOf"
  | "locatedIn"
  | "equippedWith"
  | "commandedBy"
  | "participated_in"
  | "destroyed_at"
  | "manufacturedBy"
  | "sameAs"
  | "relatedTo"
  | "opposedBy";

export type HitlReviewStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "auto_approved";

// ── Core interfaces ───────────────────────────────────────────────────────

/**
 * External linked-data reference for entity deduplication.
 */
export interface SameAsRef {
  uri: string;
  source:
    | "wikidata"
    | "wikipedia"
    | "openstreetmap"
    | "geonames"
    | "dbpedia"
    | "custom";
}

/**
 * A knowledge-graph entity. All locale-specific display labels live in
 * `names`; `attributes` holds type-specific structured data.
 */
export interface Entity {
  id: EntityId;
  type: EntityType;
  /** Primary names per locale (first element = canonical). */
  names: Record<Locale, string[]>;
  /** Cross-language aliases / abbreviations. */
  aliases: string[];
  /** Latin transliterations of Cyrillic / non-Latin names. */
  transliterations?: string[];
  /** Type-specific structured data (country, branch, status, etc.). */
  attributes: Record<string, unknown>;
  /** Linked-data owl:sameAs references. */
  sameAs: SameAsRef[];
  /** Extraction / merge confidence [0–1]. */
  confidence: number;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
  /** ISO-8601 last-update timestamp. */
  updatedAt: string;
}

/**
 * A directed, typed edge in the knowledge graph.
 * `validFrom` / `validUntil` bound temporal facts.
 * `retractedAt` marks soft-deleted relations.
 */
export interface Relation {
  id: string;
  subject: EntityId;
  predicate: RelationPredicate;
  object: EntityId;
  /** Extraction / merge confidence [0–1]. */
  confidence: number;
  /** Provenance URLs or source identifiers. */
  sources: string[];
  /** ISO-8601: when this fact became true. */
  validFrom?: string;
  /** ISO-8601: when this fact ceased to be true. */
  validUntil?: string;
  /** ISO-8601: set when the relation is retracted. */
  retractedAt?: string;
}

/**
 * Human-in-the-loop proposal for a new or updated entity.
 * Must pass HITL review before entering the live graph.
 */
export interface EntityProposal {
  proposalId: string;
  /** Full entity minus the assigned id (assigned post-approval). */
  entity: Omit<Entity, "id">;
  submittedBy: string;
  reviewStatus: HitlReviewStatus;
  reviewedBy?: string;
  /** ISO-8601 timestamp of the review decision. */
  reviewedAt?: string;
}
