/**
 * GET  /api/cases — list cases
 * POST /api/cases — create a case
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { caseStore, type Case, type CaseStatus } from "@/lib/cases-store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`cases:list:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status") as CaseStatus | null;

  let caseList = Array.from(caseStore.values());
  if (status && ["active", "archived", "locked"].includes(status)) {
    caseList = caseList.filter((c) => c.status === status);
  }

  caseList.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return NextResponse.json(
    { data: caseList, meta: { count: caseList.length } },
    {
      headers: {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}

export async function POST(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`cases:create:${ip}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const input = body as Partial<Case>;

  if (!input.title || typeof input.title !== "string" || input.title.trim().length === 0) {
    return NextResponse.json({ error: "validation", message: "title is required" }, { status: 422 });
  }

  const now = new Date().toISOString();
  const caseId = `case_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;

  const newCase: Case = {
    caseId,
    orgId: typeof input.orgId === "string" ? input.orgId : "org_default",
    createdBy: "anonymous",
    title: input.title.trim().slice(0, 300),
    description: typeof input.description === "string" ? input.description.slice(0, 5000) : undefined,
    status: "active",
    eventIds: Array.isArray(input.eventIds) ? input.eventIds.map(String) : [],
    aoiIds: Array.isArray(input.aoiIds) ? input.aoiIds.map(String) : [],
    permissions: {
      viewer: [],
      editor: ["anonymous"],
      admin: ["anonymous"],
    },
    createdAt: now,
    updatedAt: now,
  };

  caseStore.set(caseId, newCase);
  return NextResponse.json({ data: newCase }, { status: 201 });
}
