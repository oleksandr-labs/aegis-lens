/**
 * GET /api/v1/usage/dashboard
 *
 * Returns per-meter usage data with month-cost forecast for the
 * currently authenticated user.
 *
 * Query params:
 *   ?tierId=<tier>  — optional tier override (default: free)
 *
 * Response:
 *   200 { object: "usage_dashboard", period, count, data: UsageDashboardEntry[] }
 *
 * Повертає дані дашборду використання для поточного користувача.
 */

import { NextRequest, NextResponse } from "next/server";
import { buildUsageDashboard } from "../../../../../lib/billing/usage-dashboard";

export const dynamic = "force-dynamic";

export function GET(req: NextRequest): NextResponse {
  // In production, extract userId from the session / JWT.
  // У продакшні — з сесії або JWT.
  const userId =
    req.headers.get("x-aegis-user-id") ??
    req.nextUrl.searchParams.get("userId") ??
    "anonymous";

  const tierId = req.nextUrl.searchParams.get("tierId") ?? "free";

  const data = buildUsageDashboard(userId, tierId);

  return NextResponse.json(
    {
      object: "usage_dashboard",
      period: data[0]?.period ?? null,
      count: data.length,
      data,
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Aegis-API-Version": "v1",
      },
    },
  );
}
