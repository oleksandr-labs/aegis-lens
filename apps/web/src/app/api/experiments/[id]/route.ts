/**
 * GET    /api/experiments/:id
 * PATCH  /api/experiments/:id — update name/description/status/eligibility
 * POST   /api/experiments/:id?action=start|pause|ship|kill
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { experimentRegistry } from "@/lib/experiments-store";

export const dynamic = "force-dynamic";

interface Ctx { params: Promise<{ id: string }> }

export async function GET(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const ip = identifyRequest(req);
  const rl = rateLimit(`experiments:get:${ip}`, 120, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const experiment = experimentRegistry.get(id);
  if (!experiment) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ data: experiment }, {
    headers: { "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*", ...rateLimitHeaders(rl) },
  });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const ip = identifyRequest(req);
  const rl = rateLimit(`experiments:update:${ip}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  let result;
  if (action === "start") {
    result = experimentRegistry.start(id);
    if (!result) return NextResponse.json({ error: "cannot_start", message: "Experiment not found or not in draft status" }, { status: 422 });
  } else if (action === "pause") {
    result = experimentRegistry.pause(id);
    if (!result) return NextResponse.json({ error: "cannot_pause", message: "Experiment not running" }, { status: 422 });
  } else if (action === "ship") {
    let body: { winnerVariantKey?: string } = {};
    try { body = await req.json(); } catch { /* optional */ }
    if (!body.winnerVariantKey) {
      return NextResponse.json({ error: "validation", message: "winnerVariantKey required for ship" }, { status: 422 });
    }
    try {
      result = experimentRegistry.ship(id, body.winnerVariantKey);
    } catch (err) {
      return NextResponse.json({ error: "validation", message: err instanceof Error ? err.message : "error" }, { status: 422 });
    }
  } else if (action === "kill") {
    let body: { lessonLearned?: string } = {};
    try { body = await req.json(); } catch { /* optional */ }
    result = experimentRegistry.kill(id, body.lessonLearned ?? "");
  } else {
    // Generic update
    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }
    result = experimentRegistry.update(id, body as Parameters<typeof experimentRegistry.update>[1]);
    if (!result) return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ data: result }, {
    headers: { "Access-Control-Allow-Origin": "*", ...rateLimitHeaders(rl) },
  });
}
