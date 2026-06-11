/**
 * POST /api/v1/travel-risk/route-plan
 *
 * Plan a route between origin and destination, annotating each segment with
 * a risk score.  High-risk segments are flagged as not recommended.
 */

import { NextResponse } from "next/server";
import {
  planRoute,
  type RoutePlanRequest,
  type RoutePlannerWaypoint,
} from "@/../../services/travel-risk/src/route-planner";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const input = body as Partial<RoutePlanRequest>;

  if (!input.origin || !input.destination) {
    return NextResponse.json(
      { error: "validation", message: "origin and destination are required" },
      { status: 422 },
    );
  }

  const wp = (input.origin as Partial<RoutePlannerWaypoint>);
  if (typeof wp.lat !== "number" || typeof wp.lng !== "number") {
    return NextResponse.json(
      { error: "validation", message: "origin must have numeric lat and lng" },
      { status: 422 },
    );
  }

  const threshold =
    typeof input.avoidHighRiskThreshold === "number"
      ? Math.max(0, Math.min(100, input.avoidHighRiskThreshold))
      : 60;

  const request: RoutePlanRequest = {
    origin: input.origin as RoutePlannerWaypoint,
    destination: input.destination as RoutePlannerWaypoint,
    waypoints: Array.isArray(input.waypoints)
      ? (input.waypoints as RoutePlannerWaypoint[])
      : undefined,
    avoidHighRiskThreshold: threshold,
  };

  const result = planRoute(request);

  return NextResponse.json(
    { data: result },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    },
  );
}
