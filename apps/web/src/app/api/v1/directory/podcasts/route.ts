/**
 * GET /api/v1/directory/podcasts
 *
 * Returns podcast topic configuration for the OSINT / intelligence /
 * geopolitics podcasts directory.
 *
 * Public endpoint — returns the eight podcast topic categories with EN + UK
 * names and descriptions used to drive programmatic /podcasts-directory/<topic>
 * and /podcasts-directory/<language> pages.
 *
 * Cache: 1 hour (categories change only on deploy).
 *
 * Публічний ендпоінт — повертає вісім тематичних категорій подкастів з
 * назвами та описами EN + UK, що використовуються для програматичних сторінок
 * /podcasts-directory/<topic> та /podcasts-directory/<language>.
 */

import { NextRequest, NextResponse } from "next/server";
import { PODCAST_TOPIC_CONFIG } from "../../../../../lib/directory/podcasts";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest): NextResponse {
  return NextResponse.json(
    {
      object: "list",
      count: PODCAST_TOPIC_CONFIG.length,
      data: PODCAST_TOPIC_CONFIG,
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
