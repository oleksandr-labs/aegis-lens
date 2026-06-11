/**
 * GET /api/v1/jobs/catalog
 *
 * Returns the Job Board / Talent Marketplace product catalog.
 * Public endpoint — no authentication required.
 *
 * Cache: 5 minutes with stale-while-revalidate.
 *
 * Публічний ендпоінт каталогу продуктів дошки вакансій.
 */

import { NextRequest, NextResponse } from "next/server";
import { JOB_PRODUCTS } from "../../../../../lib/jobs/job-board";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest): NextResponse {
  return NextResponse.json(
    {
      object: "list",
      count: JOB_PRODUCTS.length,
      data: JOB_PRODUCTS,
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
