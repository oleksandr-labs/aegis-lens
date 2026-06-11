/**
 * GET /api/v1/ads/sponsored-slots
 *
 * Returns the catalogue of available sponsored slot types.
 * No authentication required — public endpoint.
 *
 * Публічний ендпоінт: каталог доступних типів спонсорських слотів.
 */

import { NextRequest, NextResponse } from "next/server";
import { SPONSORED_SLOT_TYPES } from "../../../../../lib/ads/mechanics";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest): NextResponse {
  const slots = Object.values(SPONSORED_SLOT_TYPES);

  return NextResponse.json(
    {
      object: "list",
      count: slots.length,
      data: slots,
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
