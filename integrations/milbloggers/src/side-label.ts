/**
 * Side-label invariant — NO FALSE EQUIVALENCE.
 *
 * The `side` field is structural and load-bearing. This module is the single
 * place that guarantees:
 *
 *   1. `side` is NEVER dropped or normalized away as a post flows through the
 *      pipeline (ingest → classify → cross-reference → review/compare).
 *   2. RU-side content ALWAYS travels with its mandatory opposition label.
 *   3. UA/INT and RU content are NOT treated as interchangeable. A RU-side
 *      claim can NEVER corroborate a UA/INT claim (and vice-versa) — opposing
 *      sides only ever *contrast*, never *confirm* each other.
 *
 * Any pipeline stage that produces a side-labelled object should pass it through
 * `assertSideLabel` so the invariant fails loudly rather than silently dropping
 * the label.
 */

import type { Side, L10nText } from "./types";

export interface SideLabelled {
  side: Side;
  oppositionLabel?: L10nText;
}

export const SIDE_LABELS: Record<Side, L10nText> = {
  ua: {
    en: "Ukrainian side",
    uk: "Українська сторона",
    ru: "Украинская сторона",
  },
  int: {
    en: "International OSINT",
    uk: "Міжнародний OSINT",
    ru: "Международный OSINT",
  },
  ru: {
    en: "Russian side (opposing narrative — analysis only)",
    uk: "Російська сторона (протилежний наратив — лише для аналізу)",
    ru: "Российская сторона (противоположный нарратив — только для анализа)",
  },
};

/** True if the two sides are opposing (so they may contrast but never corroborate). */
export function areOpposing(a: Side, b: Side): boolean {
  return (a === "ru") !== (b === "ru");
}

/** True if two sides may corroborate each other (same camp, never RU↔non-RU). */
export function mayCorroborate(a: Side, b: Side): boolean {
  return !areOpposing(a, b);
}

export class SideLabelViolation extends Error {
  constructor(message: string) {
    super(`SideLabelViolation: ${message}`);
    this.name = "SideLabelViolation";
  }
}

/**
 * Assert the side-label invariant on any object leaving a pipeline stage.
 * Throws rather than allowing an unlabelled / mislabelled object downstream.
 */
export function assertSideLabel<T extends SideLabelled>(obj: T): T {
  if (obj.side !== "ua" && obj.side !== "ru" && obj.side !== "int") {
    throw new SideLabelViolation(`side is missing or invalid: ${String((obj as SideLabelled).side)}`);
  }
  if (obj.side === "ru" && !obj.oppositionLabel) {
    throw new SideLabelViolation("RU-side object is missing its mandatory opposition label.");
  }
  if (obj.side !== "ru" && obj.oppositionLabel) {
    throw new SideLabelViolation("Non-RU object must not carry an opposition label.");
  }
  return obj;
}

/** Human-readable label pack for rendering (always includes the side label). */
export function renderSideLabel(obj: SideLabelled): { side: L10nText; opposition?: L10nText } {
  assertSideLabel(obj);
  return {
    side: SIDE_LABELS[obj.side],
    opposition: obj.side === "ru" ? obj.oppositionLabel : undefined,
  };
}
