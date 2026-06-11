/**
 * Disputed-area display policy (TODO task: "Disputed-area display policy applied").
 *
 * Principle: DO NOT OVERCLAIM. The frontline is contested and politically sensitive.
 * This module encodes how each control state may be rendered + labelled so the map is
 * honest about uncertainty:
 *
 *   - controlled (occupied): solid fill, but labelled "occupied (per DeepStateMAP)",
 *     never "annexed"/"Russian territory" — occupation is not sovereignty.
 *   - contested: low-opacity hatched fill, NEVER coloured as either side's control;
 *     always labelled "contested / active fighting".
 *   - liberated: distinct fill, labelled "recently liberated", with a confidence note.
 *
 * Low-confidence polygons (below `LOW_CONFIDENCE`) get a reduced-opacity + dashed
 * treatment (matches the registry's "Confidence < 0.5: reduced opacity" convention).
 */

import type { ControlPolygon, ControlStatus } from "./types";

export const LOW_CONFIDENCE = 0.5;

export type RenderPattern = "solid" | "hatched" | "dashed";

export interface DisplayDirective {
  status: ControlStatus;
  /** Fill opacity 0–1. */
  fillOpacity: number;
  pattern: RenderPattern;
  /** Whether the polygon may be coloured as a controlling side. */
  attributable: boolean;
  /** Honest, non-overclaiming label. */
  label: { en: string; uk: string };
  /** Optional caveat line shown on hover/legend. */
  caveat?: { en: string; uk: string };
}

const BASE: Record<ControlStatus, Omit<DisplayDirective, "fillOpacity" | "pattern">> = {
  controlled: {
    status: "controlled",
    attributable: true,
    label: {
      en: "Occupied (per DeepStateMAP)",
      uk: "Окуповано (за DeepStateMAP)",
    },
    caveat: {
      en: "Reflects reported control, not legal status. Occupation ≠ recognized sovereignty.",
      uk: "Відображає фактичний контроль, не правовий статус. Окупація ≠ визнаний суверенітет.",
    },
  },
  contested: {
    status: "contested",
    attributable: false, // never coloured as a side
    label: {
      en: "Contested / active fighting",
      uk: "Спірна зона / активні бойові дії",
    },
    caveat: {
      en: "Control unclear and shifting. Not attributed to either side.",
      uk: "Контроль нечіткий і змінюється. Не приписується жодній зі сторін.",
    },
  },
  liberated: {
    status: "liberated",
    attributable: true,
    label: {
      en: "Recently liberated",
      uk: "Нещодавно звільнено",
    },
    caveat: {
      en: "Recently re-taken; situation may still be fluid.",
      uk: "Нещодавно відвойовано; ситуація може залишатися нестабільною.",
    },
  },
};

/** Resolve the display directive for a polygon, applying the confidence gate. */
export function displayDirective(p: Pick<ControlPolygon, "status" | "confidence">): DisplayDirective {
  const base = BASE[p.status];
  const low = p.confidence < LOW_CONFIDENCE;

  // contested is always hatched; others solid unless low-confidence → dashed.
  const pattern: RenderPattern =
    p.status === "contested" ? "hatched" : low ? "dashed" : "solid";

  // base opacity per status, reduced when low-confidence.
  const baseOpacity = p.status === "contested" ? 0.25 : p.status === "liberated" ? 0.4 : 0.5;
  const fillOpacity = low ? Math.min(baseOpacity, 0.2) : baseOpacity;

  return { ...base, pattern, fillOpacity };
}

/** Guard: returns true if a polygon may be coloured for a specific controlling side. */
export function mayAttributeToSide(p: Pick<ControlPolygon, "status">): boolean {
  return BASE[p.status].attributable;
}
