/**
 * GET /api/v1/delivery/channels
 *
 * Returns the canonical premium delivery channel registry as a JSON list.
 *
 * Query params:
 *   ?tier=standard|premium|critical-ops  — filter by delivery tier
 *
 * Public endpoint — no authentication required.
 * Cache: 5 minutes (channel catalogue changes rarely; invalidate on deploy).
 *
 * Публічний ендпоінт реєстру преміум-каналів доставки сповіщень.
 * Підтримує фільтрацію за рівнем доставки.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  PREMIUM_CHANNEL_CONFIGS,
  getChannelsByTier,
} from "../../../../../lib/delivery/premium-channels";
import type { DeliveryTier } from "../../../../../lib/delivery/premium-channels";

export const dynamic = "force-dynamic";

const VALID_TIERS: DeliveryTier[] = ["standard", "premium", "critical-ops"];

export function GET(req: NextRequest): NextResponse {
  const url = req.nextUrl;
  const tierParam = url.searchParams.get("tier");

  if (tierParam) {
    if (!VALID_TIERS.includes(tierParam as DeliveryTier)) {
      return NextResponse.json(
        {
          error: `Invalid tier "${tierParam}". Must be one of: ${VALID_TIERS.join(", ")}`,
          error_uk: `Невалідний рівень "${tierParam}". Допустимі: ${VALID_TIERS.join(", ")}`,
        },
        { status: 422 }
      );
    }

    const filtered = getChannelsByTier(tierParam as DeliveryTier);
    return NextResponse.json(
      { object: "list", count: filtered.length, data: filtered },
      {
        headers: {
          "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
          "Access-Control-Allow-Origin": "*",
          "Aegis-API-Version": "v1",
        },
      }
    );
  }

  return NextResponse.json(
    {
      object: "list",
      count: PREMIUM_CHANNEL_CONFIGS.length,
      data: PREMIUM_CHANNEL_CONFIGS,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
        "Access-Control-Allow-Origin": "*",
        "Aegis-API-Version": "v1",
      },
    }
  );
}
