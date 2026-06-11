import { NextResponse } from "next/server";
import { listEvents } from "@/lib/events-seed";
import { PUBLIC_SOURCES } from "@/lib/sources-public-seed";
import { listInvestigations } from "@/lib/investigations-seed";
import { listReports } from "@/lib/reports-seed";
import { listThreats } from "@/lib/threats-seed";

export const dynamic = "force-dynamic";

/**
 * `/api/health` — JSON status payload for monitoring + uptime probes.
 * Returns 200 with body always (probe pattern). Consumers should treat
 * any non-2xx OR a body with `status !== "ok"` as a failure signal.
 */
export async function GET() {
  const ev = listEvents();
  const now = Date.now();
  const recent24h = ev.filter((e) => now - Date.parse(e.occurredAt) <= 86_400_000).length;
  const recent7d = ev.filter((e) => now - Date.parse(e.occurredAt) <= 7 * 86_400_000).length;

  const body = {
    status: "ok",
    service: "aegis-web",
    version: "0.0.1",
    ts: new Date().toISOString(),
    region: process.env.VERCEL_REGION ?? null,
    runtime: process.env.NEXT_RUNTIME ?? "nodejs",
    data: {
      events: { total: ev.length, last24h: recent24h, last7d: recent7d },
      sources: PUBLIC_SOURCES.length,
      investigations: listInvestigations().length,
      reports: listReports().length,
      threats: listThreats().length,
    },
    llm: {
      anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    },
  };

  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "no-store, no-transform",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
