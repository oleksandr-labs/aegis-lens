/**
 * GET /api/integrations/ua-genstaff — official UA military communications feed.
 *
 * Surfaces the General Staff daily summary (structured loss tallies + frontline
 * directions + regions), with optional Air Force threat alerts. This source has
 * NO dedicated map layer; threat alerts inform the existing `air_raid_alerts`
 * layer and the daily summary feeds a dashboard widget (no map paint).
 *
 * NEUTRALITY: every figure is labelled "as officially reported" and carries a
 * source citation; the route does NOT assert independent verification.
 *
 * Query params:
 *   view  — "summary" (default) | "threats"
 *   lang  — "uk" (default) | "en" | "de"  (selects headline/summary locale)
 *
 * Runs the package in DEMO mode (no secrets in the web tier); a worker
 * deployment supplies the Telegram/Facebook tokens and persists events.
 * Cache: 120s — official feeds are low-frequency, do-not-hammer (see COMPLIANCE).
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type Lang = "uk" | "en" | "de";

// ── Demo daily summary (mirrors @ua-map/ua-genstaff post-parse) ────────────────

interface LossRow {
  category: string;
  label: { uk: string; en: string; de: string };
  total: number;
  delta?: number;
}

const DEMO_LOSSES: LossRow[] = [
  { category: "personnel",       label: { uk: "Особовий склад", en: "Personnel", de: "Personal" }, total: 720940, delta: 1180 },
  { category: "tanks",           label: { uk: "Танки", en: "Tanks", de: "Panzer" }, total: 8124, delta: 9 },
  { category: "afv",             label: { uk: "Бойові броньовані машини", en: "Armoured fighting vehicles", de: "Schützenpanzer" }, total: 15890, delta: 21 },
  { category: "artillery",       label: { uk: "Артилерійські системи", en: "Artillery systems", de: "Artilleriesysteme" }, total: 18230, delta: 38 },
  { category: "mlrs",            label: { uk: "РСЗВ", en: "MLRS", de: "Mehrfachraketenwerfer" }, total: 1242, delta: 1 },
  { category: "air_defense",     label: { uk: "Засоби ППО", en: "Air defence systems", de: "Flugabwehrsysteme" }, total: 1015, delta: 2 },
  { category: "aircraft",        label: { uk: "Літаки", en: "Aircraft", de: "Flugzeuge" }, total: 369 },
  { category: "helicopters",     label: { uk: "Гелікоптери", en: "Helicopters", de: "Hubschrauber" }, total: 331 },
  { category: "uav",             label: { uk: "БПЛА оперативно-тактичні", en: "Operational-tactical UAVs", de: "Drohnen" }, total: 12480, delta: 74 },
  { category: "cruise_missiles", label: { uk: "Крилаті ракети", en: "Cruise missiles", de: "Marschflugkörper" }, total: 2810, delta: 0 },
];

const DEMO_DIRECTIONS = [
  { directionUk: "Покровський напрямок", directionEn: "Pokrovsk direction", engagements: 41, oblast: "UA-14" },
  { directionUk: "Купʼянський напрямок", directionEn: "Kupiansk direction", engagements: 12, oblast: "UA-63" },
];

const DEMO_REGIONS = [
  { oblast: "UA-14", name: { uk: "Донецька", en: "Donetsk" } },
  { oblast: "UA-63", name: { uk: "Харківська", en: "Kharkiv" } },
];

const ATTRIBUTION = {
  uk: "Джерело: Генеральний штаб ЗСУ (офіційні дані, наведені без редагування)",
  en: "Source: General Staff of the AFU (figures as officially reported)",
  de: "Quelle: Generalstab der Streitkräfte der Ukraine (offiziell gemeldete Zahlen)",
};

// ── Demo Air Force threat alerts (inform air_raid_alerts layer) ────────────────

const DEMO_THREATS = [
  {
    id: "air_force_tg:demo-1",
    vector: "ballistic",
    oblasts: ["UA-63"],
    titleUk: "Загроза балістики",
    issuedAt: new Date(Date.now() - 25 * 60_000).toISOString(),
    url: "https://t.me/kpszsu/0",
  },
  {
    id: "air_force_tg:demo-2",
    vector: "shahed_uav",
    oblasts: ["UA-12", "UA-23"],
    titleUk: "Загроза ударних БпЛА",
    issuedAt: new Date(Date.now() - 12 * 60_000).toISOString(),
    url: "https://t.me/kpszsu/1",
  },
  {
    id: "air_force_tg:demo-3",
    vector: "cruise_missile",
    oblasts: ["UA-46", "UA-68"],
    titleUk: "Загроза крилатих ракет",
    issuedAt: new Date(Date.now() - 6 * 60_000).toISOString(),
    url: "https://t.me/kpszsu/2",
  },
];

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`integrations:ua-genstaff:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const view = url.searchParams.get("view") ?? "summary";
  const lang = (url.searchParams.get("lang") as Lang) ?? "uk";
  const date = new Date().toISOString().slice(0, 10);

  const headers = {
    "Cache-Control": "public, max-age=120, stale-while-revalidate=240",
    "Access-Control-Allow-Origin": "*",
    ...rateLimitHeaders(rl),
  };

  if (view === "threats") {
    return NextResponse.json(
      {
        data: DEMO_THREATS,
        meta: {
          view: "threats",
          total: DEMO_THREATS.length,
          informsLayer: "air_raid_alerts",
          source: "Повітряні Сили ЗСУ / Air Force Command",
          attribution: {
            uk: "Джерело: Повітряні Сили ЗСУ (офіційне повідомлення)",
            en: "Source: Air Force Command of Ukraine (official statement)",
            de: "Quelle: Luftstreitkräfte der Ukraine (offizielle Mitteilung)",
          },
          generatedAt: new Date().toISOString(),
          isDemo: true,
        },
      },
      { headers },
    );
  }

  // Default: daily summary widget view-model.
  const headline = {
    uk: `Зведення Генштабу ЗСУ — ${date}`,
    en: `General Staff daily summary — ${date}`,
    de: `Generalstab-Tagesbericht — ${date}`,
  }[lang];

  return NextResponse.json(
    {
      data: {
        date,
        headline,
        totalEngagements: 152,
        losses: DEMO_LOSSES,
        directions: DEMO_DIRECTIONS,
        regions: DEMO_REGIONS,
        attribution: ATTRIBUTION,
        partial: false,
      },
      meta: {
        view: "summary",
        layer: null,
        framing: "official_reported_figures",
        source: "Генеральний штаб ЗСУ / General Staff of the AFU",
        generatedAt: new Date().toISOString(),
        isDemo: true,
      },
    },
    { headers },
  );
}
