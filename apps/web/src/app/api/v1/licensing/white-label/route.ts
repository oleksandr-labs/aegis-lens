/**
 * GET /api/v1/licensing/white-label
 *
 * Returns the canonical white-label pricing tier configurations.
 *
 * Public endpoint — returns all tiers (Silver, Gold, Platinum) with
 * pricing, features, and partner-program details.
 *
 * Cache: 5 minutes (tier configs change rarely; invalidate on deploy).
 *
 * Публічний ендпоінт конфігурацій рівнів білого лейблу.
 */

import { NextRequest, NextResponse } from "next/server";
import { WHITE_LABEL_PRICING } from "../../../../../lib/licensing/white-label";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest): NextResponse {
  return NextResponse.json(
    {
      object: "list",
      count: WHITE_LABEL_PRICING.length,
      data: WHITE_LABEL_PRICING,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
        "Access-Control-Allow-Origin": "*",
        "Aegis-API-Version": "v1",
      },
    },
  );
}
