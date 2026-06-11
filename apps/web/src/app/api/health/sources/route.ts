import { NextResponse } from "next/server";
import { runAllChecks } from "@/lib/observability/synthetic-checks";
import { getPublicSourceHealth } from "@/lib/observability/source-health";

/**
 * GET /api/health/sources
 *
 * Returns the public-facing source health status as JSON.
 * Used by the /status page and public status badge embeds.
 */
export const dynamic = "force-dynamic";

// Allow GET requests to be cached for up to 60 s at the CDN edge
// (reduces probe frequency from public clients without hiding real outages).
export const revalidate = 60;

export async function GET(): Promise<NextResponse> {
  try {
    const results = await runAllChecks();
    const health = getPublicSourceHealth(results);

    const overall =
      health.length === 0
        ? "unknown"
        : health.every((s) => s.statusText === "Operational")
          ? "operational"
          : health.some((s) => s.statusText === "Unavailable")
            ? "outage"
            : "degraded";

    return NextResponse.json(
      {
        ok: true,
        overall,
        sources: health,
        generatedAt: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { ok: false, error: message, generatedAt: new Date().toISOString() },
      { status: 500 },
    );
  }
}
