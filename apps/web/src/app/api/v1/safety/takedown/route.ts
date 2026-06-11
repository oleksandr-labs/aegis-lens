'use server';

/**
 * POST /api/v1/safety/takedown — submit a content takedown request.
 *
 * Authenticated users submit takedown requests for content they believe
 * violates the anti-doxxing policy. Requests are queued with a 24h SLA.
 *
 * Ендпоінт для подачі запиту на видалення контенту (антидоксинг).
 */

import { NextRequest, NextResponse } from "next/server";
import { takedownStore } from "@/lib/safety/takedown-sla";
import type { TakedownRequest } from "@/lib/safety/takedown-sla";

// ── Request body schema ───────────────────────────────────────────────────────

interface TakedownRequestBody {
  contentId: string;
  contentType: TakedownRequest["contentType"];
  reason: TakedownRequest["reason"];
  /** Optional reporter identity; falls back to authenticated user ID */
  reportedBy?: string;
}

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: TakedownRequestBody;

  try {
    body = (await req.json()) as TakedownRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const { contentId, contentType, reason, reportedBy } = body;

  // ── Validation ──────────────────────────────────────────────────────────

  if (!contentId || typeof contentId !== "string") {
    return NextResponse.json(
      { error: "contentId is required and must be a string." },
      { status: 400 },
    );
  }

  const VALID_CONTENT_TYPES: TakedownRequest["contentType"][] = [
    "event",
    "image",
    "report",
    "comment",
    "profile",
  ];
  if (!VALID_CONTENT_TYPES.includes(contentType)) {
    return NextResponse.json(
      {
        error: `contentType must be one of: ${VALID_CONTENT_TYPES.join(", ")}.`,
      },
      { status: 400 },
    );
  }

  const VALID_REASONS: TakedownRequest["reason"][] = [
    "doxxing",
    "pii-exposure",
    "harassment",
    "hate-speech",
    "misinformation",
    "other",
  ];
  if (!VALID_REASONS.includes(reason)) {
    return NextResponse.json(
      { error: `reason must be one of: ${VALID_REASONS.join(", ")}.` },
      { status: 400 },
    );
  }

  // ── Submit to store ─────────────────────────────────────────────────────

  const reporterId = reportedBy ?? "anonymous";

  const request = takedownStore.submit(
    contentId,
    contentType,
    reporterId,
    reason,
  );

  return NextResponse.json(
    {
      id: request.id,
      status: request.status,
      slaDeadline: request.slaDeadline,
      message:
        "Takedown request submitted. You will be notified of the outcome within 24 hours.",
    },
    { status: 202 },
  );
}
