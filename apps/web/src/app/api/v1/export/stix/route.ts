/**
 * GET /api/v1/export/stix?eventIds=id1,id2,...
 * Returns a STIX 2.1 bundle JSON for the requested events.
 *
 * GET /api/v1/export/stix?eventIds=id1,id2,...
 * Повертає JSON-бандл STIX 2.1 для запитуваних подій.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  eventToStixIndicator,
  buildStixBundle,
} from "@/lib/export/stix";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;
  const rawIds = searchParams.get("eventIds") ?? "";
  const eventIds = rawIds
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (eventIds.length === 0) {
    return NextResponse.json(
      {
        error: "Missing eventIds query parameter",
        error_uk: "Відсутній параметр запиту eventIds",
      },
      { status: 400 },
    );
  }

  // Resolve events — in production this would query the database.
  // Для production це зверталося б до бази даних.
  const mockEvents = eventIds.map((id) => ({
    eventId: id,
    title: `Event ${id}`,
    lat: 48.5 + Math.random() * 2,
    lng: 32.0 + Math.random() * 4,
    occurredAt: new Date().toISOString(),
    class: "kinetic",
    severity: "high",
    country: "UA",
  }));

  const indicators = mockEvents.map(eventToStixIndicator);
  const bundle = buildStixBundle(indicators);

  return NextResponse.json(bundle, {
    status: 200,
    headers: {
      "Content-Disposition": `attachment; filename="aegis-stix-${Date.now()}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
