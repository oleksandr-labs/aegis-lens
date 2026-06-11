/**
 * GET  /api/review — list review queue tasks
 * POST /api/review — submit a decision on a task
 *
 * Priority queue: sorted by priority ASC (0 = highest), then slaDeadline ASC.
 * Requires analyst authentication in production (stubbed here).
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import {
  reviewTaskStore,
  reviewDecisionStore,
  type ReviewTask,
  type ReviewTaskType,
  type ReviewTaskStatus,
  type ReviewDecisionRecord,
} from "@/lib/review-store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`review:list:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const taskType = url.searchParams.get("type") as ReviewTaskType | null;
  const status = url.searchParams.get("status") as ReviewTaskStatus | null;
  const limitRaw = url.searchParams.get("limit");
  const limit = Math.min(Number(limitRaw) || 20, 100);

  let tasks = Array.from(reviewTaskStore.values());

  const validTypes: ReviewTaskType[] = ["classify", "geolocate", "verify_media", "translate", "corroborate"];
  const validStatuses: ReviewTaskStatus[] = ["pending", "in_progress", "completed", "skipped", "escalated"];

  if (taskType && validTypes.includes(taskType)) {
    tasks = tasks.filter((t) => t.taskType === taskType);
  }
  if (status && validStatuses.includes(status)) {
    tasks = tasks.filter((t) => t.status === status);
  } else {
    // Default: only actionable tasks
    tasks = tasks.filter((t) => t.status === "pending" || t.status === "in_progress");
  }

  // Sort: priority ASC (0 = highest), then slaDeadline ASC (earliest deadline first)
  tasks.sort((a, b) => {
    const p = a.priority - b.priority;
    if (p !== 0) return p;
    const aDeadline = a.slaDeadline ? Date.parse(a.slaDeadline) : Infinity;
    const bDeadline = b.slaDeadline ? Date.parse(b.slaDeadline) : Infinity;
    return aDeadline - bDeadline;
  });

  const data = tasks.slice(0, limit);

  // Annotate overdue tasks
  const nowMs = Date.now();
  const annotated = data.map((t) => ({
    ...t,
    isOverdue: t.slaDeadline ? Date.parse(t.slaDeadline) < nowMs : false,
  }));

  return NextResponse.json(
    { data: annotated, meta: { count: annotated.length, total: tasks.length } },
    {
      headers: {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}

export async function POST(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`review:decide:${ip}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const input = body as {
    taskId?: string;
    decision?: string;
    payload?: Record<string, unknown>;
    timeSpentSec?: number;
  };

  if (!input.taskId || typeof input.taskId !== "string") {
    return NextResponse.json({ error: "validation", message: "taskId is required" }, { status: 422 });
  }

  const validDecisions = ["accept", "reject", "edit", "escalate", "skip"];
  if (!input.decision || !validDecisions.includes(input.decision)) {
    return NextResponse.json(
      { error: "validation", message: `decision must be one of: ${validDecisions.join(", ")}` },
      { status: 422 },
    );
  }

  const task = reviewTaskStore.get(input.taskId);
  if (!task) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (task.status === "completed" || task.status === "skipped") {
    return NextResponse.json({ error: "task_closed", message: "Task is already resolved" }, { status: 409 });
  }

  const now = new Date().toISOString();
  const decisionRecord: ReviewDecisionRecord = {
    decisionId: `dec_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`,
    taskId: input.taskId,
    reviewerId: "anonymous",
    decision: input.decision as ReviewDecisionRecord["decision"],
    payload: input.payload,
    timeSpentSec: typeof input.timeSpentSec === "number" ? Math.round(input.timeSpentSec) : undefined,
    createdAt: now,
  };

  // Update task status based on decision
  const newStatus: ReviewTaskStatus =
    input.decision === "escalate" ? "escalated" :
    input.decision === "skip" ? "skipped" : "completed";

  reviewTaskStore.set(input.taskId, { ...task, status: newStatus, updatedAt: now });

  const existing = reviewDecisionStore.get(input.taskId) ?? [];
  reviewDecisionStore.set(input.taskId, [...existing, decisionRecord]);

  return NextResponse.json({ data: decisionRecord }, { status: 201 });
}
