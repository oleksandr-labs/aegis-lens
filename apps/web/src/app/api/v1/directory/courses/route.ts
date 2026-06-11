/**
 * GET /api/v1/directory/courses
 *
 * Returns course topic configuration for the OSINT / intelligence / cyber
 * courses directory.
 *
 * Public endpoint — returns the eight course topic categories with EN + UK
 * names and descriptions used to drive programmatic /courses-directory/<topic>
 * and /courses-directory/<format> pages.
 *
 * Cache: 1 hour (categories change only on deploy).
 *
 * Публічний ендпоінт — повертає вісім тематичних категорій курсів з назвами
 * та описами EN + UK, що використовуються для програматичних сторінок
 * /courses-directory/<topic> та /courses-directory/<format>.
 */

import { NextRequest, NextResponse } from "next/server";
import { COURSE_TOPIC_CONFIG } from "../../../../../lib/directory/courses";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest): NextResponse {
  return NextResponse.json(
    {
      object: "list",
      count: COURSE_TOPIC_CONFIG.length,
      data: COURSE_TOPIC_CONFIG,
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
