/**
 * GET /api/v1/directory/conferences
 *
 * Returns conference focus category configuration and schema note for the
 * OSINT / intelligence / security conferences directory.
 *
 * Public endpoint — returns the eight conference focus categories with EN + UK
 * names and descriptions, plus the schema.org Event note used to drive
 * programmatic /conferences/<year> and /conferences/<focus> pages.
 *
 * Cache: 1 hour (categories change only on deploy).
 *
 * Публічний ендпоінт — повертає вісім тематичних категорій конференцій з
 * назвами та описами EN + UK, а також нотатку схеми schema.org Event для
 * програматичних сторінок /conferences/<year> та /conferences/<focus>.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  CONFERENCE_FOCUS_CONFIG,
  CONFERENCE_SCHEMA_NOTE_EN,
  CONFERENCE_SCHEMA_NOTE_UK,
} from "../../../../../lib/directory/conferences";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest): NextResponse {
  return NextResponse.json(
    {
      object: "list",
      count: CONFERENCE_FOCUS_CONFIG.length,
      schema_note_en: CONFERENCE_SCHEMA_NOTE_EN,
      schema_note_uk: CONFERENCE_SCHEMA_NOTE_UK,
      data: CONFERENCE_FOCUS_CONFIG,
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
