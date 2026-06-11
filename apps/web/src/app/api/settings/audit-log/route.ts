/**
 * GET /api/settings/audit-log — paginated org audit log
 *
 * Query:
 *   action=<action>     — filter by action type
 *   actorId=<id>        — filter by actor
 *   targetType=<type>   — filter by target resource type
 *   since=<ISO8601>     — start time
 *   until=<ISO8601>     — end time
 *   limit=50            — max 200
 *   offset=0
 *
 * Rate: 30/min/IP
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { queryAuditLog, type AuditAction } from "@/lib/audit-log-store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`audit-log:${ip}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action") as AuditAction | null;
  const actorId = url.searchParams.get("actorId") ?? undefined;
  const targetType = url.searchParams.get("targetType") ?? undefined;
  const targetId = url.searchParams.get("targetId") ?? undefined;
  const since = url.searchParams.get("since") ?? undefined;
  const until = url.searchParams.get("until") ?? undefined;
  const limit = parseInt(url.searchParams.get("limit") ?? "50", 10);
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);

  const result = queryAuditLog({
    orgId: "org-demo",
    action: action ?? undefined,
    actorId,
    targetType,
    targetId,
    since,
    until,
    limit: Math.min(limit, 200),
    offset: Math.max(offset, 0),
  });

  return NextResponse.json(
    {
      data: result.entries,
      meta: {
        total: result.total,
        count: result.entries.length,
        limit,
        offset,
        isDemo: true,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
