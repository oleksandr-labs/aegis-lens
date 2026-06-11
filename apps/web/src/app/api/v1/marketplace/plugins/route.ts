/**
 * GET  /api/v1/marketplace/plugins — Search the plugin marketplace.
 * POST /api/v1/marketplace/plugins — Submit a plugin for review.
 *
 * GET accepts query parameters mapped to MarketplaceSearchQuery:
 *   q, categories (comma-separated), pricing, verifiedOnly, sort, page, pageSize
 *
 * POST expects a JSON body: { pluginId, developerId, version }
 * Creates a draft submission and transitions it to "submitted".
 *
 * GET: пошук плагінів за параметрами запиту.
 * POST: подача плагіну на ревʼю (JSON body).
 */

import { NextRequest, NextResponse } from "next/server";
import { searchPlugins } from "../../../../../lib/marketplace/search";
import { MarketplaceCategory } from "../../../../../lib/marketplace/search";
import { submissionStore } from "../../../../../lib/marketplace/submission";

export const dynamic = "force-dynamic";

// ── GET ───────────────────────────────────────────────────────────────────────

export function GET(req: NextRequest): NextResponse {
  const sp = req.nextUrl.searchParams;

  const rawCategories = sp.get("categories");
  const categories = rawCategories
    ? (rawCategories.split(",").filter(Boolean) as MarketplaceCategory[])
    : undefined;

  const rawPricing = sp.get("pricing");
  const pricing =
    rawPricing === "free" || rawPricing === "paid" || rawPricing === "subscription"
      ? rawPricing
      : undefined;

  const rawSort = sp.get("sort");
  const sort =
    rawSort === "installs" || rawSort === "rating" || rawSort === "newest" || rawSort === "name"
      ? rawSort
      : undefined;

  const result = searchPlugins({
    q: sp.get("q") ?? undefined,
    categories,
    pricing,
    verifiedOnly: sp.get("verifiedOnly") === "true",
    sort,
    page: sp.get("page") ? Number(sp.get("page")) : undefined,
    pageSize: sp.get("pageSize") ? Number(sp.get("pageSize")) : undefined,
  });

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, max-age=60, stale-while-revalidate=30",
      "Aegis-API-Version": "v1",
    },
  });
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: { pluginId?: string; developerId?: string; version?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { pluginId, developerId, version } = body;
  if (!pluginId || !developerId || !version) {
    return NextResponse.json(
      { error: "Required fields: pluginId, developerId, version." },
      { status: 400 },
    );
  }

  const draft = submissionStore.createDraft(pluginId, developerId, version);
  const submitted = submissionStore.submit(draft.id);

  return NextResponse.json(
    { object: "submission", data: submitted },
    {
      status: 201,
      headers: { "Aegis-API-Version": "v1" },
    },
  );
}
