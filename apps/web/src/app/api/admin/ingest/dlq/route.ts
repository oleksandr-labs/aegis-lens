/**
 * GET  /api/admin/ingest/dlq  — list DLQ entries
 * POST /api/admin/ingest/dlq/replay — replay a specific entry or batch
 * POST /api/admin/ingest/dlq/discard — discard an entry
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { problemBadRequest, problemNotFound, problemRateLimit } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

// Demo DLQ data (production: from DLQ service store)
const DEMO_DLQ = [
  {
    dlqId: "dlq-demo-001",
    reason: "adapter_error",
    sourceId: "telegram_kpszsu",
    externalId: "12345678",
    failedAt: new Date(Date.now() - 3600_000).toISOString(),
    attempts: 3,
    payload: { message_id: 12345678, text: "Demo payload" },
    error: "Connection timeout after 10000ms",
    status: "pending",
  },
  {
    dlqId: "dlq-demo-002",
    reason: "schema_validation",
    sourceId: "twitter_ukrmilitary",
    externalId: "tweet_987654",
    failedAt: new Date(Date.now() - 7200_000).toISOString(),
    attempts: 1,
    payload: { id: "tweet_987654", text: null },
    error: "Missing required field: text",
    status: "pending",
  },
  {
    dlqId: "dlq-demo-003",
    reason: "media_download_failed",
    sourceId: "telegram_kpszsu",
    failedAt: new Date(Date.now() - 86400_000).toISOString(),
    attempts: 5,
    payload: { file_id: "BQACAgIAAxkBAAI" },
    error: "HTTP 403 from media server",
    status: "discarded",
    discardedAt: new Date(Date.now() - 43200_000).toISOString(),
    discardReason: "Media no longer available",
  },
];

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`admin:dlq:list:${ip}`, 30, 60_000);
  if (!rl.ok) return problemRateLimit(undefined, rl.resetSeconds, rateLimitHeaders(rl));

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const reason = url.searchParams.get("reason");
  const sourceId = url.searchParams.get("sourceId");
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10), 100);

  let entries = DEMO_DLQ as typeof DEMO_DLQ;
  if (status) entries = entries.filter((e) => e.status === status);
  if (reason) entries = entries.filter((e) => e.reason === reason);
  if (sourceId) entries = entries.filter((e) => e.sourceId === sourceId);

  const pending = entries.filter((e) => e.status === "pending").length;
  const discarded = entries.filter((e) => e.status === "discarded").length;

  return NextResponse.json(
    {
      data: entries.slice(0, limit),
      meta: {
        total: entries.length,
        pending,
        discarded,
        generatedAt: new Date().toISOString(),
        isDemo: true,
      },
    },
    { headers: rateLimitHeaders(rl) },
  );
}
