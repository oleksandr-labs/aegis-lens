/**
 * TASK 6 — Cross-link to the equipment layer per unit.
 *
 * Each OOB unit may reference one or more entries in the equipment layer (e.g.
 * publicly reported vehicle types operated by the unit). This module produces
 * typed references the map/UI can use to deep-link, without embedding any
 * equipment data here (single source of truth stays in the equipment layer).
 */

import type { OobUnit, Side, I18nString } from "./types";
import { resolveUnit } from "./oob";

/** A typed reference into the equipment layer. */
export interface EquipmentLayerRef {
  /** Equipment-layer entity id (e.g. "equip-leopard-2a6"). */
  equipmentId: string;
  /** The unit this reference is attached to. */
  unitId: string;
  side: Side;
  /** Deep link into the equipment layer / API. */
  href: string;
}

/** Bilingual label for the cross-link affordance. */
export const EQUIPMENT_LINK_LABEL: I18nString = {
  en: "Equipment of this unit",
  uk: "Техніка цього підрозділу",
};

/** Base path of the equipment layer API route. */
export const EQUIPMENT_LAYER_BASE = "/api/layers/equipment";

/** Build the deep-link href for a single equipment entity. */
export function equipmentHref(equipmentId: string): string {
  return `${EQUIPMENT_LAYER_BASE}?id=${encodeURIComponent(equipmentId)}`;
}

/**
 * Resolve equipment references for a unit — but only for a PUBLICLY ATTRIBUTED
 * unit (via `resolveUnit`, which is fail-closed). Returns [] for unknown or
 * non-attributed units.
 */
export function equipmentRefsForUnit(unitId: string): EquipmentLayerRef[] {
  const unit = resolveUnit(unitId);
  if (!unit) return [];
  return (unit.equipmentRefs ?? []).map((equipmentId) => ({
    equipmentId,
    unitId: unit.unitId,
    side: unit.side,
    href: equipmentHref(equipmentId),
  }));
}

/** Convenience: dedup + merge a report's own refs with its unit's OOB refs. */
export function mergeEquipmentRefs(unitOrId: OobUnit | string, reportRefs: string[] = []): string[] {
  const unit = typeof unitOrId === "string" ? resolveUnit(unitOrId) : unitOrId;
  const fromUnit = unit?.equipmentRefs ?? [];
  return Array.from(new Set([...fromUnit, ...reportRefs]));
}
