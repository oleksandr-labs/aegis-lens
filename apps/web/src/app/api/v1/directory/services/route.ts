/**
 * GET /api/v1/directory/services
 *
 * Returns all service category configurations for the intel/security services directory.
 *
 * Public endpoint — returns the eight service categories with EN + UK
 * names and descriptions used to drive programmatic /services/<category> pages.
 *
 * Cache: 1 hour (categories change only on deploy).
 *
 * Публічний ендпоінт — повертає вісім категорій послуг з назвами
 * та описами EN + UK, що використовуються для програматичних сторінок /services/<category>.
 */

import { NextRequest, NextResponse } from "next/server";
import { SERVICE_CATEGORIES_CONFIG } from "../../../../../lib/directory/services-dir";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest): NextResponse {
  return NextResponse.json(
    {
      object: "list",
      count: SERVICE_CATEGORIES_CONFIG.length,
      data: SERVICE_CATEGORIES_CONFIG,
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
