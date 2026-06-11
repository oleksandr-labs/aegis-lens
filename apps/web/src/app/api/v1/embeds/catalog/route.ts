/**
 * GET  /api/v1/embeds/catalog  — list all B2B embeddable product SKUs.
 *
 * Returns the full EMBED_PRODUCTS catalog so publishers and integrators
 * can programmatically discover available embed products and their pricing.
 *
 * GET повертає повний каталог B2B embed-продуктів для видавців та інтеграторів.
 */

import { NextRequest, NextResponse } from "next/server";
import { EMBED_PRODUCTS } from "../../../../../lib/embeds/b2b";

export const dynamic = "force-dynamic";

/**
 * Return all embed product SKUs.
 *
 * Response shape:
 *   { object: "list", count: number, data: EmbedProduct[] }
 *
 * Повертає всі SKU embed-продуктів.
 */
export function GET(_req: NextRequest): NextResponse {
  return NextResponse.json(
    {
      object: "list",
      count: EMBED_PRODUCTS.length,
      data: EMBED_PRODUCTS,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
        "Access-Control-Allow-Origin": "*",
        "Aegis-API-Version": "v1",
      },
    }
  );
}
