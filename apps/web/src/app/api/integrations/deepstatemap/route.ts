/**
 * GET /api/integrations/deepstatemap — DeepStateMAP frontline control layer.
 *
 * Serves the `frontline_control` layer as GeoJSON-ish features with per-polygon control
 * status (controlled / contested / liberated), confidence, and a non-overclaiming display
 * directive (see integrations/deepstatemap/src/disputed-policy.ts).
 *
 * Query params:
 *   status     — controlled | contested | liberated
 *   minConf    — minimum confidence 0–1
 *   format     — "geojson" (FeatureCollection) | "json" (default)
 *
 * IMPORTANT — republication gate: DeepStateMAP data is NOT public-domain (see the
 * package COMPLIANCE.md). Until DEEPSTATE_REPUBLICATION_PERMITTED=true is set after the
 * license/partnership is confirmed, this route serves the bundled DEMO polygons only and
 * flags `isDemo: true`. Attribution is always included.
 *
 * Cache: 6h (frontline updates ~daily).
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type ControlStatus = "controlled" | "contested" | "liberated";
type ControllingForce = "ru" | "ua" | "unknown";

interface DemoPolygon {
  id: string;
  status: ControlStatus;
  force: ControllingForce;
  confidence: number;
  label: { en: string; uk: string };
  sourceFill: string;
  geometry: { type: "Polygon"; coordinates: number[][][] };
}

// Synthetic DEMO polygons (mirror integrations/deepstatemap DEMO_SNAPSHOT). NOT real
// DeepState data — served because republication of live polygons is gated.
const DEMO_POLYGONS: DemoPolygon[] = [
  {
    id: "demo-occupied-donetsk",
    status: "controlled",
    force: "ru",
    confidence: 0.9,
    label: { en: "Occupied area (Donetsk sector)", uk: "Окупована територія (Донецький напрямок)" },
    sourceFill: "#cc0000",
    geometry: {
      type: "Polygon",
      coordinates: [[[37.6, 47.9], [38.4, 47.9], [38.4, 48.4], [37.6, 48.4], [37.6, 47.9]]],
    },
  },
  {
    id: "demo-contested-bakhmut",
    status: "contested",
    force: "unknown",
    confidence: 0.55,
    label: { en: "Contested zone (Bakhmut direction)", uk: "Зона бойових дій (Бахмутський напрямок)" },
    sourceFill: "#f59e0b",
    geometry: {
      type: "Polygon",
      coordinates: [[[37.95, 48.55], [38.15, 48.55], [38.15, 48.65], [37.95, 48.65], [37.95, 48.55]]],
    },
  },
  {
    id: "demo-liberated-kharkiv",
    status: "liberated",
    force: "ua",
    confidence: 0.8,
    label: { en: "Liberated area (Kharkiv sector)", uk: "Звільнена територія (Харківський напрямок)" },
    sourceFill: "#0057b7",
    geometry: {
      type: "Polygon",
      coordinates: [[[36.6, 49.7], [37.2, 49.7], [37.2, 50.1], [36.6, 50.1], [36.6, 49.7]]],
    },
  },
];

const ATTRIBUTION = {
  sourceName: "DeepStateMAP",
  sourceUrl: "https://deepstatemap.live",
  notice: {
    en: "Frontline data © DeepStateMAP (deepstatemap.live) — used with attribution. Not an official military source.",
    uk: "Дані про лінію фронту © DeepStateMAP (deepstatemap.live) — використано із зазначенням джерела. Не є офіційним військовим джерелом.",
  },
};

/** Non-overclaiming display directive (mirrors disputed-policy.ts). */
function directive(status: ControlStatus, confidence: number) {
  const low = confidence < 0.5;
  const pattern = status === "contested" ? "hatched" : low ? "dashed" : "solid";
  const baseOpacity = status === "contested" ? 0.25 : status === "liberated" ? 0.4 : 0.5;
  return {
    pattern,
    fillOpacity: low ? Math.min(baseOpacity, 0.2) : baseOpacity,
    attributable: status !== "contested",
  };
}

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`integrations:deepstatemap:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const republicationPermitted = process.env.DEEPSTATE_REPUBLICATION_PERMITTED === "true";

  const url = new URL(req.url);
  const statusFilter = url.searchParams.get("status") as ControlStatus | null;
  const minConf = parseFloat(url.searchParams.get("minConf") ?? "0");
  const format = url.searchParams.get("format") ?? "json";

  let polys = DEMO_POLYGONS;
  if (statusFilter) polys = polys.filter((p) => p.status === statusFilter);
  if (minConf > 0) polys = polys.filter((p) => p.confidence >= minConf);

  const enriched = polys.map((p) => ({ ...p, display: directive(p.status, p.confidence) }));

  if (format === "geojson") {
    const fc = {
      type: "FeatureCollection" as const,
      features: enriched.map((p) => ({
        type: "Feature" as const,
        id: p.id,
        geometry: p.geometry,
        properties: {
          status: p.status,
          force: p.force,
          confidence: p.confidence,
          label_en: p.label.en,
          label_uk: p.label.uk,
          pattern: p.display.pattern,
          fillOpacity: p.display.fillOpacity,
        },
      })),
      meta: { layer: "frontline_control", attribution: ATTRIBUTION, isDemo: !republicationPermitted, generatedAt: new Date().toISOString() },
    };
    return NextResponse.json(fc, { headers: cacheHeaders(rl) });
  }

  return NextResponse.json(
    {
      data: enriched,
      meta: {
        layer: "frontline_control",
        total: enriched.length,
        byStatus: {
          controlled: enriched.filter((p) => p.status === "controlled").length,
          contested: enriched.filter((p) => p.status === "contested").length,
          liberated: enriched.filter((p) => p.status === "liberated").length,
        },
        attribution: ATTRIBUTION,
        republicationPermitted,
        isDemo: !republicationPermitted,
        generatedAt: new Date().toISOString(),
      },
    },
    { headers: cacheHeaders(rl) },
  );
}

function cacheHeaders(rl: ReturnType<typeof rateLimit>): Record<string, string> {
  return {
    "Cache-Control": "public, max-age=21600, stale-while-revalidate=43200",
    "Access-Control-Allow-Origin": "*",
    ...rateLimitHeaders(rl),
  };
}
