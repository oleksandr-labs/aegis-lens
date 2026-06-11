/**
 * GET /api/v1/hardware/bundles
 *
 * Returns the canonical hardware bundle registry as a JSON list.
 *
 * Public endpoint — no authentication required.
 * Cache: 5 minutes (bundle catalogue changes rarely; invalidate on deploy).
 *
 * Публічний ендпоінт реєстру апаратних комплектів.
 */

import { NextRequest, NextResponse } from "next/server";
import { HARDWARE_BUNDLES } from "../../../../../lib/hardware/bundles";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest): NextResponse {
  return NextResponse.json(
    {
      object: "list",
      count: HARDWARE_BUNDLES.length,
      data: HARDWARE_BUNDLES,
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
