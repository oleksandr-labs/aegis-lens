/**
 * GET /api/integrations/ua-dsns — DSNS emergency events (fire / explosion /
 * collapse / rescue / demining / flood / hazmat / evacuation).
 *
 * Feeds the `emergencies` map layer (category "civilian", access_tier "public")
 * — see registry handoff in c:\tmp\sprint258_shared_DSNS.txt.
 *
 * Query params:
 *   oblast   — ISO 3166-2 oblast code (e.g. "UA-63")
 *   type     — fire | explosion | collapse | rescue | demining | flood | hazmat | evacuation
 *   minSeverity — 1–5
 *   evac     — "true" = only events with an evacuation order
 *   from / to — ISO-8601 time window
 *
 * The route runs the package in DEMO mode (no secrets in the web tier); a worker
 * deployment supplies DSNS_TG_BOT_TOKEN and persists events. Cache: 120s — DSNS
 * is a low-frequency, "do not hammer" feed (see COMPLIANCE.md).
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// ── Types (mirrors @ua-map/ua-dsns; inlined to keep the route self-contained) ──

type EmergencyType =
  | "fire" | "explosion" | "collapse" | "rescue"
  | "demining" | "flood" | "hazmat" | "evacuation" | "other";

interface EmergencyFeatureProps {
  eventId: string;
  type: EmergencyType;
  oblast?: string;
  oblastNameEn?: string;
  placeNameUk?: string;
  severity: 1 | 2 | 3 | 4 | 5;
  confidence: number;
  titleEn: string;
  titleUk: string;
  occurredAt: string;
  sourceUrl?: string;
  evacuationOrdered: boolean;
  fireCorroborated: boolean;
  lat?: number;
  lon?: number;
}

const ALL_TYPES: EmergencyType[] = [
  "fire", "explosion", "collapse", "rescue", "demining", "flood", "hazmat", "evacuation", "other",
];

// ── Demo data (mirrors the package DEMO_REPORTS, post-pipeline) ────────────────

const DEMO: EmergencyFeatureProps[] = [
  {
    eventId: "dsns-demo-1",
    type: "fire",
    oblast: "UA-63",
    oblastNameEn: "Kharkiv",
    placeNameUk: "Харків",
    severity: 3,
    confidence: 0.82,
    titleEn: "Fire: Kharkiv",
    titleUk: "Пожежа: Харків",
    occurredAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    sourceUrl: "https://t.me/dsns_kharkiv/0",
    evacuationOrdered: false,
    fireCorroborated: true,
    lat: 49.994,
    lon: 36.232,
  },
  {
    eventId: "dsns-demo-2",
    type: "demining",
    oblast: "UA-59",
    oblastNameEn: "Sumy",
    placeNameUk: "Шостка",
    severity: 2,
    confidence: 0.88,
    titleEn: "Demining: Sumy",
    titleUk: "Розмінування: Сумська",
    occurredAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
    sourceUrl: "https://t.me/dsns_telegram/0",
    evacuationOrdered: false,
    fireCorroborated: false,
    lat: 51.866,
    lon: 33.479,
  },
  {
    eventId: "dsns-demo-3",
    type: "collapse",
    oblast: "UA-12",
    oblastNameEn: "Dnipropetrovsk",
    placeNameUk: "Дніпро",
    severity: 5,
    confidence: 0.85,
    titleEn: "Collapse: Dnipro",
    titleUk: "Обвалення: Дніпро",
    occurredAt: new Date(Date.now() - 7 * 3600_000).toISOString(),
    sourceUrl: "https://t.me/dsns_dnipro/0",
    evacuationOrdered: true,
    fireCorroborated: false,
    lat: 48.464,
    lon: 35.045,
  },
  {
    eventId: "dsns-demo-4",
    type: "explosion",
    oblast: "UA-51",
    oblastNameEn: "Odesa",
    placeNameUk: "Чорноморськ",
    severity: 5,
    confidence: 0.87,
    titleEn: "Explosion: Odesa",
    titleUk: "Вибух: Чорноморськ",
    occurredAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
    sourceUrl: "https://odesa.dsns.gov.ua/news/0",
    evacuationOrdered: false,
    fireCorroborated: true,
    lat: 46.301,
    lon: 30.654,
  },
];

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`integrations:ua-dsns:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const oblast = url.searchParams.get("oblast");
  const typeFilter = url.searchParams.get("type") as EmergencyType | null;
  const minSev = parseInt(url.searchParams.get("minSeverity") ?? "1", 10);
  const evacOnly = url.searchParams.get("evac") === "true";
  const fromMs = url.searchParams.get("from") ? new Date(url.searchParams.get("from")!).getTime() : 0;
  const toMs = url.searchParams.get("to") ? new Date(url.searchParams.get("to")!).getTime() : Infinity;

  let events = DEMO.filter((e) => {
    const t = new Date(e.occurredAt).getTime();
    return t >= fromMs && t <= toMs;
  });
  if (oblast) events = events.filter((e) => e.oblast === oblast);
  if (typeFilter) events = events.filter((e) => e.type === typeFilter);
  if (minSev > 1) events = events.filter((e) => e.severity >= minSev);
  if (evacOnly) events = events.filter((e) => e.evacuationOrdered);

  // GeoJSON FeatureCollection for the `emergencies` map layer.
  const features = events
    .filter((e) => e.lat !== undefined && e.lon !== undefined)
    .map((e) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [e.lon, e.lat] },
      properties: e,
    }));

  const meta = {
    total: events.length,
    byType: Object.fromEntries(ALL_TYPES.map((t) => [t, events.filter((e) => e.type === t).length])),
    evacuationOrders: events.filter((e) => e.evacuationOrdered).length,
    fireCorroborated: events.filter((e) => e.fireCorroborated).length,
    layer: "emergencies",
    source: "DSNS / ДСНС",
    generatedAt: new Date().toISOString(),
    isDemo: true,
  };

  return NextResponse.json(
    { type: "FeatureCollection", features, data: events, meta },
    {
      headers: {
        "Cache-Control": "public, max-age=120, stale-while-revalidate=240",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
