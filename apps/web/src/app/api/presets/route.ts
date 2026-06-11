/**
 * GET  /api/presets — list workspace presets
 * POST /api/presets — create a new preset
 *
 * Query (GET):
 *   public=true|false — filter by visibility
 *   tag=<slug>        — filter by tag
 *
 * Rate: 60/min/IP
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { listPresets, createPreset, type PresetCreate } from "@/lib/presets-store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`presets:list:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const publicFilter = url.searchParams.get("public");
  const tag = url.searchParams.get("tag") ?? undefined;

  const isPublic = publicFilter === "true" ? true : publicFilter === "false" ? false : undefined;
  const presets = listPresets({ isPublic, tag });

  return NextResponse.json(
    { data: presets, meta: { count: presets.length } },
    {
      headers: {
        "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}

export async function POST(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`presets:create:${ip}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const input = body as Partial<PresetCreate>;
  if (!input.name?.trim()) {
    return NextResponse.json({ error: "validation", message: "name is required" }, { status: 422 });
  }
  if (!input.mapView?.center || !Array.isArray(input.mapView.center)) {
    return NextResponse.json({ error: "validation", message: "mapView.center [lon, lat] is required" }, { status: 422 });
  }

  const preset = createPreset({
    name: input.name.trim(),
    description: input.description,
    tags: input.tags ?? [],
    ownerId: input.ownerId ?? "anonymous",
    orgId: input.orgId ?? "org-default",
    isPublic: input.isPublic ?? false,
    activeLayers: input.activeLayers ?? [],
    filters: input.filters ?? {},
    mapView: input.mapView,
    timelineWindow: input.timelineWindow,
    aoiIds: input.aoiIds ?? [],
  });

  return NextResponse.json(
    { data: preset },
    {
      status: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
