/**
 * GET /api/v1/revshare/contributor — list all contributor payout models.
 *
 * GET /api/v1/revshare/contributor — повернути всі моделі виплат контрибʼюторам.
 */

import { NextRequest, NextResponse } from "next/server";
import { CONTRIBUTOR_PAYOUT_MODELS } from "../../../../../lib/revshare/contributor";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest): NextResponse {
  return NextResponse.json(
    {
      object: "list",
      count: CONTRIBUTOR_PAYOUT_MODELS.length,
      data: CONTRIBUTOR_PAYOUT_MODELS,
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
