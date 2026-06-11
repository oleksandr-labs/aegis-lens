/**
 * GET    /api/cases/:id
 * PATCH  /api/cases/:id
 * DELETE /api/cases/:id
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { caseStore } from "@/lib/cases-store";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ip = identifyRequest(req);
  const rl = rateLimit(`cases:get:${ip}`, 120, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const kase = caseStore.get(id);
  if (!kase) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json({ data: kase }, { headers: rateLimitHeaders(rl) });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ip = identifyRequest(req);
  const rl = rateLimit(`cases:update:${ip}`, 30, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const kase = caseStore.get(id);
  if (!kase) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (kase.status === "locked") {
    return NextResponse.json({ error: "case_locked", message: "Case is locked and cannot be modified" }, { status: 409 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const updated = { ...kase, updatedAt: new Date().toISOString() };

  if (typeof body.title === "string" && body.title.trim()) updated.title = body.title.trim().slice(0, 300);
  if (typeof body.description === "string") updated.description = body.description.slice(0, 5000);
  if (
    typeof body.status === "string" &&
    ["active", "archived", "locked"].includes(body.status)
  ) {
    updated.status = body.status as typeof kase.status;
  }
  if (Array.isArray(body.eventIds)) updated.eventIds = (body.eventIds as string[]).map(String);
  if (Array.isArray(body.aoiIds)) updated.aoiIds = (body.aoiIds as string[]).map(String);

  caseStore.set(id, updated);
  return NextResponse.json({ data: updated });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ip = identifyRequest(req);
  const rl = rateLimit(`cases:delete:${ip}`, 10, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const kase = caseStore.get(id);
  if (!kase) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (kase.status === "locked") {
    return NextResponse.json({ error: "case_locked", message: "Locked cases cannot be deleted" }, { status: 409 });
  }

  caseStore.delete(id);
  return new Response(null, { status: 204 });
}
