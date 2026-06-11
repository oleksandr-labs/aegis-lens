/**
 * GET /api/v1/licensing/group
 *
 * Returns the canonical group / consortium licence tier registry as a JSON list.
 * Covers university site licences, newsroom alliances, NGO consortia,
 * professional associations, and K-12 civic education programmes.
 *
 * Public endpoint — no authentication required.
 * Cache: 5 minutes (catalogue changes rarely; invalidate on deploy).
 *
 * Публічний ендпоінт реєстру групових / консорціумних ліцензій.
 */

import { NextRequest, NextResponse } from "next/server";
import { GROUP_LICENSE_TIERS } from "../../../../../../lib/licensing/group-licensing";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest): NextResponse {
  return NextResponse.json(
    { object: "list", count: GROUP_LICENSE_TIERS.length, data: GROUP_LICENSE_TIERS },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
        "Access-Control-Allow-Origin": "*",
        "Aegis-API-Version": "v1",
      },
    }
  );
}
