/**
 * GET /api/admin/quota — quota usage overview
 * POST /api/admin/quota/enforce — check + enforce quota for a specific action
 *
 * Quota types:
 *   events_read   — API calls that read events
 *   api_calls     — total API calls per day
 *   ai_tokens     — LLM tokens consumed per month
 *   exports       — bulk export operations per day
 *   reports       — reports generated per month
 *
 * Quota limits by tier (per month unless noted):
 *   free:       events_read 10k/day, api_calls 1k/day, ai_tokens 5k, exports 5, reports 2
 *   pro:        events_read 100k/day, api_calls 10k/day, ai_tokens 50k, exports 50, reports 20
 *   enterprise: events_read unlimited, api_calls unlimited, ai_tokens 500k, exports 500, reports 200
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { problemRateLimit, problemForbidden } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

type QuotaType = "events_read" | "api_calls" | "ai_tokens" | "exports" | "reports";
type Tier = "free" | "pro" | "enterprise";

const QUOTA_LIMITS: Record<Tier, Record<QuotaType, number>> = {
  free:       { events_read: 10_000,   api_calls: 1_000,    ai_tokens: 5_000,    exports: 5,   reports: 2   },
  pro:        { events_read: 100_000,  api_calls: 10_000,   ai_tokens: 50_000,   exports: 50,  reports: 20  },
  enterprise: { events_read: 9_999_999, api_calls: 9_999_999, ai_tokens: 500_000, exports: 500, reports: 200 },
};

// Demo usage (production: from TimescaleDB metering table)
const DEMO_USAGE: Record<string, Record<QuotaType, number>> = {
  "org-free-demo": { events_read: 7_432, api_calls: 823, ai_tokens: 3_150, exports: 3, reports: 1 },
  "org-pro-demo":  { events_read: 45_230, api_calls: 5_621, ai_tokens: 22_100, exports: 12, reports: 5 },
};

function getUsage(orgId: string): Record<QuotaType, number> {
  return DEMO_USAGE[orgId] ?? { events_read: 0, api_calls: 0, ai_tokens: 0, exports: 0, reports: 0 };
}

function getTier(orgId: string): Tier {
  if (orgId.includes("enterprise")) return "enterprise";
  if (orgId.includes("pro")) return "pro";
  return "free";
}

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`quota:overview:${ip}`, 30, 60_000);
  if (!rl.ok) return problemRateLimit(undefined, rl.resetSeconds, rateLimitHeaders(rl));

  const url = new URL(req.url);
  const orgId = url.searchParams.get("orgId") ?? "org-free-demo";
  const tier = getTier(orgId) as Tier;
  const limits = QUOTA_LIMITS[tier];
  const usage = getUsage(orgId);

  const quotas = (Object.keys(limits) as QuotaType[]).map((type) => {
    const limit = limits[type];
    const used = usage[type] ?? 0;
    const pct = limit < 9_999_999 ? Math.round((used / limit) * 100) : 0;
    return {
      type,
      used,
      limit: limit >= 9_999_999 ? null : limit, // null = unlimited
      pct,
      status: pct >= 100 ? "exceeded" : pct >= 90 ? "warning" : "ok",
    };
  });

  return NextResponse.json(
    {
      data: { orgId, tier, quotas },
      meta: { generatedAt: new Date().toISOString(), isDemo: true },
    },
    { headers: rateLimitHeaders(rl) },
  );
}

export async function POST(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`quota:enforce:${ip}`, 60, 60_000);
  if (!rl.ok) return problemRateLimit(undefined, rl.resetSeconds, rateLimitHeaders(rl));

  const { orgId, type, amount = 1 } = await req.json() as { orgId?: string; type?: QuotaType; amount?: number };

  if (!orgId || !type) return NextResponse.json({ error: "orgId and type are required" }, { status: 400 });

  const tier = getTier(orgId) as Tier;
  const limit = QUOTA_LIMITS[tier][type];
  const usage = getUsage(orgId);
  const current = usage[type] ?? 0;

  if (limit < 9_999_999 && current + amount > limit) {
    return problemForbidden(
      `Quota exceeded for ${type}. Used ${current}/${limit}. Upgrade to increase limits.`,
    );
  }

  // In production: increment meter in TimescaleDB + emit billing event
  return NextResponse.json({
    ok: true,
    type,
    used: current + amount,
    limit: limit >= 9_999_999 ? null : limit,
    remaining: limit >= 9_999_999 ? null : limit - current - amount,
  });
}
