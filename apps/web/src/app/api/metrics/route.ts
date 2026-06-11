import { NextRequest, NextResponse } from "next/server";
import { metricsRegistry } from "@/lib/observability/metrics";

/**
 * GET /api/metrics
 *
 * Prometheus scrape endpoint.
 * Protected by Bearer token — set METRICS_SECRET env var.
 * Returns text/plain in Prometheus exposition format (version 0.0.4).
 */
export const dynamic = "force-dynamic";

export function GET(req: NextRequest): NextResponse {
  const secret = process.env.METRICS_SECRET;

  if (secret) {
    const auth = req.headers.get("authorization") ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (token !== secret) {
      return new NextResponse("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": 'Bearer realm="Aegis metrics"' },
      });
    }
  }

  const body = metricsRegistry.toPrometheusText();

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
