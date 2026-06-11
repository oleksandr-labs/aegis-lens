/**
 * GET /api/stream/alerts?oblast=UA-30
 *
 * SSE endpoint — streams air raid alerts and critical notifications
 * for the requested oblast (Ukrainian administrative region).
 *
 * Query params:
 *   oblast   — oblast code (e.g. "UA-30" for Odessa). Multiple: ?oblast=UA-30&oblast=UA-05
 *             Omit for all oblasts.
 *   severity — optional filter: "low" | "medium" | "high" | "critical"
 *
 * Client usage:
 *   const es = new EventSource("/api/stream/alerts?oblast=UA-30");
 *   es.addEventListener("alert", (e) => showAlertBanner(JSON.parse(e.data)));
 *
 * SSE-ендпоінт для потоку сповіщень (повітряна тривога та ін.) за областю.
 */

import { AlertChannel, createSseResponse } from "@/lib/realtime/sse";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

type SeverityLevel = "low" | "medium" | "high" | "critical";

const SEVERITY_ORDER: Record<SeverityLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const oblasts = url.searchParams.getAll("oblast");
  const minSeverity = (url.searchParams.get("severity") ?? "low") as SeverityLevel;
  const minSeverityLevel = SEVERITY_ORDER[minSeverity] ?? 0;

  const subscriberId = `alerts:${randomUUID()}`;

  async function* filteredAlerts() {
    const gen = AlertChannel.toGenerator(subscriberId, req.signal);

    // Send confirmation of subscription
    yield {
      event: "subscribed",
      data: {
        subscriberId,
        oblasts: oblasts.length > 0 ? oblasts : ["all"],
        minSeverity,
        serverTime: new Date().toISOString(),
      },
    };

    for await (const event of gen) {
      if (event.event === "heartbeat") {
        yield event;
        continue;
      }

      const alertData = event.data as {
        oblast?: string;
        severity?: SeverityLevel;
      };

      // Filter by oblast
      if (oblasts.length > 0 && alertData?.oblast) {
        if (!oblasts.includes(alertData.oblast)) continue;
      }

      // Filter by minimum severity
      const severity = alertData?.severity as SeverityLevel | undefined;
      if (severity && SEVERITY_ORDER[severity] < minSeverityLevel) continue;

      yield { ...event, event: "alert" };
    }
  }

  return createSseResponse(filteredAlerts(), req.signal);
}
