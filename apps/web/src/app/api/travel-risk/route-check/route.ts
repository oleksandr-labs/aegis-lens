/**
 * POST /api/travel-risk/route-check — compute risk for a route
 *
 * Body:
 *   {
 *     "origin": { "name": "Kyiv", "lat": 50.45, "lon": 30.52 },
 *     "destination": { "name": "Kharkiv", "lat": 49.99, "lon": 36.23 },
 *     "waypoints": [{ "name": "Poltava", "lat": 49.59, "lon": 34.55 }],
 *     "avgSpeedKmh": 80
 *   }
 *
 * Returns RouteRisk with per-segment breakdown, high-risk-area annotations,
 * estimated duration, and recommendations.
 *
 * Rate: 10/min/IP, Cache: no-store (route risk changes frequently).
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { RouteRiskScorer, type RouteInput } from "@ua-map/travel-risk";

export const dynamic = "force-dynamic";

// Demo signals (in production sourced from live event DB)
const DEMO_SIGNALS = [
  { sourceId: "s1", lat: 49.99, lon: 36.23, severity: 4, class: "military_action", occurredAt: new Date(Date.now() - 3600_000).toISOString(), radiusKm: 25 },
  { sourceId: "s2", lat: 47.84, lon: 35.17, severity: 4, class: "military_action", occurredAt: new Date(Date.now() - 7200_000).toISOString(), radiusKm: 40 },
  { sourceId: "s3", lat: 48.01, lon: 37.80, severity: 5, class: "military_action", occurredAt: new Date(Date.now() - 1800_000).toISOString(), radiusKm: 50 },
  { sourceId: "s4", lat: 46.64, lon: 32.61, severity: 3, class: "military_action", occurredAt: new Date(Date.now() - 10_800_000).toISOString(), radiusKm: 30 },
];

const scorer = new RouteRiskScorer(DEMO_SIGNALS);

export async function POST(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`travel-risk:route:${ip}`, 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const input = body as Partial<RouteInput>;

  if (!input.origin?.lat || !input.origin?.lon || !input.origin?.name) {
    return NextResponse.json({ error: "validation", message: "origin.name/lat/lon required" }, { status: 422 });
  }
  if (!input.destination?.lat || !input.destination?.lon || !input.destination?.name) {
    return NextResponse.json({ error: "validation", message: "destination.name/lat/lon required" }, { status: 422 });
  }

  const routeRisk = scorer.score({
    origin: input.origin,
    destination: input.destination,
    waypoints: input.waypoints,
    avgSpeedKmh: input.avgSpeedKmh,
  });

  return NextResponse.json(
    { data: routeRisk, meta: { isDemo: true } },
    {
      headers: {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
