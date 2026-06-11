/**
 * GET /api/v1/data/storage
 *
 * Returns the full catalog of Aegis Lens storage layer configurations.
 * Describes all 12 storage layers: their roles, technologies, scaling notes,
 * dev alternatives, and production deployment notes.
 *
 * Повертає повний каталог конфігурацій рівнів сховища Aegis Lens.
 * Описує всі 12 рівнів: ролі, технології, нотатки масштабування,
 * dev-альтернативи та нотатки розгортання у виробництві.
 */

import { NextRequest, NextResponse } from "next/server";
import { STORAGE_LAYER_CONFIGS } from "../../../../../lib/data/storage-config";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest): NextResponse {
  return NextResponse.json(
    {
      object: "list",
      count: STORAGE_LAYER_CONFIGS.length,
      data: STORAGE_LAYER_CONFIGS,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=300",
        "Access-Control-Allow-Origin": "*",
        "Aegis-API-Version": "v1",
      },
    },
  );
}
