/**
 * GET /api/v1/aoi/[id]/brief
 *
 * Returns the latest AOI AI brief, or triggers a manual generation if
 * no brief exists yet.  Requires pro or enterprise tier.
 */

import { NextResponse } from "next/server";
import { aoiBriefQueue, type AOIBriefTrigger } from "@/../../services/aoi/src/ai-brief";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const aoiId = params.id;
  if (!aoiId) {
    return NextResponse.json({ error: "aoi_id_required" }, { status: 400 });
  }

  const url = new URL(req.url);
  const trigger = (url.searchParams.get("trigger") ?? "manual") as AOIBriefTrigger;
  const generate = url.searchParams.get("generate") === "true";

  // Return existing briefs
  const existing = aoiBriefQueue.list(aoiId);

  if (existing.length > 0 && !generate) {
    return NextResponse.json(
      { data: existing[0], meta: { total: existing.length } },
      { headers: { "Cache-Control": "private, max-age=300" } },
    );
  }

  // Generate a new brief on demand
  const brief = aoiBriefQueue.generate(aoiId, trigger);

  return NextResponse.json(
    { data: brief, meta: { generated: true } },
    { status: 201, headers: { "Cache-Control": "private, no-store" } },
  );
}
