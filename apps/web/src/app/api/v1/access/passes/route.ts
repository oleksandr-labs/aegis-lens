/**
 * GET /api/v1/access/passes
 *
 * Returns the Day / Event / Crisis / Weekend / Trial Pass product catalog.
 * Public endpoint — no authentication required.
 *
 * Cache: 5 minutes with stale-while-revalidate.
 *
 * Публічний ендпоінт каталогу пасів доступу.
 */

import { NextRequest, NextResponse } from "next/server";
import { DAY_PASSES } from "../../../../../lib/access/day-pass";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest): NextResponse {
  return NextResponse.json(
    {
      object: "list",
      count: DAY_PASSES.length,
      data: DAY_PASSES,
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
