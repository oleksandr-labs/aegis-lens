/**
 * GET  /api/review/queue          — list HITL review items (priority-ordered)
 * POST /api/review/queue/claim    — claim next item for a reviewer
 * POST /api/review/queue/resolve  — resolve an item with a verdict
 *
 * The review queue surfaces low-confidence / disputed / high-impact events
 * for human verification. Priority = danger × uncertainty × freshness.
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { problemRateLimit, problemBadRequest } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

type ReviewReason =
  | "low_confidence" | "source_disagreement" | "single_source_high_severity"
  | "manipulation_flag" | "geo_uncertain" | "user_reported" | "random_audit";

interface ReviewItem {
  reviewId: string;
  eventId: string;
  currentState: string;
  reasons: ReviewReason[];
  priority: number;
  signals: { dangerScore: number; confidence: number; sourceCount: number; ageMinutes: number };
  status: "pending" | "in_review" | "resolved";
  createdAt: string;
}

// Demo queue (production: from verify service reviewQueue store)
const DEMO_QUEUE: ReviewItem[] = [
  {
    reviewId: "rev-demo-001",
    eventId: "evt-3201",
    currentState: "enriched",
    reasons: ["single_source_high_severity", "low_confidence"],
    priority: 87,
    signals: { dangerScore: 82, confidence: 0.42, sourceCount: 1, ageMinutes: 12 },
    status: "pending",
    createdAt: new Date(Date.now() - 12 * 60_000).toISOString(),
  },
  {
    reviewId: "rev-demo-002",
    eventId: "evt-3198",
    currentState: "enriched",
    reasons: ["source_disagreement"],
    priority: 64,
    signals: { dangerScore: 58, confidence: 0.55, sourceCount: 3, ageMinutes: 45 },
    status: "pending",
    createdAt: new Date(Date.now() - 45 * 60_000).toISOString(),
  },
  {
    reviewId: "rev-demo-003",
    eventId: "evt-3185",
    currentState: "enriched",
    reasons: ["manipulation_flag", "geo_uncertain"],
    priority: 71,
    signals: { dangerScore: 66, confidence: 0.38, sourceCount: 2, ageMinutes: 90 },
    status: "in_review",
    createdAt: new Date(Date.now() - 90 * 60_000).toISOString(),
  },
];

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`review:queue:${ip}`, 60, 60_000);
  if (!rl.ok) return problemRateLimit(undefined, rl.resetSeconds, rateLimitHeaders(rl));

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10), 100);

  let items = DEMO_QUEUE;
  if (status) items = items.filter((i) => i.status === status);
  items = [...items].sort((a, b) => b.priority - a.priority).slice(0, limit);

  return NextResponse.json(
    {
      data: items,
      meta: {
        pending: DEMO_QUEUE.filter((i) => i.status === "pending").length,
        inReview: DEMO_QUEUE.filter((i) => i.status === "in_review").length,
        avgPriority: Math.round(
          DEMO_QUEUE.filter((i) => i.status === "pending").reduce((s, i) => s + i.priority, 0) /
            Math.max(1, DEMO_QUEUE.filter((i) => i.status === "pending").length),
        ),
        generatedAt: new Date().toISOString(),
        isDemo: true,
      },
    },
    { headers: rateLimitHeaders(rl) },
  );
}

export async function POST(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`review:queue:post:${ip}`, 60, 60_000);
  if (!rl.ok) return problemRateLimit(undefined, rl.resetSeconds, rateLimitHeaders(rl));

  const body = (await req.json().catch(() => ({}))) as {
    action?: "claim" | "resolve";
    reviewId?: string;
    reviewer?: string;
    verdict?: "verify" | "dispute" | "retract" | "needs_more_info";
    notes?: string;
  };

  if (body.action === "claim") {
    const next = DEMO_QUEUE.find((i) => i.status === "pending");
    if (!next) return NextResponse.json({ data: null, message: "Queue empty" });
    return NextResponse.json({ data: { ...next, status: "in_review", assignedTo: body.reviewer ?? "anon" } });
  }

  if (body.action === "resolve") {
    if (!body.reviewId || !body.verdict) {
      return problemBadRequest("reviewId and verdict are required to resolve");
    }
    return NextResponse.json({
      data: {
        reviewId: body.reviewId,
        status: "resolved",
        verdict: body.verdict,
        resolvedAt: new Date().toISOString(),
      },
    });
  }

  return problemBadRequest("action must be 'claim' or 'resolve'");
}
