/**
 * GET    /api/alerts/:id — get a single alert rule
 * PATCH  /api/alerts/:id — update an alert rule
 * DELETE /api/alerts/:id — delete an alert rule
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { alertStore } from "@/lib/alerts-store";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ip = identifyRequest(req);
  const rl = rateLimit(`alerts:get:${ip}`, 120, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const rule = alertStore.get(id);
  if (!rule) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ data: rule }, { headers: rateLimitHeaders(rl) });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ip = identifyRequest(req);
  const rl = rateLimit(`alerts:update:${ip}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const rule = alertStore.get(id);
  if (!rule) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const updated = { ...rule, updatedAt: new Date().toISOString() };

  if (typeof body.name === "string" && body.name.trim()) {
    updated.name = body.name.trim().slice(0, 200);
  }
  if (typeof body.description === "string") {
    updated.description = body.description.slice(0, 1000);
  }
  if (typeof body.enabled === "boolean") {
    updated.enabled = body.enabled;
  }
  if (
    typeof body.severity === "string" &&
    ["critical", "high", "medium", "low"].includes(body.severity)
  ) {
    updated.severity = body.severity as typeof rule.severity;
  }
  if (Array.isArray(body.channels) && body.channels.length > 0) {
    updated.channels = body.channels as typeof rule.channels;
  }
  if (typeof body.filter === "object" && body.filter !== null) {
    updated.filter = { ...rule.filter, ...(body.filter as object) };
  }

  alertStore.set(id, updated);
  return NextResponse.json({ data: updated });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ip = identifyRequest(req);
  const rl = rateLimit(`alerts:delete:${ip}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (!alertStore.has(id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  alertStore.delete(id);
  return new Response(null, { status: 204 });
}
