/**
 * Per-region outage schedule widget model.
 *
 * Produces a serialisable, localized view-model for a per-region schedule:
 * each group's OFF/ON blocks plus a compact "now" status. The web API route
 * (apps/web/src/app/api/integrations/ukrenergo/route.ts) returns this shape;
 * the front-end renders it as a timetable widget.
 *
 * Pure, no I/O. Locale strings provided for uk/ru/en.
 */

import type {
  RegionSchedule,
  Locale,
  LocalizedText,
} from "./types";
import { getProvider } from "./oblenergo-registry";
import { parseHHMM } from "./schedule-parser";
import { classifyOutage } from "./classify-outage";

const KYIV_OFFSET_HOURS = 3;

function localMinutesNow(now: Date): number {
  const d = new Date(now.getTime() + KYIV_OFFSET_HOURS * 3600_000);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

export interface WidgetBlock {
  from: string;
  to: string;
  off: boolean;
  /** True if this block contains the current local time. */
  current: boolean;
}

export interface WidgetGroup {
  group: string;
  blocks: WidgetBlock[];
  /** Status of this group right now. */
  nowOff: boolean;
  /** Local "HH:MM" the current state changes, if known. */
  changesAt: string | null;
}

export interface ScheduleWidget {
  regionCode: string;
  providerName: LocalizedText;
  date: string;
  publishedAt: string;
  kind: string;
  kindLabel: LocalizedText;
  predictable: boolean;
  groups: WidgetGroup[];
  sourceUrl?: string;
  /** Headline status sentence. */
  headline: LocalizedText;
}

const KIND_LABEL: Record<string, LocalizedText> = {
  scheduled: { uk: "Погодинні відключення", ru: "Почасовые отключения", en: "Scheduled outages" },
  stabilization: { uk: "Стабілізаційні відключення", ru: "Стабилизационные отключения", en: "Stabilization outages" },
  emergency: { uk: "Аварійні відключення", ru: "Аварийные отключения", en: "Emergency outages" },
  restored: { uk: "Світло відновлено", ru: "Свет восстановлен", en: "Power restored" },
  unknown: { uk: "Статус уточнюється", ru: "Статус уточняется", en: "Status pending" },
};

export function buildScheduleWidget(schedule: RegionSchedule, now: Date = new Date()): ScheduleWidget {
  const nowMin = localMinutesNow(now);
  const provider = getProvider(schedule.regionCode);
  const cls = classifyOutage(schedule);

  const groups: WidgetGroup[] = schedule.groups.map((g) => {
    let nowOff = false;
    let changesAt: string | null = null;
    const blocks: WidgetBlock[] = g.blocks.map((b) => {
      const from = parseHHMM(b.from) ?? 0;
      const to = parseHHMM(b.to) ?? 1440;
      const current = nowMin >= from && nowMin < to;
      if (current) {
        nowOff = b.off;
        changesAt = b.to;
      }
      return { from: b.from, to: b.to, off: b.off, current };
    });
    return { group: g.group, blocks, nowOff, changesAt };
  });

  const offCount = groups.filter((g) => g.nowOff).length;
  const headline: LocalizedText = {
    uk: groups.length
      ? `${KIND_LABEL[cls.kind].uk}: зараз без світла ${offCount} з ${groups.length} черг.`
      : `${KIND_LABEL[cls.kind].uk}.`,
    ru: groups.length
      ? `${KIND_LABEL[cls.kind].ru}: сейчас без света ${offCount} из ${groups.length} очередей.`
      : `${KIND_LABEL[cls.kind].ru}.`,
    en: groups.length
      ? `${KIND_LABEL[cls.kind].en}: ${offCount} of ${groups.length} queues currently off.`
      : `${KIND_LABEL[cls.kind].en}.`,
  };

  return {
    regionCode: schedule.regionCode,
    providerName: provider?.name ?? { uk: schedule.provider, ru: schedule.provider, en: schedule.provider },
    date: schedule.groups[0]?.date ?? schedule.publishedAt.slice(0, 10),
    publishedAt: schedule.publishedAt,
    kind: cls.kind,
    kindLabel: KIND_LABEL[cls.kind] ?? KIND_LABEL.unknown,
    predictable: cls.predictable,
    groups,
    sourceUrl: schedule.sourceUrl,
    headline,
  };
}

/** Localized pick helper for front-ends that want a single string. */
export function pick(text: LocalizedText, locale: Locale): string {
  return text[locale] ?? text.en;
}
