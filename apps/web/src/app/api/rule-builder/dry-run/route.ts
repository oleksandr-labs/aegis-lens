/**
 * POST /api/rule-builder/dry-run — test a parsed alert rule against historical events
 *
 * Body: ParsedRule (from /api/rule-builder/parse or direct rule JSON)
 * Returns: DryRunResult with match count, samples, daily rate, noisiness flag
 *
 * Rate: 20/min/IP (more expensive than simple rule parse).
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { dryRunRule, type RuleEvent } from "@ua-map/rule-builder";
import { listEvents } from "@/lib/events-seed";
import type { ParsedRule } from "@ua-map/rule-builder";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`rule-builder:dry-run:${ip}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { rule, periodDays } = body as { rule?: ParsedRule; periodDays?: number };

  if (!rule || typeof rule !== "object") {
    return NextResponse.json({ error: "validation", message: "rule object is required" }, { status: 422 });
  }

  const days = Number(periodDays) || 30;
  if (days < 1 || days > 90) {
    return NextResponse.json({ error: "validation", message: "periodDays must be 1–90" }, { status: 422 });
  }

  // Map seed events to RuleEvent shape
  const events: RuleEvent[] = listEvents().map((e) => ({
    eventId: e.eventId,
    class: e.class,
    subclass: e.subclass ?? undefined,
    severity: e.severity,
    confidence: e.confidence,
    lat: e.location?.lat,
    lon: e.location?.lon,
    summary: e.summary ?? "",
    occurredAt: e.occurredAt,
    source: e.sourceUrls?.[0],
  }));

  const result = dryRunRule(rule, events, days);

  return NextResponse.json(
    { data: result, meta: { isDemo: true, eventCount: events.length } },
    {
      headers: {
        "Cache-Control": "no-store",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
