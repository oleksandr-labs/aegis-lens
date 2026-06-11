/**
 * GET /api/v1/insurance/risk-score
 *
 * Returns the full catalogue of Aegis Lens insurance and risk data products.
 *
 * Response:
 *   200  { object: "list", count: number, data: InsuranceProduct[] }
 *
 * Повертає каталог страхових і ризикових продуктів Aegis Lens.
 */

import { NextRequest, NextResponse } from "next/server";
import { INSURANCE_PRODUCTS } from "../../../../../lib/insurance/risk-products";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest): NextResponse {
  return NextResponse.json(
    {
      object: "list",
      count: INSURANCE_PRODUCTS.length,
      data: INSURANCE_PRODUCTS,
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

export function OPTIONS(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
