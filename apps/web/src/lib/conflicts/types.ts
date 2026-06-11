/**
 * Conflict Coverage Config — shared type definitions.
 *
 * Aegis Lens OSINT Platform — editorial + data layer.
 * All conflicts require editorial review before launch (see EditorialPolicy).
 *
 * Phase gating:
 *   Phase 1 — anchor: UA-RU (launched day 1)
 *   Phase 2 — expansion: additional Tier 1 OSINT regions
 *   Phase 3 — high-risk: Israel-Palestine, Sudan, Sahel, Yemen
 *   Phase 4 — strategic: Myanmar, Korean Peninsula, others
 */

// ─── Core identifiers ────────────────────────────────────────────────────────

export type ConflictId =
  | "ua-ru"
  | "israel-palestine"
  | "sudan"
  | "sahel"
  | "yemen"
  | "myanmar"
  | "korean-peninsula";

export type ConflictStatus =
  | "active"
  | "frozen"
  | "post-conflict"
  | "humanitarian-crisis";

/** Phase when this conflict becomes available on the platform. */
export type ConflictPhase = 1 | 2 | 3 | 4;

export type EditorialRisk = "low" | "medium" | "high" | "very-high";

// ─── Main config ─────────────────────────────────────────────────────────────

export interface ConflictConfig {
  id: ConflictId;
  status: ConflictStatus;
  phase: ConflictPhase;
  editorialRisk: EditorialRisk;

  name_en: string;
  name_uk: string;

  description_en: string;
  description_uk: string;

  /**
   * Bounding box: [minLon, minLat, maxLon, maxLat] (WGS-84).
   * Used for map viewport initialisation and spatial indexing.
   */
  geoBoundingBox: [number, number, number, number];

  /** ISO-3166-1 alpha-2 country codes in scope. */
  countries: string[];

  parties: Array<{
    id: string;
    name_en: string;
    classification: "state" | "non-state" | "foreign-actor";
  }>;

  /** BCP-47 locale codes for UI + content. */
  locales: string[];

  /**
   * Human-readable launch-gate checklist items.
   * All gates must be marked satisfied before isLaunched can be set to true.
   */
  launchGates: string[];

  /**
   * Whether this conflict is currently visible to end-users.
   * Controlled by editorial board; not derived from launchGates automatically.
   */
  isLaunched: boolean;
}

// ─── Sources ─────────────────────────────────────────────────────────────────

export interface ConflictSource {
  conflictId: ConflictId;
  sourceId: string;
  name_en: string;
  type: "osint" | "official" | "humanitarian" | "academic" | "media";

  /**
   * 1 = highest trust (institutionally verified, canonical).
   * 2 = reliable with corroboration required.
   * 3 = supplementary signal; multi-source corroboration required.
   */
  trustTier: 1 | 2 | 3;

  requiresVerification: boolean;

  /**
   * Source IDs that should be consulted together with this source
   * to ensure balanced / cross-verified coverage.
   */
  balancedWith?: string[];
}

// ─── Editorial policy ─────────────────────────────────────────────────────────

export interface EditorialPolicy {
  conflictId: ConflictId;

  /** How place names and toponyms are handled for this conflict. */
  toponymPolicy_en: string;

  /** Cartographic treatment of disputed territories. */
  disputedAreasPolicy_en: string;

  verificationStandard: "strict" | "standard" | "relaxed";

  /**
   * Specific protections for civilian populations in editorial output.
   * E.g. "No real-time shelter locations published."
   */
  civilianProtections: string[];

  /**
   * Narrative frames explicitly prohibited in published content.
   * E.g. "civil war framing for Russia-Ukraine conflict."
   */
  prohibitedFramings: string[];

  /**
   * External advisors required before content goes live.
   * Named roles (not individuals) for flexibility.
   */
  advisorsRequired: string[];

  /** Whether a specialised review board (beyond standard editorial) is required. */
  reviewBoardRequired: boolean;

  /** Whether external legal/ethical counsel review is required before launch. */
  counselReviewRequired: boolean;
}

// ─── Toponym map ──────────────────────────────────────────────────────────────

export interface ConflictToponymMap {
  conflictId: ConflictId;

  /**
   * The toponym key (lowercase, ASCII-friendly slug for indexing).
   * E.g. "kyiv", "west-bank".
   */
  toponym: string;

  /** The preferred editorial form in English output. */
  preferredForm_en: string;

  /**
   * Alternative spellings / forms found in source material.
   * The platform normalises these to preferredForm_en.
   */
  alternatives: string[];

  /** Short rationale explaining why this form is preferred. */
  rationale_en: string;
}
