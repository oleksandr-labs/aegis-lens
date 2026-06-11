/**
 * GET /api/v1/directory/tools
 *
 * Returns all tool category configurations for the OSINT tools directory.
 *
 * Public endpoint — returns the ten tool categories with EN + UK
 * names and descriptions used to drive programmatic /tools/<category> pages.
 *
 * Cache: 1 hour (categories change only on deploy).
 *
 * Публічний ендпоінт — повертає десять категорій інструментів з назвами
 * та описами EN + UK, що використовуються для програматичних сторінок /tools/<category>.
 */

import { NextRequest, NextResponse } from "next/server";
import { TOOL_CATEGORIES_CONFIG } from "../../../../../lib/directory/tools";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest): NextResponse {
  return NextResponse.json(
    {
      object: "list",
      count: TOOL_CATEGORIES_CONFIG.length,
      data: TOOL_CATEGORIES_CONFIG,
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
