/**
 * GET    /api/presets/:id — get preset by ID or share token
 * PATCH  /api/presets/:id — update preset
 * DELETE /api/presets/:id — delete preset
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { getPreset, updatePreset, deletePreset, type PresetUpdate } from "@/lib/presets-store";

export const dynamic = "force-dynamic";

interface Ctx { params: Promise<{ id: string }> }

export async function GET(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const ip = identifyRequest(req);
  const rl = rateLimit(`presets:get:${ip}`, 120, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const preset = getPreset(id);
  if (!preset) {
    return NextResponse.json({ error: "not_found" }, { status: 404, headers: rateLimitHeaders(rl) });
  }

  return NextResponse.json(
    { data: preset },
    {
      headers: {
        "Cache-Control": "public, max-age=30",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const ip = identifyRequest(req);
  const rl = rateLimit(`presets:update:${ip}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  if (!getPreset(id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const update = body as PresetUpdate;
  const updated = updatePreset(id, update);

  return NextResponse.json(
    { data: updated },
    { headers: { "Access-Control-Allow-Origin": "*", ...rateLimitHeaders(rl) } },
  );
}

export async function DELETE(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const ip = identifyRequest(req);
  const rl = rateLimit(`presets:delete:${ip}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  if (!getPreset(id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  deletePreset(id);
  return new Response(null, { status: 204 });
}
