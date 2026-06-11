/**
 * GET  /api/aois — list areas of interest
 * POST /api/aois — create a new AOI
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { aoiStore, type AOI, type AOIGeometry } from "@/lib/aois-store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`aois:list:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const tag = url.searchParams.get("tag");
  const privateOnly = url.searchParams.get("private") === "true";
  const publicOnly = url.searchParams.get("public") === "true";

  let aois = Array.from(aoiStore.values());

  if (tag) aois = aois.filter((a) => a.tags.includes(tag));
  if (privateOnly) aois = aois.filter((a) => a.isPrivate);
  if (publicOnly) aois = aois.filter((a) => !a.isPrivate);

  aois.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return NextResponse.json(
    { data: aois, meta: { count: aois.length } },
    {
      headers: {
        "Cache-Control": "private, no-store",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}

export async function POST(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`aois:create:${ip}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const input = body as Partial<AOI>;

  if (!input.name || typeof input.name !== "string" || input.name.trim().length === 0) {
    return NextResponse.json({ error: "validation", message: "name is required" }, { status: 422 });
  }

  if (!input.geometry || typeof input.geometry !== "object") {
    return NextResponse.json({ error: "validation", message: "geometry is required" }, { status: 422 });
  }

  const geo = input.geometry as AOIGeometry;
  if (!["polygon", "circle", "bbox"].includes(geo.type)) {
    return NextResponse.json(
      { error: "validation", message: "geometry.type must be polygon | circle | bbox" },
      { status: 422 },
    );
  }

  const now = new Date().toISOString();
  const aoiId = `aoi_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;

  const aoi: AOI = {
    aoiId,
    name: input.name.trim().slice(0, 200),
    tags: Array.isArray(input.tags) ? input.tags.map(String).slice(0, 20) : [],
    geometry: geo,
    isPrivate: input.isPrivate === true,
    satelliteCadenceDays: Number.isInteger(input.satelliteCadenceDays) && (input.satelliteCadenceDays ?? 7) >= 1
      ? (input.satelliteCadenceDays as number)
      : 7,
    alertRuleIds: Array.isArray(input.alertRuleIds) ? input.alertRuleIds.map(String) : [],
    userId: "anonymous",
    createdAt: now,
    updatedAt: now,
  };

  aoiStore.set(aoiId, aoi);
  return NextResponse.json({ data: aoi }, { status: 201 });
}
