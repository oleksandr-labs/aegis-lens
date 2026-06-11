/**
 * GET  /api/notebooks/:id/cells — list cells in order
 * POST /api/notebooks/:id/cells — add or update a cell (upsert by cell.id)
 *
 * Cell types: markdown | query | map | chart | ai | code
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { getNotebook, upsertCell } from "@/lib/notebooks-store";
import { randomUUID } from "crypto";
import type { NotebookCell } from "@ua-map/notebooks";

export const dynamic = "force-dynamic";

interface Ctx { params: Promise<{ id: string }> }

export async function GET(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const ip = identifyRequest(req);
  const rl = rateLimit(`notebooks:cells:${ip}`, 120, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const notebook = getNotebook(id);
  if (!notebook) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ data: notebook.cells, meta: { count: notebook.cells.length } }, {
    headers: { "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*", ...rateLimitHeaders(rl) },
  });
}

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const ip = identifyRequest(req);
  const rl = rateLimit(`notebooks:cells:create:${ip}`, 60, 60_000);
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

  const cell = body as Partial<NotebookCell>;
  const VALID_TYPES = ["markdown", "query", "map", "chart", "ai", "code"];
  if (!cell.type || !VALID_TYPES.includes(cell.type)) {
    return NextResponse.json({ error: "validation", message: `type must be one of: ${VALID_TYPES.join(", ")}` }, { status: 422 });
  }

  const ts = new Date().toISOString();
  const fullCell: NotebookCell = {
    id: cell.id ?? randomUUID(),
    order: cell.order ?? 999,
    updatedAt: ts,
    ...cell,
  } as NotebookCell;

  const updated = upsertCell(id, fullCell);
  return NextResponse.json({ data: fullCell, meta: { notebookId: id } }, {
    status: 201,
    headers: { "Access-Control-Allow-Origin": "*", ...rateLimitHeaders(rl) },
  });
}
