/**
 * "Power in my area" civilian view.
 *
 * Given a civilian's region + rotation group (and optional schedule), answer the
 * three questions that matter:
 *   1. Do I have power right now?
 *   2. If not, when does it come back?
 *   3. When is my next scheduled outage?
 *
 * Pure functions. Localized (uk/ru/en). Built on schedule-parser + eta.
 */

import type {
  RegionSchedule,
  Locale,
  LocalizedText,
  RestorationEta,
} from "./types";
import { getProvider } from "./oblenergo-registry";
import { blockAt, parseHHMM, minutesToHHMM } from "./schedule-parser";
import { classifyOutage } from "./classify-outage";
import { estimateRestoration } from "./eta";

const KYIV_OFFSET_HOURS = 3;

function localMinutesNow(now: Date): number {
  const d = new Date(now.getTime() + KYIV_OFFSET_HOURS * 3600_000);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

export type PowerState = "on" | "off" | "unknown";

export interface MyAreaView {
  regionCode: string;
  group: string | null;
  providerName: LocalizedText;
  /** Power state for this group right now. */
  state: PowerState;
  /** ETA for restoration if currently OFF. */
  restoration: RestorationEta | null;
  /** Local "HH:MM" of the next OFF block start (if currently ON). */
  nextOutageAt: string | null;
  /** Minutes until the next state change. */
  minutesToChange: number | null;
  kind: string;
  status: LocalizedText;
  /** Civilian advice line. */
  advice: LocalizedText;
  sourceUrl?: string;
}

/** Find the next OFF block start (local minutes) after `nowMin`, today only. */
function nextOffStart(schedule: RegionSchedule, group: string, nowMin: number): number | null {
  const g = schedule.groups.find((x) => x.group === group);
  if (!g) return null;
  let best: number | null = null;
  for (const b of g.blocks) {
    if (!b.off) continue;
    const from = parseHHMM(b.from) ?? 0;
    if (from > nowMin && (best == null || from < best)) best = from;
  }
  return best;
}

export function buildMyArea(
  regionCode: string,
  group: string | null,
  schedule: RegionSchedule | null,
  now: Date = new Date(),
): MyAreaView {
  const provider = getProvider(regionCode);
  const providerName = provider?.name ?? { uk: regionCode, ru: regionCode, en: regionCode };
  const nowMin = localMinutesNow(now);

  let state: PowerState = "unknown";
  let restoration: RestorationEta | null = null;
  let nextOutageAt: string | null = null;
  let minutesToChange: number | null = null;
  let kind = schedule ? classifyOutage(schedule).kind : "unknown";

  if (schedule && group) {
    const g = schedule.groups.find((x) => x.group === group);
    if (g) {
      const b = blockAt(g, nowMin);
      if (b) {
        state = b.off ? "off" : "on";
        const to = parseHHMM(b.to) ?? 1440;
        minutesToChange = Math.max(0, to - nowMin);
        if (b.off) {
          restoration = estimateRestoration(regionCode, kind, schedule, { group, now });
        } else {
          const next = nextOffStart(schedule, group, nowMin);
          nextOutageAt = next != null ? minutesToHHMM(next) : null;
          if (next != null) minutesToChange = next - nowMin;
        }
      }
    }
  } else if (schedule && kind === "emergency") {
    state = "off";
    restoration = estimateRestoration(regionCode, kind, schedule, { now });
  }

  const status = buildStatus(state, kind, minutesToChange, nextOutageAt);
  const advice = buildAdvice(state, kind);

  return {
    regionCode,
    group,
    providerName,
    state,
    restoration,
    nextOutageAt,
    minutesToChange,
    kind,
    status,
    advice,
    sourceUrl: schedule?.sourceUrl,
  };
}

function hm(mins: number | null, locale: Locale): string {
  if (mins == null) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const u = locale === "en" ? { h: "h", m: "m" } : locale === "ru" ? { h: "ч", m: "мин" } : { h: "год", m: "хв" };
  return h > 0 ? `${h}${u.h} ${m}${u.m}` : `${m}${u.m}`;
}

function buildStatus(state: PowerState, kind: string, mins: number | null, nextAt: string | null): LocalizedText {
  if (state === "off") {
    return {
      uk: `Зараз без світла${mins != null ? `, орієнтовно ще ${hm(mins, "uk")}` : ""}.`,
      ru: `Сейчас без света${mins != null ? `, ориентировочно ещё ${hm(mins, "ru")}` : ""}.`,
      en: `Currently no power${mins != null ? `, about ${hm(mins, "en")} remaining` : ""}.`,
    };
  }
  if (state === "on") {
    return {
      uk: nextAt ? `Світло є. Наступне відключення о ${nextAt}.` : "Світло є.",
      ru: nextAt ? `Свет есть. Следующее отключение в ${nextAt}.` : "Свет есть.",
      en: nextAt ? `Power is on. Next outage at ${nextAt}.` : "Power is on.",
    };
  }
  return {
    uk: "Стан електропостачання невідомий — оберіть свою чергу.",
    ru: "Состояние электроснабжения неизвестно — выберите свою очередь.",
    en: "Power state unknown — select your queue.",
  };
}

function buildAdvice(state: PowerState, kind: string): LocalizedText {
  if (state === "off" && kind === "emergency") {
    return {
      uk: "Аварійне відключення — час повернення непередбачуваний. Зарядіть пристрої за першої нагоди.",
      ru: "Аварийное отключение — время восстановления непредсказуемо. Зарядите устройства при первой возможности.",
      en: "Emergency outage — restoration time is unpredictable. Charge devices when power returns.",
    };
  }
  if (state === "off") {
    return {
      uk: "Планове відключення за графіком — світло повернеться згідно з розкладом черги.",
      ru: "Плановое отключение по графику — свет вернётся согласно расписанию очереди.",
      en: "Scheduled outage — power returns per your queue's timetable.",
    };
  }
  if (state === "on") {
    return {
      uk: "Скористайтеся часом зі світлом: зарядіть техніку, наберіть води.",
      ru: "Используйте время со светом: зарядите технику, наберите воды.",
      en: "Use the power window: charge devices, store water.",
    };
  }
  return {
    uk: "Оберіть область і чергу, щоб побачити свій графік.",
    ru: "Выберите область и очередь, чтобы увидеть свой график.",
    en: "Select your oblast and queue to see your schedule.",
  };
}

/** Localized pick helper. */
export function pickMyArea(text: LocalizedText, locale: Locale): string {
  return text[locale] ?? text.en;
}
