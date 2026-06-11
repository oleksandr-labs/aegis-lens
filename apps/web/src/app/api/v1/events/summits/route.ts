/**
 * GET /api/v1/events/summits
 *
 * Returns the canonical event products registry as a JSON list.
 *
 * Query params:
 *   ?access=public|subscribers-only|enterprise-only|invite-only  — filter by access tier
 *   ?format=in-person|virtual|hybrid                             — filter by event format
 *
 * Public endpoint — no authentication required.
 * Cache: 5 minutes (event catalogue changes rarely; invalidate on deploy).
 *
 * Публічний ендпоінт реєстру продуктів-заходів.
 * Підтримує фільтрацію за рівнем доступу та форматом.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  EVENT_PRODUCTS,
  getEventsByAccess,
  getEventsByFormat,
} from "../../../../../lib/events/summits";
import type { EventTierAccess, EventFormat } from "../../../../../lib/events/summits";

export const dynamic = "force-dynamic";

const VALID_ACCESS: EventTierAccess[] = [
  "public",
  "subscribers-only",
  "enterprise-only",
  "invite-only",
];

const VALID_FORMATS: EventFormat[] = ["in-person", "virtual", "hybrid"];

export function GET(req: NextRequest): NextResponse {
  const url = req.nextUrl;
  const accessParam = url.searchParams.get("access");
  const formatParam = url.searchParams.get("format");

  let events = EVENT_PRODUCTS;

  // ── Filter by access tier ──────────────────────────────────────────────────
  if (accessParam) {
    if (!VALID_ACCESS.includes(accessParam as EventTierAccess)) {
      return NextResponse.json(
        {
          error: `Invalid access value "${accessParam}". Must be one of: ${VALID_ACCESS.join(", ")}`,
          error_uk: `Невалідне значення access "${accessParam}". Допустимі: ${VALID_ACCESS.join(", ")}`,
        },
        { status: 422 }
      );
    }
    events = getEventsByAccess(accessParam as EventTierAccess);
  }

  // ── Filter by format ───────────────────────────────────────────────────────
  if (formatParam) {
    if (!VALID_FORMATS.includes(formatParam as EventFormat)) {
      return NextResponse.json(
        {
          error: `Invalid format value "${formatParam}". Must be one of: ${VALID_FORMATS.join(", ")}`,
          error_uk: `Невалідне значення format "${formatParam}". Допустимі: ${VALID_FORMATS.join(", ")}`,
        },
        { status: 422 }
      );
    }
    events = events.filter((e) => e.format === (formatParam as EventFormat));
  }

  return NextResponse.json(
    {
      object: "list",
      count: events.length,
      data: events,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
        "Access-Control-Allow-Origin": "*",
        "Aegis-API-Version": "v1",
      },
    }
  );
}
