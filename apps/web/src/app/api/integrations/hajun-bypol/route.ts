/**
 * GET /api/integrations/hajun-bypol — Belarus-flank military sightings
 * (Hajun Project / BYPOL). Russian equipment presence/movement THROUGH Belarus,
 * clustered around rail nodes and airbases — the northern flank for Ukraine.
 *
 * Feeds the `belarus_flank` map layer (category "military", access_tier
 * "registered") — see registry handoff in c:\tmp\sprint259_shared_HAJUN.txt.
 *
 * Query params:
 *   class       — rail_echelon | armor | sam_system | missile_system | aircraft |
 *                 helicopter | uav | fuel_logistics | personnel | other
 *   org         — hajun | bypol | community
 *   minSeverity — 1–5
 *   verifiedOnly — "true" = only SAR-corroborated sightings
 *   from / to   — ISO-8601 time window
 *
 * SOURCE PROTECTION: this route emits only public sighting facts + low-precision
 * POI coordinates. It NEVER returns contributor identities or pseudonyms.
 *
 * The route runs the package in DEMO mode (no secrets in the web tier); a worker
 * deployment supplies HAJUN_TG_BOT_TOKEN and persists sightings. Cache: 300s —
 * a low-frequency, "do not hammer" feed (see COMPLIANCE.md).
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// ── Types (mirror @ua-map/hajun-bypol; inlined to keep the route self-contained) ──

type EquipmentClass =
  | "rail_echelon" | "armor" | "sam_system" | "missile_system" | "aircraft"
  | "helicopter" | "uav" | "fuel_logistics" | "personnel" | "other";

type HajunOrg = "hajun" | "bypol" | "community";

interface SightingFeatureProps {
  eventId: string;
  org: HajunOrg;
  equipmentClass: EquipmentClass;
  model?: string;
  poiId?: string;
  poiNameEn?: string;
  poiNameUk?: string;
  severity: 1 | 2 | 3 | 4 | 5;
  confidence: number;
  /** Low-precision: POI centroid uncertainty in metres. */
  uncertaintyM: number;
  titleEn: string;
  titleUk: string;
  occurredAt: string;
  sourceUrl?: string;
  sarVerified: boolean;
  lat: number;
  lon: number;
}

const ALL_CLASSES: EquipmentClass[] = [
  "rail_echelon", "armor", "sam_system", "missile_system", "aircraft",
  "helicopter", "uav", "fuel_logistics", "personnel", "other",
];

// ── Demo data (mirrors the package DEMO_REPORTS, post-pipeline) ────────────────

const DEMO: SightingFeatureProps[] = [
  {
    eventId: "hajun-hajun_tg_demo-1",
    org: "hajun",
    equipmentClass: "rail_echelon",
    model: "t72",
    poiId: "rail_brest",
    poiNameEn: "Brest",
    poiNameUk: "Брест",
    severity: 4,
    confidence: 0.74,
    uncertaintyM: 5000,
    titleEn: "Rail echelon ×12: Brest",
    titleUk: "Військовий ешелон ×12: Брест",
    occurredAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
    sourceUrl: "https://t.me/Hajun_BY/0",
    sarVerified: true,
    lat: 52.098,
    lon: 23.687,
  },
  {
    eventId: "hajun-hajun_tg_demo-2",
    org: "hajun",
    equipmentClass: "aircraft",
    model: "su34",
    poiId: "air_machulishchy",
    poiNameEn: "Machulishchy",
    poiNameUk: "Мачулищі",
    severity: 4,
    confidence: 0.78,
    uncertaintyM: 3000,
    titleEn: "Aircraft: Machulishchy",
    titleUk: "Літаки: Мачулищі",
    occurredAt: new Date(Date.now() - 8 * 3600_000).toISOString(),
    sourceUrl: "https://t.me/Hajun_BY/1",
    sarVerified: false,
    lat: 53.749,
    lon: 27.572,
  },
  {
    eventId: "hajun-bypol_tg_demo-3",
    org: "bypol",
    equipmentClass: "missile_system",
    model: "iskander_m",
    poiId: "rail_luninets",
    poiNameEn: "Luninets",
    poiNameUk: "Лунинець",
    severity: 5,
    confidence: 0.8,
    uncertaintyM: 5000,
    titleEn: "Missile system: Luninets",
    titleUk: "Ракетний комплекс: Лунинець",
    occurredAt: new Date(Date.now() - 20 * 3600_000).toISOString(),
    sourceUrl: "https://t.me/BYPOL_org/0",
    sarVerified: true,
    lat: 52.250,
    lon: 26.806,
  },
  {
    eventId: "hajun-hajun_site_demo-4",
    org: "hajun",
    equipmentClass: "sam_system",
    model: "s400",
    poiId: "rail_baranavichy",
    poiNameEn: "Baranavichy",
    poiNameUk: "Барановичі",
    severity: 4,
    confidence: 0.72,
    uncertaintyM: 5000,
    titleEn: "SAM system: Baranavichy",
    titleUk: "Зенітний комплекс: Барановичі",
    occurredAt: new Date(Date.now() - 30 * 3600_000).toISOString(),
    sourceUrl: "https://belaruspartisan.example/hajun/demo-4",
    sarVerified: false,
    lat: 53.133,
    lon: 26.013,
  },
];

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`integrations:hajun-bypol:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const classFilter = url.searchParams.get("class") as EquipmentClass | null;
  const orgFilter = url.searchParams.get("org") as HajunOrg | null;
  const minSev = parseInt(url.searchParams.get("minSeverity") ?? "1", 10);
  const verifiedOnly = url.searchParams.get("verifiedOnly") === "true";
  const fromMs = url.searchParams.get("from") ? new Date(url.searchParams.get("from")!).getTime() : 0;
  const toMs = url.searchParams.get("to") ? new Date(url.searchParams.get("to")!).getTime() : Infinity;

  let events = DEMO.filter((e) => {
    const t = new Date(e.occurredAt).getTime();
    return t >= fromMs && t <= toMs;
  });
  if (classFilter) events = events.filter((e) => e.equipmentClass === classFilter);
  if (orgFilter) events = events.filter((e) => e.org === orgFilter);
  if (minSev > 1) events = events.filter((e) => e.severity >= minSev);
  if (verifiedOnly) events = events.filter((e) => e.sarVerified);

  // GeoJSON FeatureCollection for the `belarus_flank` map layer.
  const features = events.map((e) => ({
    type: "Feature" as const,
    geometry: { type: "Point" as const, coordinates: [e.lon, e.lat] },
    properties: e,
  }));

  const meta = {
    total: events.length,
    byClass: Object.fromEntries(ALL_CLASSES.map((c) => [c, events.filter((e) => e.equipmentClass === c).length])),
    sarVerified: events.filter((e) => e.sarVerified).length,
    layer: "belarus_flank",
    source: "Hajun Project / BYPOL",
    note: "Low-precision POI coordinates; no contributor identities are exposed.",
    generatedAt: new Date().toISOString(),
    isDemo: true,
  };

  return NextResponse.json(
    { type: "FeatureCollection", features, data: events, meta },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
