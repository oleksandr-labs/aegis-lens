/**
 * GET /api/v1/docs/surfaces — Returns all documentation surface configurations.
 * Повертає конфігурації всіх поверхонь документації.
 */

import { NextRequest, NextResponse } from "next/server";
import { DOCS_SURFACES } from "../../../../../lib/docs/ia-config";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest): NextResponse {
  return NextResponse.json(
    {
      object: "list",
      count: DOCS_SURFACES.length,
      data: DOCS_SURFACES,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
        "Access-Control-Allow-Origin": "*",
        "Aegis-API-Version": "v1",
      },
    },
  );
}
