/**
 * GET /api/v1/usage/export
 *
 * Returns a CSV download of per-meter usage for the current billing period.
 * Suitable for customer finance reconciliation.
 *
 * Query params:
 *   ?period=YYYY-MM   — optional period override (default: current month)
 *   ?tierId=<tier>    — optional tier override (default: free)
 *
 * Response:
 *   200  text/csv  attachment; filename="aegis-usage-<period>.csv"
 *
 * Повертає CSV-звіт використання для поточного або вказаного місяця.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  buildMeterCsvExport,
  meterCsvToString,
} from "../../../../../lib/billing/meter-export";

export const dynamic = "force-dynamic";

export function GET(req: NextRequest): NextResponse {
  // In production, extract userId from the session / JWT.
  // У продакшні — з сесії або JWT.
  const userId =
    req.headers.get("x-aegis-user-id") ??
    req.nextUrl.searchParams.get("userId") ??
    "anonymous";

  const period = req.nextUrl.searchParams.get("period") ?? undefined;
  const tierId = req.nextUrl.searchParams.get("tierId") ?? "free";

  const rows = buildMeterCsvExport(userId, period, tierId);
  const csv = meterCsvToString(rows);

  const d = new Date();
  const resolvedPeriod =
    period ??
    `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="aegis-usage-${resolvedPeriod}.csv"`,
      "Cache-Control": "no-store",
      "Aegis-API-Version": "v1",
    },
  });
}
