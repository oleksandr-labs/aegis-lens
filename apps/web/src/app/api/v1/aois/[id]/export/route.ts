/**
 * POST /api/v1/aoi/[id]/export
 *
 * Enqueue an async export job for an AOI.  Returns the job record with
 * status 'queued'.  Poll this endpoint (GET) to check progress.
 */

import { NextResponse } from "next/server";
import { aoiExportQueue, type AOIExportConfig } from "@/../../services/aoi/src/exports";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const aoiId = params.id;
  if (!aoiId) {
    return NextResponse.json({ error: "aoi_id_required" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const input = body as Partial<AOIExportConfig>;

  if (!input.fromDate || !input.toDate) {
    return NextResponse.json(
      { error: "validation", message: "fromDate and toDate are required" },
      { status: 422 },
    );
  }

  const allowedFormats = ["json", "csv", "geojson"] as const;
  const format = allowedFormats.includes(input.format as (typeof allowedFormats)[number])
    ? (input.format as AOIExportConfig["format"])
    : "json";

  const config: AOIExportConfig = {
    aoiId,
    fromDate: input.fromDate,
    toDate: input.toDate,
    includeEvents: input.includeEvents !== false,
    includeSatelliteSnapshots: input.includeSatelliteSnapshots === true,
    format,
  };

  const job = aoiExportQueue.enqueue(config);

  return NextResponse.json(
    { data: job },
    { status: 202, headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const aoiId = params.id;
  if (!aoiId) {
    return NextResponse.json({ error: "aoi_id_required" }, { status: 400 });
  }

  const jobs = aoiExportQueue.listForAOI(aoiId);

  return NextResponse.json(
    { data: jobs, meta: { count: jobs.length } },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
