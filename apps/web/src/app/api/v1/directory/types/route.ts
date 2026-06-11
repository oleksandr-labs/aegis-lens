/**
 * GET /api/v1/directory/types
 *
 * Returns all 14 directory type configurations with schema.org mapping and SEO notes.
 * Public endpoint — data is static, refreshed on each deploy.
 *
 * Публічний ендпоінт — повертає 14 конфігурацій типів директорії зі schema.org маппінгом та SEO-нотатками.
 */

import { NextRequest, NextResponse } from "next/server";
import { DIRECTORY_TYPE_CONFIGS } from "../../../../../lib/directory/strategy";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest): NextResponse {
  return NextResponse.json(
    {
      object: "list",
      count: DIRECTORY_TYPE_CONFIGS.length,
      data: DIRECTORY_TYPE_CONFIGS,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=300",
        "Access-Control-Allow-Origin": "*",
        "Aegis-API-Version": "v1",
      },
    },
  );
}
