import { NextResponse } from "next/server";
import { eventsInCountry } from "@/lib/events-seed";
import { getRegion } from "@/lib/regions-seed";

/**
 * GET /api/regions/<country-iso2>
 *
 * Returns region metadata + recent event aggregates.
 */
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ country: string }> },
) {
  const { country } = await params;
  const region = getRegion(country);
  if (!region) {
    return NextResponse.json({ error: "region_not_found", country }, { status: 404 });
  }

  const events = eventsInCountry(country);
  const byClass = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.class] = (acc[e.class] ?? 0) + 1;
    return acc;
  }, {});

  // Severity index: weighted average of danger scores, scaled to 0–100.
  const severityIndex = events.length
    ? Math.round(events.reduce((s, e) => s + e.dangerScore, 0) / events.length)
    : 0;

  return NextResponse.json(
    {
      data: {
        country: region.iso2,
        name: region.name,
        capital: region.capital,
        eventCount: events.length,
        byClass,
        severityIndex,
      },
      meta: {
        synthetic: true,
        windowHours: null,
      },
    },
    { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=60" } },
  );
}
