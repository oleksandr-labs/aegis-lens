/**
 * GET  /api/alerts — list alert rules for the authed user/org
 * POST /api/alerts — create a new alert rule
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { alertStore, type AlertRule, type AlertSeverity } from "@/lib/alerts-store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`alerts:list:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  const url = new URL(req.url);
  const enabledOnly = url.searchParams.get("enabled") === "true";
  const severity = url.searchParams.get("severity") as AlertSeverity | null;

  let rules = Array.from(alertStore.values());

  if (enabledOnly) rules = rules.filter((r) => r.enabled);
  if (severity && ["critical", "high", "medium", "low"].includes(severity)) {
    rules = rules.filter((r) => r.severity === severity);
  }

  rules.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return NextResponse.json(
    { data: rules, meta: { count: rules.length } },
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
  const rl = rateLimit(`alerts:create:${ip}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const input = body as Partial<AlertRule>;

  if (!input.name || typeof input.name !== "string" || input.name.trim().length === 0) {
    return NextResponse.json({ error: "validation", message: "name is required" }, { status: 422 });
  }
  if (!Array.isArray(input.channels) || input.channels.length === 0) {
    return NextResponse.json({ error: "validation", message: "channels[] is required" }, { status: 422 });
  }

  const now = new Date().toISOString();
  const ruleId = `rule_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;

  const rule: AlertRule = {
    ruleId,
    name: input.name.trim().slice(0, 200),
    description: typeof input.description === "string" ? input.description.slice(0, 1000) : undefined,
    filter: typeof input.filter === "object" && input.filter !== null ? input.filter as AlertRule["filter"] : {},
    channels: input.channels,
    severity: (["critical", "high", "medium", "low"].includes(input.severity ?? "") ? input.severity : "medium") as AlertSeverity,
    enabled: input.enabled !== false,
    userId: "anonymous",
    createdAt: now,
    updatedAt: now,
  };

  alertStore.set(ruleId, rule);

  return NextResponse.json({ data: rule }, { status: 201 });
}
