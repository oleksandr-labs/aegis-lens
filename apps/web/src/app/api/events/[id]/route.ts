import { NextResponse } from "next/server";
import { eventById } from "@/lib/events-seed";

export const dynamic = "force-dynamic";

/**
 * GET /api/events/<id>
 *
 * Returns a single canonical event or 404.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ev = eventById(id);
  if (!ev) {
    return NextResponse.json(
      { error: "event_not_found", id },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }
  return NextResponse.json(
    { data: ev, meta: { synthetic: true } },
    { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=120" } },
  );
}
