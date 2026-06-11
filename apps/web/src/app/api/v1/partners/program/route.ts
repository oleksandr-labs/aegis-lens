/**
 * GET /api/v1/partners/program
 *
 * Returns the canonical partner & reseller programme tier registry as a JSON list.
 * Covers referral partners, resellers, OEM / white-label, and systems integrators.
 *
 * Public endpoint — no authentication required.
 * Cache: 5 minutes (programme terms change rarely; invalidate on deploy).
 *
 * Публічний ендпоінт реєстру партнерської та реселерської програми.
 */

import { NextRequest, NextResponse } from "next/server";
import { PARTNER_PROGRAM_TIERS } from "../../../../../../lib/partners/reseller";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest): NextResponse {
  return NextResponse.json(
    { object: "list", count: PARTNER_PROGRAM_TIERS.length, data: PARTNER_PROGRAM_TIERS },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
        "Access-Control-Allow-Origin": "*",
        "Aegis-API-Version": "v1",
      },
    }
  );
}
