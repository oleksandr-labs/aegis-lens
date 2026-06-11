/**
 * GET /api/internal/search-analytics
 *
 * Admin-only endpoint that returns popular queries and zero-result queries
 * from the in-memory SearchAnalyticsStore ring buffer.
 *
 * Query params:
 *   locale   — BCP-47 locale to filter by (default: "" = all locales)
 *   limit    — max entries per category (default: 20, max: 100)
 *
 * Sprint 2.70 — Search analytics.
 */

import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-gate";
import { searchAnalyticsStore } from "@/lib/search/search-analytics";

export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<NextResponse> {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json(
      { error: "forbidden", message: "Admin authentication required." },
      { status: 403 },
    );
  }

  const url = new URL(req.url);
  const locale = url.searchParams.get("locale") ?? "";
  const limitRaw = Number(url.searchParams.get("limit") ?? 20);
  const limit = Math.min(Math.max(1, limitRaw), 100);

  const popular = searchAnalyticsStore.getPopularQueries(locale, limit);
  const zeroResult = searchAnalyticsStore.getZeroResultQueries(limit, locale);
  const ctr = searchAnalyticsStore.getClickThroughRate();

  return NextResponse.json(
    {
      data: {
        popularQueries: popular,
        zeroResultQueries: zeroResult,
        clickThroughRate: Math.round(ctr * 10_000) / 100, // as percentage, 2dp
        bufferSize: searchAnalyticsStore.size,
      },
      meta: {
        locale: locale || "all",
        limit,
        generatedAt: new Date().toISOString(),
      },
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    },
  );
}
