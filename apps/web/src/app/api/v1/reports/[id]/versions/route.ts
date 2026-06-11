/**
 * GET /api/v1/reports/:id/versions
 *
 * Returns the version history for a report, newest first.
 * Each entry includes versionId, versionNumber, changelog, authorId, createdAt.
 * The full snapshot is omitted from the list to keep responses lightweight.
 *
 * GET /api/v1/reports/:id/versions
 * Повертає історію версій звіту, найновіша — першою.
 */

import { NextRequest, NextResponse } from "next/server";
import { reportVersionStore } from "../../../../../../lib/reports/versioning";

export const dynamic = "force-dynamic";

export function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
): NextResponse {
  const reportId = params.id;

  if (!reportId) {
    return NextResponse.json({ error: "Report ID required" }, { status: 400 });
  }

  const versions = reportVersionStore.listVersions(reportId).map((v) => ({
    versionId:     v.versionId,
    versionNumber: v.versionNumber,
    changelog:     v.changelog,
    changelogUk:   v.changelogUk,
    authorId:      v.authorId,
    createdAt:     v.createdAt,
  }));

  return NextResponse.json(
    { reportId, versions, total: versions.length },
    {
      headers: {
        "Cache-Control": "no-store",
        "Aegis-API-Version": "v1",
      },
    },
  );
}
