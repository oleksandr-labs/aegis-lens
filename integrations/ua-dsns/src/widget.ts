/**
 * Per-oblast DSNS feed widget model.
 *
 * Produces a compact, render-ready view-model for a sidebar / popup widget that
 * shows the latest DSNS emergency events for a chosen oblast (or nationwide),
 * grouped by emergency type, with plain-language civilian guidance attached.
 * This is a pure data shaper — the React/HTML rendering lives in apps/web.
 */

import type { DsnsEmergencyEvent, EmergencyType, OblastCode } from "./types";
import { EMERGENCY_TYPE_META } from "./types";
import { OBLASTS } from "./oblast-branches";
import { buildGuidance, type CivilianGuidance } from "./civilian-guidance";

export interface WidgetItem {
  eventId: string;
  type: EmergencyType;
  typeLabel: { en: string; uk: string };
  color: string;
  title: { en: string; uk: string };
  occurredAt: string;
  /** Relative-age label for display. */
  ageLabel: { en: string; uk: string };
  placeNameUk?: string;
  severity: 1 | 2 | 3 | 4 | 5;
  sourceUrl?: string;
  evacuationOrdered: boolean;
  guidance: CivilianGuidance;
  fireCorroborated: boolean;
}

export interface OblastFeedWidget {
  oblast?: OblastCode;
  oblastName?: { en: string; uk: string };
  generatedAt: string;
  total: number;
  countsByType: Partial<Record<EmergencyType, number>>;
  items: WidgetItem[];
}

function ageLabel(occurredAt: string, now = Date.now()): { en: string; uk: string } {
  const mins = Math.max(0, Math.round((now - Date.parse(occurredAt)) / 60_000));
  if (mins < 60) return { en: `${mins}m ago`, uk: `${mins} хв тому` };
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return { en: `${hrs}h ago`, uk: `${hrs} год тому` };
  const days = Math.round(hrs / 24);
  return { en: `${days}d ago`, uk: `${days} дн тому` };
}

/**
 * Build the widget view-model. If `oblast` is given, only that oblast's events
 * are included; otherwise all events are shown (nationwide feed).
 */
export function buildOblastFeed(
  events: DsnsEmergencyEvent[],
  opts: { oblast?: OblastCode; limit?: number; now?: number } = {},
): OblastFeedWidget {
  const now = opts.now ?? Date.now();
  const filtered = (opts.oblast ? events.filter((e) => e.oblast === opts.oblast) : events)
    .slice()
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  const limited = opts.limit ? filtered.slice(0, opts.limit) : filtered;

  const countsByType: Partial<Record<EmergencyType, number>> = {};
  for (const e of filtered) countsByType[e.type] = (countsByType[e.type] ?? 0) + 1;

  const oblastInfo = opts.oblast ? OBLASTS[opts.oblast] : undefined;

  const items: WidgetItem[] = limited.map((e) => {
    const meta = EMERGENCY_TYPE_META[e.type];
    return {
      eventId: e.eventId,
      type: e.type,
      typeLabel: { en: meta.labelEn, uk: meta.labelUk },
      color: meta.color,
      title: e.title,
      occurredAt: e.occurredAt,
      ageLabel: ageLabel(e.occurredAt, now),
      placeNameUk: e.placeNameUk,
      severity: e.severity,
      sourceUrl: e.sourceUrl,
      evacuationOrdered: !!e.evacuationOrdered,
      guidance: buildGuidance(e.type, !!e.evacuationOrdered),
      fireCorroborated: !!(e.fireXrefIds && e.fireXrefIds.length > 0),
    };
  });

  return {
    oblast: opts.oblast,
    oblastName: oblastInfo ? { en: oblastInfo.nameEn, uk: oblastInfo.nameUk } : undefined,
    generatedAt: new Date(now).toISOString(),
    total: filtered.length,
    countsByType,
    items,
  };
}
