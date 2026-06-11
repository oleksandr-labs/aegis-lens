/**
 * GET /api/sources/health — source health status for all monitored sources
 *
 * Returns per-source health: last seen, event volume in last 24h, SLO status.
 * Used by the public source-health page and internal monitoring dashboards.
 *
 * Cache: 60s (health status changes slowly; alert on stale readings elsewhere).
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { PUBLIC_SOURCES } from "@/lib/sources-public-seed";
import { listEvents } from "@/lib/events-seed";

export const dynamic = "force-dynamic";

type SourceHealthStatus = "healthy" | "warning" | "critical" | "unknown";

interface SourceHealth {
  sourceId: string;
  sourceName: string;
  status: SourceHealthStatus;
  lastEventAt?: string;
  hoursSinceLastEvent?: number;
  eventCount24h: number;
  /** SLO: expected minimum events per day */
  expectedDailyEvents: number;
  sloMet: boolean;
  message?: string;
}

// Expected minimum daily events per source type (rough heuristics)
const SOURCE_DAILY_FLOOR: Record<string, number> = {
  twitter: 50,
  telegram: 20,
  osint: 10,
  official: 5,
  satellite: 1,
  adsb: 30,
  ais: 10,
  weather: 5,
};

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`sources:health:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const events = listEvents();
  const cutoff24h = Date.now() - 86400_000;

  // Group events by source
  const eventsBySource = new Map<string, typeof events>();
  for (const event of events) {
    const sourceIds: string[] = event.sourceUrls?.length ? ["inferred"] : ["unknown"];
    for (const sid of sourceIds) {
      if (!eventsBySource.has(sid)) eventsBySource.set(sid, []);
      eventsBySource.get(sid)!.push(event);
    }
  }

  const now = Date.now();

  const healthResults: SourceHealth[] = PUBLIC_SOURCES.slice(0, 20).map((src, idx) => {
    // Simulate varying health based on source type
    const type = (src as Record<string, string>).type ?? "osint";
    const floor = SOURCE_DAILY_FLOOR[type] ?? 10;

    // Synthetic health simulation for demo
    const simulatedCount = Math.floor(floor * (0.5 + Math.random()));
    const simulatedLastHoursAgo = Math.floor(Math.random() * 8);
    const lastEventAt = new Date(now - simulatedLastHoursAgo * 3600_000).toISOString();

    const sloMet = simulatedCount >= floor * 0.5;
    const status: SourceHealthStatus =
      simulatedLastHoursAgo > 24 ? "critical" :
      !sloMet ? "warning" :
      simulatedLastHoursAgo > 6 ? "warning" :
      "healthy";

    return {
      sourceId: (src as Record<string, string>).id ?? `source_${idx}`,
      sourceName: (src as Record<string, string>).name ?? `Source ${idx}`,
      status,
      lastEventAt,
      hoursSinceLastEvent: simulatedLastHoursAgo,
      eventCount24h: simulatedCount,
      expectedDailyEvents: floor,
      sloMet,
      message: status === "critical"
        ? "No events received in 24h — source may be down"
        : status === "warning"
        ? "Below expected event volume"
        : undefined,
    } satisfies SourceHealth;
  });

  const summary = {
    total: healthResults.length,
    healthy: healthResults.filter((s) => s.status === "healthy").length,
    warning: healthResults.filter((s) => s.status === "warning").length,
    critical: healthResults.filter((s) => s.status === "critical").length,
    unknown: healthResults.filter((s) => s.status === "unknown").length,
  };

  return NextResponse.json(
    {
      data: healthResults,
      summary,
      meta: { updatedAt: new Date().toISOString(), isDemo: true },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
