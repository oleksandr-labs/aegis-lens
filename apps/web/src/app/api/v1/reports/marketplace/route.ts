/**
 * GET /api/v1/reports/marketplace
 *
 * Returns the full report product catalogue split into subscription and
 * one-off products, along with the creation-pipeline metadata.
 *
 * Cache: 1 hour (s-maxage=3600) — report catalogue changes rarely.
 *
 * Повертає каталог продуктів-звітів: підписки, разові купівлі, пайплайн.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getSubscriptionReports,
  getOneOffReports,
  REPORT_CREATION_PIPELINE,
} from "../../../../../lib/reports/marketplace";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest): NextResponse {
  return NextResponse.json(
    {
      reports: getSubscriptionReports(),
      oneOff: getOneOffReports(),
      pipeline: REPORT_CREATION_PIPELINE,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600",
        "Access-Control-Allow-Origin": "*",
        "Aegis-API-Version": "v1",
      },
    },
  );
}
