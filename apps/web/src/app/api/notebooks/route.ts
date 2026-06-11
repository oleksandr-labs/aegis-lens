/**
 * GET  /api/notebooks — list notebooks
 * POST /api/notebooks — create notebook
 *
 * Query (GET):
 *   public=true|false
 *   tag=<slug>
 *   status=draft|published|archived
 *
 * Rate: 60/min/IP
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { listNotebooks, createNotebook, type NotebookCreate } from "@/lib/notebooks-store";
import type { NotebookStatus } from "@ua-map/notebooks";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`notebooks:list:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const publicParam = url.searchParams.get("public");
  const tag = url.searchParams.get("tag") ?? undefined;
  const statusParam = url.searchParams.get("status") as NotebookStatus | null;

  const isPublic = publicParam === "true" ? true : publicParam === "false" ? false : undefined;

  const notebooks = listNotebooks({ isPublic, tag, status: statusParam ?? undefined });

  return NextResponse.json(
    { data: notebooks, meta: { count: notebooks.length } },
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
  const rl = rateLimit(`notebooks:create:${ip}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const input = body as Partial<NotebookCreate>;
  if (!input.title?.trim()) {
    return NextResponse.json({ error: "validation", message: "title is required" }, { status: 422 });
  }

  const notebook = createNotebook({
    title: input.title.trim(),
    description: input.description,
    tags: input.tags ?? [],
    authorId: input.authorId ?? "anonymous",
    orgId: input.orgId ?? "org-default",
    isPublic: input.isPublic ?? false,
  });

  return NextResponse.json(
    { data: notebook },
    {
      status: 201,
      headers: { "Access-Control-Allow-Origin": "*", ...rateLimitHeaders(rl) },
    },
  );
}
