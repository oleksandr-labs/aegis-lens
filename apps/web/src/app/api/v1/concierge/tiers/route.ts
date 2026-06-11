/**
 * GET /api/v1/concierge/tiers
 *
 * Returns all Managed AOI Concierge service tier contracts along with the
 * multi-AOI bundle discount percentage. Cached for 1 hour.
 *
 * Public endpoint — no authentication required.
 * Cache: 1 hour (tier definitions change rarely; invalidated on deploy).
 *
 * Публічний ендпоінт тарифів Managed AOI Concierge.
 * Повертає всі контракти та знижку за мультиAOI-пакет.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  CONCIERGE_TIERS,
  MULTI_AOI_BUNDLE_DISCOUNT_PCT,
} from "../../../../../lib/concierge/service-tiers";

export const dynamic = "force-dynamic";

/**
 * Return all concierge tier contracts with pricing metadata.
 *
 * Response shape:
 *   {
 *     object: "list",
 *     count: number,
 *     multiAoiBundleDiscountPct: number,
 *     data: ConciergeContract[]
 *   }
 *
 * Повертає всі тарифні контракти з відсотком знижки за пакет.
 */
export function GET(_req: NextRequest): NextResponse {
  return NextResponse.json(
    {
      object: "list",
      count: CONCIERGE_TIERS.length,
      multiAoiBundleDiscountPct: MULTI_AOI_BUNDLE_DISCOUNT_PCT,
      data: CONCIERGE_TIERS,
    },
    {
      headers: {
        // Cache for 1 hour; serve stale for up to 5 minutes while revalidating.
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=300",
        "Access-Control-Allow-Origin": "*",
        "Aegis-API-Version": "v1",
      },
    }
  );
}
