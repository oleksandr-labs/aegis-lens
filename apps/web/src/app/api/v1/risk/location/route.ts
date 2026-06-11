/**
 * POST /api/v1/risk/location
 *
 * Returns a geopolitical risk score for a given coordinate pair.
 *
 * Request body (JSON):
 *   { lat: number, lon: number }
 *
 * Response:
 *   200  RiskScoreResponse + metadata
 *   400  Invalid / missing coordinates
 *   429  Rate limited
 *
 * Rate limits by tier (per day, approximate):
 *   free-dev:  100 calls
 *   starter:   10,000 calls
 *   growth:    100,000 calls
 *   enterprise: unlimited
 *
 * Повертає оцінку геополітичного ризику для координат.
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import {
  computeLocationRisk,
  riskScoreLabel,
  RISK_SCORE_DISCLAIMER_EN,
} from "@/lib/risk/risk-score-api";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // ── Rate limiting ──────────────────────────────────────────────────────────
  const ipKey = `risk-location:${identifyRequest(req)}`;
  // 100 calls per 24h for free tier — ~4 per minute
  const rl = rateLimit(ipKey, 100, 24 * 60 * 60 * 1_000);

  if (!rl.ok) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message:
          "Rate limit exceeded. Upgrade to a paid Risk API tier for higher limits.",
        upgradeUrl: "https://aegislens.com/pricing/risk-api",
      },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders(rl),
          "Retry-After": String(rl.resetSeconds),
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const { lat, lon } =
    body && typeof body === "object"
      ? (body as Record<string, unknown>)
      : ({} as Record<string, unknown>);

  // ── Validate coordinates ───────────────────────────────────────────────────
  if (typeof lat !== "number" || typeof lon !== "number") {
    return NextResponse.json(
      {
        error: "invalid_params",
        message: "Both lat (number) and lon (number) are required.",
        example: { lat: 50.45, lon: 30.52 },
      },
      { status: 400 },
    );
  }

  if (lat < -90 || lat > 90) {
    return NextResponse.json(
      {
        error: "invalid_params",
        message: "lat must be between -90 and 90.",
      },
      { status: 400 },
    );
  }

  if (lon < -180 || lon > 180) {
    return NextResponse.json(
      {
        error: "invalid_params",
        message: "lon must be between -180 and 180.",
      },
      { status: 400 },
    );
  }

  // ── Compute risk score ─────────────────────────────────────────────────────
  const result = computeLocationRisk([lat, lon]);

  return NextResponse.json(
    {
      data: {
        ...result,
        label: riskScoreLabel(result.score),
        coordinates: { lat, lon },
        isProduction: false,
        disclaimer: RISK_SCORE_DISCLAIMER_EN,
      },
      meta: {
        endpoint: "risk/location",
        requestedAt: new Date().toISOString(),
        rateLimit: {
          remaining: rl.remaining,
          resetSeconds: rl.resetSeconds,
        },
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
