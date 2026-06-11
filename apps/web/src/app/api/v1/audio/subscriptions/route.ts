/**
 * GET  /api/v1/audio/subscriptions  — list all audio subscription products.
 *
 * Returns the full AUDIO_PRODUCTS catalog so clients can display available
 * audio subscription tiers and link to checkout flows.
 *
 * GET повертає повний каталог продуктів аудіопідписки для відображення
 * доступних рівнів та переходу до оформлення замовлення.
 */

import { NextRequest, NextResponse } from "next/server";
import { AUDIO_PRODUCTS } from "../../../../../lib/audio/podcast-sub";

export const dynamic = "force-dynamic";

/**
 * Return all audio subscription products.
 *
 * Response shape:
 *   { object: "list", count: number, data: AudioProduct[] }
 *
 * Повертає всі продукти аудіопідписки.
 */
export function GET(_req: NextRequest): NextResponse {
  return NextResponse.json(
    {
      object: "list",
      count: AUDIO_PRODUCTS.length,
      data: AUDIO_PRODUCTS,
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
