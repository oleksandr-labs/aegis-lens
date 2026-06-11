/**
 * GET /api/v1/billing/credits
 *
 * Returns the available credit pack options with pricing and volume bonuses.
 * Public endpoint — no authentication required.
 *
 * Cache: 5 minutes with stale-while-revalidate.
 *
 * Публічний ендпоінт пакетів поповнення кредитів.
 */

import { NextRequest, NextResponse } from "next/server";
import { CREDIT_PACKS } from "../../../../../lib/billing/credits-wallet-packs";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest): NextResponse {
  return NextResponse.json(
    {
      object: "list",
      count: CREDIT_PACKS.length,
      data: CREDIT_PACKS,
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
