/**
 * Per-equipment "verified losses" widget provider (Task 8).
 *
 * Feeds the equipment detail page (/equipment/<slug>) a compact, Oryx-cited
 * loss summary for a single model: totals, status breakdown, recent evidence
 * thumbnails, and an attribution line. Pure data — rendering lives in the web app.
 */

import type { OryxEntry, OryxLossStatus, OryxSide } from "./types";
import { ORYX_STATUS_LABELS, ORYX_SIDE_LABELS } from "./types";
import { oryxAttribution, ORYX_HOMEPAGE } from "./attribution";

export interface VerifiedLossEvidence {
  status: OryxLossStatus;
  side: OryxSide;
  date?: string;
  evidenceUrl?: string;
  oryxPostUrl: string;
  locationEn?: string;
  locationUk?: string;
}

export interface VerifiedLossesWidget {
  modelSlug: string;
  nameEn: string;
  nameUk: string;
  /** Side(s) that lost this model. */
  sides: OryxSide[];
  total: number;
  breakdown: Record<OryxLossStatus, number>;
  /** Most-recent evidence items (capped). */
  recentEvidence: VerifiedLossEvidence[];
  /** Localized headline, e.g. "12 visually-confirmed losses". */
  headline: { en: string; uk: string };
  /** Attribution block — Oryx must be cited wherever this is shown. */
  attribution: ReturnType<typeof oryxAttribution>;
  sourceHomepage: string;
}

const MAX_EVIDENCE = 6;

/**
 * Build the verified-losses widget payload for a single equipment model.
 * Pass all Oryx entries; this filters to the requested model slug.
 */
export function buildVerifiedLossesWidget(
  modelSlug: string,
  entries: OryxEntry[],
): VerifiedLossesWidget | null {
  const matches = entries.filter((e) => e.modelSlug === modelSlug);
  if (matches.length === 0) return null;

  const breakdown: Record<OryxLossStatus, number> = {
    destroyed: 0,
    damaged: 0,
    abandoned: 0,
    captured: 0,
  };
  const sides = new Set<OryxSide>();
  for (const e of matches) {
    breakdown[e.status]++;
    sides.add(e.side);
  }

  const recentEvidence: VerifiedLossEvidence[] = [...matches]
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
    .slice(0, MAX_EVIDENCE)
    .map((e) => ({
      status: e.status,
      side: e.side,
      date: e.date,
      evidenceUrl: e.evidenceUrl,
      oryxPostUrl: e.oryxPostUrl,
      locationEn: e.locationText?.en,
      locationUk: e.locationText?.uk,
    }));

  const first = matches[0];
  const total = matches.length;

  return {
    modelSlug,
    nameEn: first.model.en,
    nameUk: first.model.uk,
    sides: [...sides],
    total,
    breakdown,
    recentEvidence,
    headline: {
      en: `${total} visually-confirmed loss${total === 1 ? "" : "es"}`,
      uk: `${total} візуально підтверджена(их) втрата(и)`,
    },
    attribution: oryxAttribution(),
    sourceHomepage: ORYX_HOMEPAGE,
  };
}

/** One-line summary string for compact placements (e.g. cards). */
export function lossSummaryLine(widget: VerifiedLossesWidget, locale: "en" | "uk"): string {
  const parts: string[] = [];
  (Object.keys(widget.breakdown) as OryxLossStatus[]).forEach((s) => {
    if (widget.breakdown[s] > 0) parts.push(`${widget.breakdown[s]} ${ORYX_STATUS_LABELS[s][locale].toLowerCase()}`);
  });
  const sideStr = widget.sides.map((s) => ORYX_SIDE_LABELS[s][locale]).join(" / ");
  return locale === "en"
    ? `${widget.total} losses (${parts.join(", ")}) — ${sideStr}`
    : `${widget.total} втрат (${parts.join(", ")}) — ${sideStr}`;
}
