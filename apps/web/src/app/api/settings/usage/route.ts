/**
 * GET /api/settings/usage — usage dashboard summary
 *
 * Query:
 *   tier=free|pro|enterprise  — default: free
 *   metric=<name>             — detailed history for one metric
 *   days=30                   — history window (for metric detail)
 *
 * Rate: 30/min/IP
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { getUsageSummary, getUsageHistory, type UsageMetric } from "@/lib/usage-store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`usage:${ip}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const tier = url.searchParams.get("tier") ?? "free";
  const metricParam = url.searchParams.get("metric") as UsageMetric | null;
  const days = parseInt(url.searchParams.get("days") ?? "30", 10);

  if (metricParam) {
    const history = getUsageHistory(metricParam, Math.min(days, 365));
    return NextResponse.json(
      { data: history, meta: { metric: metricParam, days, isDemo: true } },
      { headers: { "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*", ...rateLimitHeaders(rl) } },
    );
  }

  const summary = getUsageSummary(tier);
  return NextResponse.json(
    { data: summary, meta: { tier, isDemo: true } },
    { headers: { "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*", ...rateLimitHeaders(rl) } },
  );
}
