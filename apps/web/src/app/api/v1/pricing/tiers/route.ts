/**
 * GET /api/v1/pricing/tiers
 *
 * Returns the canonical tier configuration as a JSON array.
 *
 * - Public endpoint: returns all tiers except gov-defense
 *   (gov-defense requires authenticated sales flow)
 * - Authenticated requests with a valid API key may pass
 *   ?include_restricted=1 to receive all tiers (future, not yet enforced)
 *
 * Cache: 5 minutes (tier configs change rarely; invalidate on deploy)
 *
 * Публічний ендпоінт конфігурацій рівнів (без gov-defense).
 */

import { NextRequest, NextResponse } from "next/server";
import { getPublicTiers } from "../../../../../lib/pricing/tier-config";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest): NextResponse {
  const tiers = getPublicTiers();

  return NextResponse.json(
    {
      object: "list",
      count: tiers.length,
      data: tiers,
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
