/**
 * GET /api/v1/pricing/discounts
 *
 * Returns the full catalog of discount, grant, and free-access programs.
 * Public endpoint — no authentication required.
 *
 * Cache: 5 minutes with stale-while-revalidate.
 *
 * Публічний ендпоінт каталогу програм знижок та грантів.
 */

import { NextRequest, NextResponse } from "next/server";
import { DISCOUNT_CONFIGS } from "../../../../../lib/pricing/discounts";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest): NextResponse {
  return NextResponse.json(
    {
      object: "list",
      count: DISCOUNT_CONFIGS.length,
      data: DISCOUNT_CONFIGS,
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
