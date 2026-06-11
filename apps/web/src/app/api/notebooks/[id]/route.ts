/**
 * GET    /api/notebooks/:id
 * PATCH  /api/notebooks/:id — update metadata
 * DELETE /api/notebooks/:id
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { getNotebook, updateNotebook, deleteNotebook, type NotebookUpdate } from "@/lib/notebooks-store";

export const dynamic = "force-dynamic";

interface Ctx { params: Promise<{ id: string }> }

export async function GET(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const ip = identifyRequest(req);
  const rl = rateLimit(`notebooks:get:${ip}`, 120, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const notebook = getNotebook(id);
  if (!notebook) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ data: notebook }, {
    headers: { "Cache-Control": "public, max-age=30", "Access-Control-Allow-Origin": "*", ...rateLimitHeaders(rl) },
  });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const ip = identifyRequest(req);
  const rl = rateLimit(`notebooks:update:${ip}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  if (!getNotebook(id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const updated = updateNotebook(id, body as NotebookUpdate);
  return NextResponse.json({ data: updated }, {
    headers: { "Access-Control-Allow-Origin": "*", ...rateLimitHeaders(rl) },
  });
}

export async function DELETE(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const ip = identifyRequest(req);
  const rl = rateLimit(`notebooks:delete:${ip}`, 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  if (!getNotebook(id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  deleteNotebook(id);
  return new Response(null, { status: 204 });
}
