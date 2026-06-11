/**
 * GET /api/v1/revshare/affiliate — list all affiliate commission tier configs.
 *
 * GET /api/v1/revshare/affiliate — повернути всі конфігурації рівнів афіліатних комісій.
 */

import { NextRequest, NextResponse } from "next/server";
import { AFFILIATE_COMMISSION_CONFIGS } from "../../../../../lib/revshare/affiliate";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest): NextResponse {
  return NextResponse.json(
    {
      object: "list",
      count: AFFILIATE_COMMISSION_CONFIGS.length,
      data: AFFILIATE_COMMISSION_CONFIGS,
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
