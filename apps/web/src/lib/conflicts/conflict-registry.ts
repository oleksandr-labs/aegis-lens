/**
 * Conflict Registry — central index for all Aegis Lens conflict configs.
 *
 * Import pattern:
 *   import { CONFLICT_REGISTRY, getLaunchedConflicts } from "@/lib/conflicts/conflict-registry";
 *
 * Phase gating:
 *   Phase 1 (launched day 1):  ua-ru
 *   Phase 2:                   (reserved — TBD)
 *   Phase 3 (high-risk):       israel-palestine, sudan, sahel, yemen
 *   Phase 4 (strategic APAC):  myanmar, korean-peninsula
 */

import type { ConflictConfig, ConflictId, ConflictPhase } from "./types";

import { UA_RU_CONFIG } from "./ua-ru";
import { ISRAEL_PALESTINE_CONFIG } from "./israel-palestine";
import { SUDAN_CONFIG } from "./sudan";
import { SAHEL_CONFIG } from "./sahel";
import { YEMEN_CONFIG } from "./yemen";
import { MYANMAR_CONFIG } from "./myanmar";
import { KOREAN_PENINSULA_CONFIG } from "./korean-peninsula";

// ─── Registry ─────────────────────────────────────────────────────────────────

export const CONFLICT_REGISTRY: Record<ConflictId, ConflictConfig> = {
  "ua-ru": UA_RU_CONFIG,
  "israel-palestine": ISRAEL_PALESTINE_CONFIG,
  "sudan": SUDAN_CONFIG,
  "sahel": SAHEL_CONFIG,
  "yemen": YEMEN_CONFIG,
  "myanmar": MYANMAR_CONFIG,
  "korean-peninsula": KOREAN_PENINSULA_CONFIG,
};

// ─── Accessors ────────────────────────────────────────────────────────────────

export function getConflictById(id: ConflictId): ConflictConfig | undefined {
  return CONFLICT_REGISTRY[id];
}

/**
 * Returns conflicts currently visible to end-users.
 * Phase 1 only on day 1 (ua-ru). Subsequent phases unlocked by editorial board.
 */
export function getLaunchedConflicts(): ConflictConfig[] {
  return Object.values(CONFLICT_REGISTRY).filter((c) => c.isLaunched);
}

/**
 * Returns all conflicts configured for a given phase.
 * Does NOT imply the conflict is launched; check isLaunched separately.
 */
export function getConflictsByPhase(phase: ConflictPhase): ConflictConfig[] {
  return Object.values(CONFLICT_REGISTRY).filter((c) => c.phase === phase);
}

/**
 * Returns conflicts that have passed all editorial gates (isLaunched)
 * or are in a given phase for pre-launch preparation.
 */
export function getConflictsByStatus(
  status: ConflictConfig["status"],
): ConflictConfig[] {
  return Object.values(CONFLICT_REGISTRY).filter((c) => c.status === status);
}

// ─── Global editorial principles ──────────────────────────────────────────────

/**
 * Eight global editorial principles applying to ALL conflicts on the platform.
 * These are non-negotiable and cannot be overridden by per-conflict configs.
 * Displayed publicly on the platform's editorial transparency page.
 */
export const GLOBAL_EDITORIAL_PRINCIPLES: string[] = [
  "Verified facts only: every event or claim requires corroboration from at least one Tier 1 source or two Tier 2 sources before publication.",
  "No advocacy framing: Aegis Lens does not advocate for any party to a conflict; editorial language is neutral and descriptive.",
  "Civilian protection: information that could endanger civilian populations, compromise humanitarian operations, or enable targeting is not published.",
  "Balanced source selection: each conflict config maintains an explicit source allow-list with multiple perspectives; no single actor's narrative is presented as primary truth.",
  "Neutral toponymy: place names follow internationally recognised standards or the most inclusive neutral form; contested name choices are documented and disclosed.",
  "Transparency about limitations: access restrictions, verification gaps, and data uncertainty are acknowledged prominently in published content.",
  "Harm-reduction framework: before publishing sensitive material (casualties, atrocities, displacement), the editorial team applies a harm-reduction test: does publication serve the public interest proportionally to the risk of harm?",
  "Ethics board oversight: the editorial ethics board reviews all new conflict launches, high-risk event types, and editorial policy changes; decisions are logged and reviewable.",
];

// ─── Derived metadata ─────────────────────────────────────────────────────────

/** Total conflicts configured across all phases. */
export const TOTAL_CONFLICTS = Object.keys(CONFLICT_REGISTRY).length;

/** Conflicts available for Phase 1 launch. */
export const PHASE_1_CONFLICTS = getConflictsByPhase(1);

/** Phase 3 conflicts requiring specialised review before launch. */
export const PHASE_3_HIGH_RISK = getConflictsByPhase(3);
