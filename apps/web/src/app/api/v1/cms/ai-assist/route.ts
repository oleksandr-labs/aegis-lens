/**
 * POST /api/v1/cms/ai-assist
 * Accepts an AI assist request, runs a stub generation, enqueues for human review.
 *
 * POST /api/v1/cms/ai-assist
 * Приймає запит AI assist, виконує заглушку генерації, ставить у чергу перевірки.
 */

import { type NextRequest, NextResponse } from "next/server";

import {
  aiAssistStore,
  AI_ASSIST_HUMAN_REVIEW_REQUIRED,
  type AiAssistRequest,
  type AiAssistResult,
} from "@/lib/cms/ai-assist";

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const req = body as Partial<AiAssistRequest>;

  if (!req.action || !req.input || !req.userId) {
    return NextResponse.json(
      { error: "Missing required fields: action, input, userId" },
      { status: 400 },
    );
  }

  // Stub generation — replace with real LLM call in production
  // Заглушка генерації — замінити на реальний виклик LLM у продакшні
  const output = `[AI stub] ${req.action} result for: ${req.input.slice(0, 80)}...`;

  const result: AiAssistResult = {
    action: req.action,
    output,
    confidence: 0.7,
    requiresHumanReview: AI_ASSIST_HUMAN_REVIEW_REQUIRED,
    generatedAt: new Date().toISOString(),
  };

  const reviewId = aiAssistStore.enqueue(result);

  return NextResponse.json(
    {
      reviewId,
      result,
      message:
        "AI output enqueued. A human reviewer must approve before it can be published.",
    },
    { status: 201 },
  );
}

export async function GET(): Promise<NextResponse> {
  const pending = aiAssistStore.listPending();
  return NextResponse.json({ pending });
}
