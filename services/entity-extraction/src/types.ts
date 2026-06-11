/** Entity extraction types for the Aegis Lens knowledge graph. */

export type EntityClass =
  | "military_unit"       // e.g. "3rd Separate Assault Brigade"
  | "equipment"           // e.g. "Shahed-136", "T-72"
  | "person"              // public officials, commanders (named only)
  | "organisation"        // NGOs, ministries, companies
  | "location"            // city, region, landmark
  | "region"              // administrative region
  | "event_reference"     // reference to another event
  | "date_time"           // temporal expression
  | "quantity";           // numbers + units

export interface EntityMention {
  /** Surface form as it appears in text */
  text: string;
  /** Character offsets in source text */
  start: number;
  end: number;
  /** Canonical entity class */
  entityClass: EntityClass;
  /** Confidence 0–1 */
  confidence: number;
  /** Resolved canonical entity ID (from KG), if linked */
  canonicalId?: string;
  /** Normalised value (e.g. for dates: ISO-8601; quantities: number + unit) */
  normalised?: string;
  /** Language the mention was detected in */
  language?: string;
}

export interface ExtractionResult {
  entities: EntityMention[];
  /** Detected language of source text (BCP-47) */
  language: string;
  /** Model/engine that produced results */
  engine: string;
  processingMs: number;
}

/** A canonical entity in the knowledge graph. */
export interface KnowledgeGraphEntity {
  entityId: string;
  entityClass: EntityClass;
  canonicalName: string;
  aliases: string[];
  wikidataId?: string;    // Q-number for cross-reference
  countryCode?: string;
  /** Free-form structured attributes (depends on class) */
  attributes: Record<string, unknown>;
  confidence: number;
  /** ISO-8601 — when this entity was first seen */
  firstSeenAt: string;
  lastUpdatedAt: string;
  /** Source event IDs that mention this entity */
  mentionEventIds: string[];
}

export interface EntityLinkProposal {
  mention: EntityMention;
  /** Candidate matches from KG */
  candidates: Array<{
    entityId: string;
    canonicalName: string;
    score: number;
    isNewEntity: boolean;
  }>;
  requiresHumanReview: boolean;
}
