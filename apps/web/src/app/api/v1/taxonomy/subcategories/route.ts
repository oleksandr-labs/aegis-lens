/**
 * GET /api/v1/taxonomy/subcategories
 * Returns all subcategories, or filtered by ?domain= query param.
 * Cached for 24 hours.
 *
 * Query params:
 *   domain — optional; filter by parentDomain (e.g. "Military & Defense")
 */

import { NextResponse } from "next/server";
import {
  SUBCATEGORIES,
  SUBCATEGORY_HUB_NOTE_EN,
  SUBCATEGORY_HUB_NOTE_UK,
  getSubcategoriesByDomain,
} from "@/lib/taxonomy/subcategories";

export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<NextResponse> {
  const url = new URL(req.url);
  const domain = url.searchParams.get("domain")?.trim();

  const data = domain ? getSubcategoriesByDomain(domain) : SUBCATEGORIES;

  return NextResponse.json(
    {
      subcategories: data,
      total: data.length,
      note: {
        en: SUBCATEGORY_HUB_NOTE_EN,
        uk: SUBCATEGORY_HUB_NOTE_UK,
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
