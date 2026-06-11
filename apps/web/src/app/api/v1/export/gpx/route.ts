/**
 * GET /api/v1/export/gpx?eventIds=id1,id2,...
 * Returns a GPX 1.1 XML file for the requested events.
 *
 * GET /api/v1/export/gpx?eventIds=id1,id2,...
 * Повертає XML-файл GPX 1.1 для запитуваних подій.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  buildGpxXml,
  eventsToGpxWaypoints,
} from "@/lib/export/gpx";

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
    description: `OSINT event ${id}`,
  }));

  const waypoints = eventsToGpxWaypoints(mockEvents);
  const gpxXml = buildGpxXml(waypoints, "Aegis Lens Export");

  return new NextResponse(gpxXml, {
    status: 200,
    headers: {
      "Content-Type": "application/gpx+xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="aegis-export-${Date.now()}.gpx"`,
      "Cache-Control": "no-store",
    },
  });
}
