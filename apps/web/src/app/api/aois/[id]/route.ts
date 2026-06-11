/**
 * GET    /api/aois/:id
 * PATCH  /api/aois/:id
 * DELETE /api/aois/:id
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { aoiStore } from "@/lib/aois-store";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ip = identifyRequest(req);
  const rl = rateLimit(`aois:get:${ip}`, 120, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const aoi = aoiStore.get(id);
  if (!aoi) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json({ data: aoi }, { headers: rateLimitHeaders(rl) });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ip = identifyRequest(req);
  const rl = rateLimit(`aois:update:${ip}`, 30, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const aoi = aoiStore.get(id);
  if (!aoi) return NextResponse.json({ error: "not_found" }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const updated = { ...aoi, updatedAt: new Date().toISOString() };

  if (typeof body.name === "string" && body.name.trim()) updated.name = body.name.trim().slice(0, 200);
  if (Array.isArray(body.tags)) updated.tags = (body.tags as string[]).map(String).slice(0, 20);
  if (typeof body.isPrivate === "boolean") updated.isPrivate = body.isPrivate;
  if (Number.isInteger(body.satelliteCadenceDays) && (body.satelliteCadenceDays as number) >= 1) {
    updated.satelliteCadenceDays = body.satelliteCadenceDays as number;
  }
  if (Array.isArray(body.alertRuleIds)) updated.alertRuleIds = (body.alertRuleIds as string[]).map(String);

  aoiStore.set(id, updated);
  return NextResponse.json({ data: updated });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ip = identifyRequest(req);
  const rl = rateLimit(`aois:delete:${ip}`, 20, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  if (!aoiStore.has(id)) return NextResponse.json({ error: "not_found" }, { status: 404 });

  aoiStore.delete(id);
  return new Response(null, { status: 204 });
}
