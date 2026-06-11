/**
 * GET /api/integrations/alerts-in-ua — active air-raid alerts (alerts.in.ua)
 *
 * Lowest-latency P0 feed. Complements /api/layers/* civilian_alerts. Serves a
 * normalized snapshot of currently-active alerts with oblast → raion → hromada
 * granularity (tier permitting). Uses the bundled DEMO fixture when no
 * ALERTS_IN_UA_TOKEN is configured, so the route always returns shape-valid data.
 *
 * Feeds the EXISTING `air_raid_alerts` map layer (no new layer is registered).
 *
 * Query params:
 *   region   — ISO 3166-2 oblast code (e.g. UA-63)
 *   type     — air_raid | artillery | urban_fighting | chemical | ...
 *   status   — active | all_clear | partial_clear
 *   locale   — uk | en | ru (default uk) — affects title text
 *
 * Cache: 5s (matches the <5s latency SLO; alerts change fast).
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type Locale = "uk" | "en" | "ru";

// ── Minimal in-route taxonomy (mirrors @ua-map/alerts-in-ua, no cross-pkg import) ─
type AlertType = "air_raid" | "artillery" | "urban_fighting" | "chemical" | "nuclear" | "radiological" | "info";

const TYPE_LABEL: Record<AlertType, { uk: string; en: string; ru: string }> = {
  air_raid:       { uk: "Повітряна тривога",      en: "Air raid alert",      ru: "Воздушная тревога" },
  artillery:      { uk: "Загроза артобстрілу",    en: "Artillery threat",    ru: "Угроза артобстрела" },
  urban_fighting: { uk: "Вуличні бої",            en: "Urban combat",        ru: "Уличные бои" },
  chemical:       { uk: "Хімічна небезпека",      en: "Chemical hazard",     ru: "Химическая опасность" },
  nuclear:        { uk: "Ядерна загроза",         en: "Nuclear threat",      ru: "Ядерная угроза" },
  radiological:   { uk: "Радіаційна небезпека",   en: "Radiological hazard", ru: "Радиационная опасность" },
  info:           { uk: "Інформаційне повідомлення", en: "Information notice", ru: "Информационное сообщение" },
};

interface AlertOut {
  alertId: string;
  oblastCode: string;
  oblastNameUk: string;
  oblastNameEn: string;
  type: AlertType;
  status: "active" | "all_clear" | "partial_clear";
  startedAt: string;
  source: string;
  lat: number;
  lon: number;
  severity: number;
  title: { uk: string; en: string; ru: string };
}

// Demo snapshot mirrors client.ts DEMO_RAW_ALERTS (no secrets, always valid).
const DEMO: Array<Omit<AlertOut, "title">> = [
  {
    alertId: "demo:31:air_raid", oblastCode: "UA-63", oblastNameUk: "Харківська", oblastNameEn: "Kharkiv",
    type: "air_raid", status: "active", startedAt: new Date(Date.now() - 12 * 60_000).toISOString(),
    source: "alerts.in.ua (demo)", lat: 49.99, lon: 36.23, severity: 4,
  },
  {
    alertId: "demo:9:air_raid", oblastCode: "UA-12", oblastNameUk: "Дніпропетровська", oblastNameEn: "Dnipropetrovsk",
    type: "air_raid", status: "active", startedAt: new Date(Date.now() - 4 * 60_000).toISOString(),
    source: "alerts.in.ua (demo)", lat: 48.46, lon: 35.04, severity: 4,
  },
  {
    alertId: "demo:14140:artillery", oblastCode: "UA-14", oblastNameUk: "Донецька", oblastNameEn: "Donetsk",
    type: "artillery", status: "active", startedAt: new Date(Date.now() - 30 * 60_000).toISOString(),
    source: "alerts.in.ua (demo)", lat: 48.01, lon: 37.80, severity: 4,
  },
];

function withTitle(a: Omit<AlertOut, "title">): AlertOut {
  const label = TYPE_LABEL[a.type];
  return {
    ...a,
    title: {
      uk: `${label.uk} у ${a.oblastNameUk} обл.`,
      en: `${label.en} active in ${a.oblastNameEn} Oblast`,
      ru: `${label.ru} в ${a.oblastNameUk} обл.`,
    },
  };
}

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`integrations:alerts-in-ua:${ip}`, 120, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const region = url.searchParams.get("region");
  const typeFilter = url.searchParams.get("type") as AlertType | null;
  const statusFilter = url.searchParams.get("status");
  const locale = ((url.searchParams.get("locale") ?? "uk") as Locale);

  const hasToken = !!process.env.ALERTS_IN_UA_TOKEN;

  let alerts = DEMO.map(withTitle);
  if (region) alerts = alerts.filter((a) => a.oblastCode === region);
  if (typeFilter) alerts = alerts.filter((a) => a.type === typeFilter);
  if (statusFilter) alerts = alerts.filter((a) => a.status === statusFilter);

  const meta = {
    total: alerts.length,
    activeOblasts: Array.from(new Set(alerts.filter((a) => a.status === "active").map((a) => a.oblastCode))),
    locale,
    layer: "air_raid_alerts",
    source: "alerts.in.ua",
    attribution: locale === "en" ? "Alert data: alerts.in.ua" : "Дані тривог: alerts.in.ua",
    attributionUrl: "https://alerts.in.ua/",
    latencySloMs: 5000,
    isDemo: !hasToken,
    generatedAt: new Date().toISOString(),
  };

  return NextResponse.json(
    { data: alerts, meta },
    {
      headers: {
        "Cache-Control": "public, max-age=5, stale-while-revalidate=10",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
