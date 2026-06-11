/**
 * GET /api/anomalies — list detected anomalies
 *
 * Query params:
 *   severity — info | warning | critical
 *   acknowledged — true | false (default: false)
 *   region — ISO 3166-2 code
 *   limit — max results (default: 20)
 *
 * POST /api/anomalies/:id/acknowledge — acknowledge an alert
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { problemBadRequest, problemRateLimit } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

// Demo anomaly data (in production: from services/anomaly alert-generator store)
const DEMO_ANOMALIES = [
  {
    alertId: "anom-demo-001",
    type: "time_series_spike",
    severity: "critical",
    regionCode: "UA-63",
    eventClass: "drone",
    triggerSignals: [{ source: "z_score", value: 4.8, threshold: 2.0 }],
    explanationEn: "Spike detected: drone events in UA-63 are 4.8× above baseline.",
    explanationUk: "Пік виявлено: події класу drone в UA-63 у 4.8× перевищують базову лінію.",
    detectedAt: new Date(Date.now() - 1800_000).toISOString(),
    eventCount: 24,
    baselineCount: 5,
    acknowledged: false,
  },
  {
    alertId: "anom-demo-002",
    type: "source_burst",
    severity: "warning",
    regionCode: "UA-14",
    eventClass: "ground_combat",
    triggerSignals: [{ source: "hhi", value: 0.72, threshold: 0.5 }],
    explanationEn: "Source diversity collapse in UA-14 (ground_combat): single channel dominates — possible coordinated posting.",
    explanationUk: "Колапс різноманітності джерел у UA-14 (ground_combat): одне джерело домінує.",
    detectedAt: new Date(Date.now() - 3600_000).toISOString(),
    acknowledged: false,
  },
  {
    alertId: "anom-demo-003",
    type: "spatial_surge",
    severity: "warning",
    regionCode: "UA-23",
    eventClass: "explosion",
    triggerSignals: [{ source: "z_score", value: 2.9, threshold: 2.0 }],
    explanationEn: "Geographic cluster of explosion events detected in UA-23.",
    explanationUk: "Виявлено географічний кластер подій класу explosion в UA-23.",
    detectedAt: new Date(Date.now() - 7200_000).toISOString(),
    eventCount: 8,
    baselineCount: 2,
    acknowledged: true,
    acknowledgedBy: "user-analyst-001",
    acknowledgedAt: new Date(Date.now() - 5400_000).toISOString(),
  },
];

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`anomalies:list:${ip}`, 60, 60_000);
  if (!rl.ok) return problemRateLimit(undefined, rl.resetSeconds, rateLimitHeaders(rl));

  const url = new URL(req.url);
  const severityFilter = url.searchParams.get("severity");
  const acknowledgedFilter = url.searchParams.get("acknowledged");
  const regionFilter = url.searchParams.get("region");
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10), 100);

  let results = DEMO_ANOMALIES as typeof DEMO_ANOMALIES;

  if (severityFilter) results = results.filter((a) => a.severity === severityFilter);
  if (acknowledgedFilter !== null) {
    results = results.filter((a) => a.acknowledged === (acknowledgedFilter === "true"));
  }
  if (regionFilter) results = results.filter((a) => a.regionCode === regionFilter);

  const page = results.slice(0, limit);

  return NextResponse.json(
    {
      data: page,
      meta: {
        total: results.length,
        critical: results.filter((a) => a.severity === "critical").length,
        warning: results.filter((a) => a.severity === "warning").length,
        unacknowledged: results.filter((a) => !a.acknowledged).length,
        generatedAt: new Date().toISOString(),
        isDemo: true,
      },
    },
    { headers: { "Cache-Control": "no-store", ...rateLimitHeaders(rl) } },
  );
}
