/**
 * Map Oryx entries → Knowledge-Graph equipment Entity records.
 *
 * The platform's KG models real-world things ("entities") that pages and the
 * graph hang off of — here, an *equipment model* (e.g. "T-72B3"). Many Oryx
 * loss entries collapse onto a single equipment Entity; this module produces
 * the canonical Entity plus a per-entity loss rollup, preserving every Oryx
 * evidence URL as a source (Task 6).
 *
 * The repo has no exported KG `Entity` interface package yet, so we define a
 * minimal, additive `OryxEquipmentEntity` shape that mirrors the conventions
 * used elsewhere (slug + localized name/description + sources), ready to be
 * adapted to the canonical KG type when one lands.
 */

import type { OryxEntry, OryxLossStatus, OryxSide, LocalizedName } from "./types";
import { ORYX_CATEGORY_LABELS, ORYX_SIDE_LABELS, ORYX_STATUS_LABELS } from "./types";

/** A source citation pointing at Oryx evidence (preserves provenance). */
export interface OryxEntitySource {
  /** "oryx" — the dataset. */
  provider: "oryx";
  /** Evidence photo/video URL (the visual confirmation). */
  evidenceUrl?: string;
  /** Oryx blog post the loss was listed in. */
  oryxPostUrl: string;
  /** Loss status the evidence confirms. */
  status: OryxLossStatus;
  side: OryxSide;
  date?: string;
}

/** Per-status counts. */
export type LossBreakdown = Record<OryxLossStatus, number>;

function emptyBreakdown(): LossBreakdown {
  return { destroyed: 0, damaged: 0, abandoned: 0, captured: 0 };
}

/**
 * KG equipment Entity enriched with Oryx loss rollups.
 * `entityId`/`slug` join to existing equipment pages (see url-builder `equipment`).
 */
export interface OryxEquipmentEntity {
  /** KG entity id, namespaced to avoid collisions: `equipment:<slug>`. */
  entityId: string;
  /** Equipment-model slug (joins to /equipment/<slug>). */
  slug: string;
  entityType: "equipment_model";
  name: LocalizedName;
  category: { id: string; name: { en: string; uk: string } };
  /** Operating side(s) that *lost* this model in the dataset. */
  sides: OryxSide[];
  /** Total visually-confirmed losses across all statuses. */
  totalLosses: number;
  /** Loss counts split by status. */
  breakdown: LossBreakdown;
  /** All Oryx evidence sources backing this entity's losses. */
  sources: OryxEntitySource[];
  /** Human-readable, localized loss summary. */
  description: { en: string; uk: string };
  updatedAt: string;
}

/**
 * Roll a batch of Oryx entries up into one KG Entity per equipment model.
 * Entries of the same model lost by different sides are kept distinct
 * (entityId is `equipment:<side>:<slug>`), because a captured T-72 lost by
 * Russia and one lost by Ukraine are different real-world tallies.
 */
export function mapEntriesToEntities(entries: OryxEntry[]): OryxEquipmentEntity[] {
  const byKey = new Map<string, OryxEntry[]>();
  for (const e of entries) {
    const key = `${e.side}:${e.modelSlug}`;
    const list = byKey.get(key) ?? [];
    list.push(e);
    byKey.set(key, list);
  }

  const entities: OryxEquipmentEntity[] = [];
  for (const [key, group] of byKey) {
    const first = group[0];
    const breakdown = emptyBreakdown();
    const sources: OryxEntitySource[] = [];
    for (const e of group) {
      breakdown[e.status]++;
      sources.push({
        provider: "oryx",
        evidenceUrl: e.evidenceUrl, // preserve evidence URL (Task 6)
        oryxPostUrl: e.oryxPostUrl,
        status: e.status,
        side: e.side,
        date: e.date,
      });
    }
    const total = group.length;
    const catLabel = ORYX_CATEGORY_LABELS[first.category];
    const sideLabel = ORYX_SIDE_LABELS[first.side];

    entities.push({
      entityId: `equipment:${key}`,
      slug: first.modelSlug,
      entityType: "equipment_model",
      name: first.model,
      category: { id: first.category, name: catLabel },
      sides: [first.side],
      totalLosses: total,
      breakdown,
      sources,
      description: {
        en: `${first.model.en}: ${total} visually-confirmed loss${total === 1 ? "" : "es"} (${sideLabel.en}) per Oryx — ${describeBreakdown(breakdown, "en")}.`,
        uk: `${first.model.uk}: ${total} візуально підтверджена(их) втрата(и) (${sideLabel.uk}) за даними Oryx — ${describeBreakdown(breakdown, "uk")}.`,
      },
      updatedAt: new Date().toISOString(),
    });
  }
  return entities.sort((a, b) => b.totalLosses - a.totalLosses);
}

function describeBreakdown(b: LossBreakdown, locale: "en" | "uk"): string {
  const parts: string[] = [];
  (Object.keys(b) as OryxLossStatus[]).forEach((s) => {
    if (b[s] > 0) parts.push(`${b[s]} ${ORYX_STATUS_LABELS[s][locale].toLowerCase()}`);
  });
  return parts.join(", ");
}
