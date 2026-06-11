/**
 * GET /api/v1/addons
 *
 * Returns the canonical add-on registry as a JSON list.
 *
 * Query params:
 *   ?category=data|capability|social|ai|embed  — filter by category
 *   ?tier=<tierId>                              — filter to add-ons available at this tier or above
 *
 * Public endpoint — no authentication required.
 * Cache: 5 minutes (add-on catalogue changes rarely; invalidate on deploy).
 *
 * Публічний ендпоінт реєстру надбудов.
 * Підтримує фільтрацію за категорією та тарифом.
 */

import { NextRequest, NextResponse } from "next/server";
import { ADDONS, getAddOnsByCategory, getAddOnsForTier } from "../../../../lib/monetization/addons";
import type { AddOn } from "../../../../lib/monetization/types";

export const dynamic = "force-dynamic";

const VALID_CATEGORIES: AddOn["category"][] = [
  "data",
  "capability",
  "social",
  "ai",
  "embed",
];

export function GET(req: NextRequest): NextResponse {
  const url = req.nextUrl;
  const categoryParam = url.searchParams.get("category");
  const tierParam = url.searchParams.get("tier");

  let addons = ADDONS as AddOn[];

  // ── Filter by tier eligibility ─────────────────────────────────────────────
  if (tierParam) {
    addons = getAddOnsForTier(tierParam);
  }

  // ── Filter by category ─────────────────────────────────────────────────────
  if (categoryParam) {
    if (!VALID_CATEGORIES.includes(categoryParam as AddOn["category"])) {
      return NextResponse.json(
        {
          error: `Invalid category "${categoryParam}". Must be one of: ${VALID_CATEGORIES.join(", ")}`,
          error_uk: `Невалідна категорія "${categoryParam}". Допустимі: ${VALID_CATEGORIES.join(", ")}`,
        },
        { status: 422 }
      );
    }

    // If tier filter was already applied, further filter by category;
    // otherwise apply category filter directly via helper.
    if (tierParam) {
      addons = addons.filter((a) => a.category === categoryParam);
    } else {
      addons = getAddOnsByCategory(categoryParam as AddOn["category"]);
    }
  }

  return NextResponse.json(
    {
      object: "list",
      count: addons.length,
      data: addons,
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
