/**
 * GET /api/v1/directory/think-tanks
 *
 * Returns think tank focus configuration for the Think Tanks & Research
 * Centers directory.
 *
 * Public endpoint — returns the ten think tank focus categories with EN + UK
 * names and descriptions used to drive programmatic /think-tanks/<focus>
 * and /think-tanks/<geography> pages.
 *
 * Cache: 1 hour (categories change only on deploy).
 *
 * Публічний ендпоінт — повертає десять тематичних категорій аналітичних
 * центрів з назвами та описами EN + UK, що використовуються для
 * програматичних сторінок /think-tanks/<focus> та /think-tanks/<geography>.
 */

import { NextRequest, NextResponse } from "next/server";
import { THINK_TANK_FOCUS_CONFIG } from "../../../../../lib/directory/think-tanks";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest): NextResponse {
  return NextResponse.json(
    {
      object: "list",
      count: THINK_TANK_FOCUS_CONFIG.length,
      data: THINK_TANK_FOCUS_CONFIG,
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
