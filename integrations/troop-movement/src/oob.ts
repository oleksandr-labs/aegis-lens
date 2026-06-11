/**
 * TASK 4 — Unit identification (PUBLICLY ATTRIBUTED order-of-battle ONLY).
 *
 * A unit may only be surfaced if it is `publiclyAttributed` AND carries at least
 * one public attribution source. This is the OOB registry + a fail-closed
 * resolver. Anything not publicly attributed resolves to `undefined`.
 */

import type { OobUnit, Side, Branch, I18nString } from "./types";

/**
 * Demo OOB registry. Names carry EN transliteration + native UK. Every entry is
 * publicly attributed (real-world, widely reported units) with public sources.
 */
export const OOB_REGISTRY: OobUnit[] = [
  {
    unitId: "ua-47-mech",
    side: "ua",
    branch: "ground",
    name: { en: "47th Separate Mechanised Brigade", uk: "47-ма окрема механізована бригада" },
    designation: { en: "47 OMBr", uk: "47 ОМБр" },
    publiclyAttributed: true,
    attributionSourceUrls: ["https://www.understandingwar.org/", "https://en.wikipedia.org/wiki/47th_Separate_Mechanized_Brigade_(Ukraine)"],
    equipmentRefs: ["equip-m2-bradley", "equip-leopard-2a6"],
  },
  {
    unitId: "ua-80-airborne",
    side: "ua",
    branch: "airborne",
    name: { en: "80th Separate Air Assault Brigade", uk: "80-та окрема десантно-штурмова бригада" },
    designation: { en: "80 ODShBr", uk: "80 ОДШБр" },
    publiclyAttributed: true,
    attributionSourceUrls: ["https://www.understandingwar.org/"],
    equipmentRefs: ["equip-bmd-2"],
  },
  {
    unitId: "ru-1-tank-army",
    side: "ru",
    branch: "armor",
    name: { en: "1st Guards Tank Army", uk: "1-ша гвардійська танкова армія" },
    designation: { en: "1 GTA", uk: "1 ГвТА" },
    publiclyAttributed: true,
    attributionSourceUrls: ["https://www.understandingwar.org/", "https://en.wikipedia.org/wiki/1st_Guards_Tank_Army"],
    equipmentRefs: ["equip-t-90m", "equip-t-80bvm"],
  },
  {
    unitId: "ru-76-vdv",
    side: "ru",
    branch: "airborne",
    name: { en: "76th Guards Air Assault Division", uk: "76-та гвардійська десантно-штурмова дивізія" },
    designation: { en: "76 DShD", uk: "76 ДШД" },
    publiclyAttributed: true,
    attributionSourceUrls: ["https://www.understandingwar.org/"],
    equipmentRefs: ["equip-bmd-4m"],
  },
];

const REGISTRY_INDEX: Map<string, OobUnit> = new Map(OOB_REGISTRY.map((u) => [u.unitId, u]));

/**
 * Guard: a unit is usable only if it is publicly attributed AND has ≥1 public
 * attribution source. Fail-closed.
 */
export function isPubliclyAttributed(unit: OobUnit | undefined): unit is OobUnit {
  return (
    !!unit &&
    unit.publiclyAttributed === true &&
    Array.isArray(unit.attributionSourceUrls) &&
    unit.attributionSourceUrls.length > 0
  );
}

/**
 * Resolve a unitId to an OOB unit — but ONLY if publicly attributed. Returns
 * `undefined` for unknown or non-attributed units (never leaks them).
 */
export function resolveUnit(unitId: string | undefined): OobUnit | undefined {
  if (!unitId) return undefined;
  const unit = REGISTRY_INDEX.get(unitId);
  return isPubliclyAttributed(unit) ? unit : undefined;
}

/** List only publicly-attributed units, optionally filtered by side/branch. */
export function listUnits(filter: { side?: Side; branch?: Branch } = {}): OobUnit[] {
  return OOB_REGISTRY.filter(
    (u) =>
      isPubliclyAttributed(u) &&
      (!filter.side || u.side === filter.side) &&
      (!filter.branch || u.branch === filter.branch),
  );
}

/** Public-facing name (EN transliteration + UK) for a resolved unit. */
export function unitDisplayName(unitId: string): I18nString | undefined {
  return resolveUnit(unitId)?.name;
}
