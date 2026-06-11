/**
 * Roadmap phase configuration types.
 *
 * Covers all phases from TODO/product/TODO_roadmap.md.
 * Used by PRODUCT_ROADMAP in product-phases.ts.
 */

// ── Phase identifiers ────────────────────────────────────────────────────────

export type RoadmapPhaseId =
  | "phase-1-mvp"
  | "phase-2-depth"
  | "phase-3-enterprise"
  | "phase-4-global";

// ── Item status ───────────────────────────────────────────────────────────────

export type RoadmapItemStatus = "done" | "in-progress" | "planned" | "deferred";

// ── Item ──────────────────────────────────────────────────────────────────────

export interface RoadmapItem {
  /** Unique slug identifier for the item */
  id: string;
  /** Short description in English */
  description_en: string;
  /** Short description in Ukrainian */
  description_uk: string;
  /** Current delivery status */
  status: RoadmapItemStatus;
  /** Reference to the sprint that delivered or is delivering this item */
  sprintRef?: string;
  /** IDs of items that must be done first */
  dependencies: string[];
}

// ── Phase ─────────────────────────────────────────────────────────────────────

export interface RoadmapPhase {
  /** Unique phase identifier */
  id: RoadmapPhaseId;
  /** Phase name in English */
  name_en: string;
  /** Phase name in Ukrainian */
  name_uk: string;
  /** One-line theme in English */
  theme_en: string;
  /** One-line theme in Ukrainian */
  theme_uk: string;
  /** Target duration in weeks; null means open-ended */
  targetWeeks: number | null;
  /** All items in this phase */
  items: RoadmapItem[];
}
