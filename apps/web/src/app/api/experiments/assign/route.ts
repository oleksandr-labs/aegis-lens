/**
 * POST /api/experiments/assign — get variant assignments for a user
 *
 * Body:
 *   {
 *     "userId": "user-abc",
 *     "persona": "analyst",
 *     "tier": "pro",
 *     "locale": "en"
 *   }
 *
 * Returns all running experiment assignments for this user.
 * Results are deterministic (sticky SHA-256 bucketing) — safe to call repeatedly.
 *
 * Rate: 120/min/IP (called on every page load by the client).
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { experimentRegistry } from "@/lib/experiments-store";
import { assignAll } from "@ua-map/experiments";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`experiments:assign:${ip}`, 120, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const input = body as { userId?: string; persona?: string; tier?: string; locale?: string };
  if (!input.userId) {
    return NextResponse.json({ error: "validation", message: "userId is required" }, { status: 422 });
  }

  const running = experimentRegistry.list("running");
  const assignments = assignAll(running, {
    userId: input.userId,
    persona: input.persona,
    tier: input.tier,
    locale: input.locale,
  });

  return NextResponse.json(
    { data: assignments, meta: { count: assignments.length } },
    {
      headers: {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
