/**
 * GET /api/integrations/ukrenergo — per-region power-outage schedule widget.
 *
 * Surfaces Ukrenergo + oblenergo + Yasno/DTEK rotating-blackout schedules for
 * civilians. Feeds the existing `power_outages` map layer (no new layer).
 *
 * Query params:
 *   region   — ISO 3166-2:UA oblast code (e.g. "UA-30"); omit = all demo regions
 *   group    — rotation group / queue (e.g. "1.1") for a "power in my area" view
 *   view     — "schedule" (default) | "myarea" | "stats"
 *   locale   — uk | ru | en (default uk) for single-string fields
 *
 * Mirrors @ua-map/ukrenergo demo logic in-route (no cross-package import — same
 * pattern as the other /api/integrations/* routes). Cache: 5 min.
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type Locale = "uk" | "ru" | "en";
type L = Record<Locale, string>;

const KYIV_OFFSET_HOURS = 3;

// ── Demo schedules (mirror @ua-map/ukrenergo getYasnoDemoSchedules) ─────────────

interface DemoSchedule {
  regionCode: string;
  provider: L;
  kind: "scheduled" | "stabilization" | "emergency";
  /** group → OFF windows "HH:MM-HH:MM". */
  groups: Record<string, string[]>;
}

const DEMO_SCHEDULES: DemoSchedule[] = [
  {
    regionCode: "UA-30",
    provider: { uk: "ДТЕК Київські електромережі", ru: "ДТЭК Киевские электросети", en: "DTEK Kyiv Grids" },
    kind: "scheduled",
    groups: {
      "1.1": ["00:00-04:00", "08:00-12:00", "16:00-20:00"],
      "1.2": ["04:00-08:00", "12:00-16:00", "20:00-24:00"],
      "2.1": ["02:00-06:00", "10:00-14:00", "18:00-22:00"],
      "2.2": ["06:00-10:00", "14:00-18:00"],
    },
  },
  {
    regionCode: "UA-12",
    provider: { uk: "ДТЕК Дніпровські електромережі", ru: "ДТЭК Днепровские электросети", en: "DTEK Dnipro Grids" },
    kind: "stabilization",
    groups: {
      "3.1": ["00:00-04:00", "12:00-16:00"],
      "3.2": ["08:00-12:00", "20:00-24:00"],
      "4.1": ["04:00-08:00", "16:00-20:00"],
      "4.2": ["10:00-14:00"],
    },
  },
  {
    regionCode: "UA-63",
    provider: { uk: "Харківобленерго", ru: "Харьковоблэнерго", en: "Kharkivoblenergo" },
    kind: "emergency",
    groups: {}, // emergency: no per-group grid
  },
];

const KIND_LABEL: Record<string, L> = {
  scheduled: { uk: "Погодинні відключення", ru: "Почасовые отключения", en: "Scheduled outages" },
  stabilization: { uk: "Стабілізаційні відключення", ru: "Стабилизационные отключения", en: "Stabilization outages" },
  emergency: { uk: "Аварійні відключення", ru: "Аварийные отключения", en: "Emergency outages" },
};

// ── Time helpers ────────────────────────────────────────────────────────────────

function parseHHMM(s: string): number {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + (m || 0);
}
function fmt(mins: number): string {
  const c = Math.max(0, Math.min(1440, mins));
  return `${String(Math.floor(c / 60)).padStart(2, "0")}:${String(c % 60).padStart(2, "0")}`;
}
function localMinutesNow(now: Date): number {
  const d = new Date(now.getTime() + KYIV_OFFSET_HOURS * 3600_000);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

interface Block { from: string; to: string; off: boolean; current: boolean }

function offWindowsToBlocks(windows: string[], nowMin: number): Block[] {
  const ranges: Array<[number, number]> = [];
  for (const w of windows) {
    const [a, b] = w.split("-").map((x) => parseHHMM(x.trim()));
    if (b <= a) { ranges.push([a, 1440]); if (b > 0) ranges.push([0, b]); }
    else ranges.push([a, b]);
  }
  ranges.sort((x, y) => x[0] - y[0]);
  const merged: Array<[number, number]> = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([r[0], r[1]]);
  }
  const blocks: Block[] = [];
  const push = (from: number, to: number, off: boolean) =>
    blocks.push({ from: fmt(from), to: fmt(to), off, current: nowMin >= from && nowMin < to });
  let cursor = 0;
  for (const [s, e] of merged) { if (s > cursor) push(cursor, s, false); push(s, e, true); cursor = e; }
  if (cursor < 1440) push(cursor, 1440, false);
  if (blocks.length === 0) push(0, 1440, false);
  return blocks;
}

// ── View builders ───────────────────────────────────────────────────────────────

function buildWidget(sch: DemoSchedule, now: Date) {
  const nowMin = localMinutesNow(now);
  const groups = Object.entries(sch.groups).map(([group, windows]) => {
    const blocks = offWindowsToBlocks(windows, nowMin);
    const cur = blocks.find((b) => b.current);
    return { group, blocks, nowOff: Boolean(cur?.off), changesAt: cur?.to ?? null };
  });
  const offCount = groups.filter((g) => g.nowOff).length;
  return {
    regionCode: sch.regionCode,
    providerName: sch.provider,
    kind: sch.kind,
    kindLabel: KIND_LABEL[sch.kind],
    predictable: sch.kind !== "emergency",
    groups,
    headline: {
      uk: groups.length ? `${KIND_LABEL[sch.kind].uk}: без світла ${offCount} з ${groups.length} черг.` : `${KIND_LABEL[sch.kind].uk}.`,
      ru: groups.length ? `${KIND_LABEL[sch.kind].ru}: без света ${offCount} из ${groups.length} очередей.` : `${KIND_LABEL[sch.kind].ru}.`,
      en: groups.length ? `${KIND_LABEL[sch.kind].en}: ${offCount} of ${groups.length} queues off.` : `${KIND_LABEL[sch.kind].en}.`,
    },
  };
}

function buildMyArea(sch: DemoSchedule, group: string, now: Date) {
  const nowMin = localMinutesNow(now);
  const windows = sch.groups[group];
  if (sch.kind === "emergency" || !windows) {
    return {
      regionCode: sch.regionCode, group, state: sch.kind === "emergency" ? "off" : "unknown",
      kind: sch.kind,
      status: { uk: "Аварійне відключення — час повернення непередбачуваний.", ru: "Аварийное отключение — время восстановления непредсказуемо.", en: "Emergency outage — restoration time unpredictable." },
    };
  }
  const blocks = offWindowsToBlocks(windows, nowMin);
  const cur = blocks.find((b) => b.current);
  const off = Boolean(cur?.off);
  const minsToChange = cur ? Math.max(0, parseHHMM(cur.to) - nowMin) : null;
  return {
    regionCode: sch.regionCode, group, state: off ? "off" : "on", kind: sch.kind,
    changesAt: cur?.to ?? null, minutesToChange: minsToChange,
    status: off
      ? { uk: `Зараз без світла, орієнтовно ще ${minsToChange} хв.`, ru: `Сейчас без света, ещё ${minsToChange} мин.`, en: `No power, ~${minsToChange} min remaining.` }
      : { uk: "Світло є.", ru: "Свет есть.", en: "Power is on." },
  };
}

function buildStats(now: Date) {
  // Compact demo stats per region (hours OFF over the observed window).
  return [
    { regionCode: "UA-63", providerNameEn: "Kharkivoblenergo", totalOffHours: 10, longestOffHours: 6, scheduledCount: 1, emergencyCount: 1, hardshipIndex: 58 },
    { regionCode: "UA-30", providerNameEn: "DTEK Kyiv Grids", totalOffHours: 8, longestOffHours: 4, scheduledCount: 2, emergencyCount: 0, hardshipIndex: 33 },
    { regionCode: "UA-12", providerNameEn: "DTEK Dnipro Grids", totalOffHours: 11, longestOffHours: 6, scheduledCount: 1, emergencyCount: 1, hardshipIndex: 61 },
  ];
}

// ── Handler ──────────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`integrations:ukrenergo:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const region = url.searchParams.get("region");
  const group = url.searchParams.get("group");
  const view = url.searchParams.get("view") ?? "schedule";
  const now = new Date();

  let data: unknown;
  if (view === "stats") {
    data = buildStats(now);
  } else if (view === "myarea") {
    const sch = DEMO_SCHEDULES.find((s) => s.regionCode === region) ?? DEMO_SCHEDULES[0];
    data = buildMyArea(sch, group ?? Object.keys(sch.groups)[0] ?? "1", now);
  } else {
    const list = region ? DEMO_SCHEDULES.filter((s) => s.regionCode === region) : DEMO_SCHEDULES;
    data = list.map((s) => buildWidget(s, now));
  }

  return NextResponse.json(
    {
      data,
      meta: {
        view,
        feedsLayer: "power_outages",
        generatedAt: now.toISOString(),
        isDemo: true,
        note: "Demo fixture. Live source: Ukrenergo + 24 oblenergo + Yasno/DTEK. See integrations/ukrenergo/COMPLIANCE.md.",
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
