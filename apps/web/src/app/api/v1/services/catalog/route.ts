/**
 * GET /api/v1/services/catalog
 *
 * Returns the complete professional services catalog.
 *
 * Public endpoint — returns all 8 professional services with
 * pricing, deliverables, and notes in both EN and UK languages.
 *
 * Cache: 5 minutes (catalog changes rarely; invalidate on deploy).
 *
 * Публічний ендпоінт каталогу професійних послуг (8 позицій, EN + UK).
 */

import { NextRequest, NextResponse } from "next/server";
import { PROFESSIONAL_SERVICES } from "../../../../../lib/services/professional-services";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest): NextResponse {
  return NextResponse.json(
    {
      object: "list",
      count: PROFESSIONAL_SERVICES.length,
      data: PROFESSIONAL_SERVICES,
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
