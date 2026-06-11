/**
 * GET  /api/v1/experiments/pricing
 *   Returns the list of currently RUNNING pricing experiments.
 *   Arm details (values) are stripped — security: clients must not be able
 *   to enumerate all arms before assignment.
 *
 * POST /api/v1/experiments/pricing
 *   Body: { userId: string; experimentId: string }
 *   Returns the assigned arm for the user.
 *   Paying customers on price-axis tests always receive the control arm.
 *
 * Server-only. No arm enumeration on the client.
 *
 * Серверний ендпоінт для цінових A/B-експериментів.
 */

import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { PRICING_EXPERIMENTS, getExperiment } from "../../../../../lib/pricing-experiments/experiment-registry";
import { assignmentStore, shouldExcludeUser } from "../../../../../lib/pricing-experiments/ab-testing";

export const dynamic = "force-dynamic";

// ── Shared response headers ────────────────────────────────────────────────────

const BASE_HEADERS: Record<string, string> = {
  "Cache-Control": "no-store",
  "Aegis-API-Version": "v1",
  "Content-Type": "application/json",
};

// ── GET ────────────────────────────────────────────────────────────────────────

/**
 * Returns running experiments without arm details.
 * Safe to call from authenticated dashboards to show active tests.
 *
 * Повертає список запущених експериментів без деталей варіантів.
 */
export function GET(_req: NextRequest): NextResponse {
  const running = PRICING_EXPERIMENTS.filter((e) => e.status === "running").map((e) => ({
    id: e.id,
    axis: e.axis,
    description_en: e.description_en,
    description_uk: e.description_uk,
    armCount: e.arms.length,
    status: e.status,
    // arm `value` and arm labels are intentionally omitted
  }));

  return NextResponse.json(
    {
      object: "list",
      count: running.length,
      data: running,
    },
    { headers: BASE_HEADERS },
  );
}

// ── POST ───────────────────────────────────────────────────────────────────────

interface AssignRequest {
  userId: string;
  experimentId: string;
  /** Optional: if true, the grandfather rule excludes user from price tests */
  isPayingCustomer?: boolean;
}

/**
 * Assigns a user to an experiment arm and returns the arm id + label.
 * Never returns the arm `value` (that stays server-side).
 *
 * Призначає arm та повертає лише id і мітки (без значення).
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: AssignRequest;

  try {
    body = (await req.json()) as AssignRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400, headers: BASE_HEADERS },
    );
  }

  const { userId, experimentId, isPayingCustomer = false } = body;

  if (!userId || typeof userId !== "string") {
    return NextResponse.json(
      { error: "userId is required" },
      { status: 400, headers: BASE_HEADERS },
    );
  }

  if (!experimentId || typeof experimentId !== "string") {
    return NextResponse.json(
      { error: "experimentId is required" },
      { status: 400, headers: BASE_HEADERS },
    );
  }

  const experiment = getExperiment(experimentId);

  if (!experiment) {
    return NextResponse.json(
      { error: `Experiment "${experimentId}" not found` },
      { status: 404, headers: BASE_HEADERS },
    );
  }

  if (experiment.status !== "running") {
    return NextResponse.json(
      { error: `Experiment "${experimentId}" is not running (status: ${experiment.status})` },
      { status: 409, headers: BASE_HEADERS },
    );
  }

  // Grandfather rule: paying customers on price tests always get control arm
  if (shouldExcludeUser(userId, isPayingCustomer, experimentId)) {
    const controlArm = experiment.arms.find((a) => a.isControl);
    if (!controlArm) {
      return NextResponse.json(
        { error: "No control arm defined" },
        { status: 500, headers: BASE_HEADERS },
      );
    }
    return NextResponse.json(
      {
        userId,
        experimentId,
        armId: controlArm.id,
        label_en: controlArm.label_en,
        label_uk: controlArm.label_uk,
        isControl: true,
        grandfathered: true,
      },
      { headers: BASE_HEADERS },
    );
  }

  // Normal assignment path
  const assignment = assignmentStore.assign(userId, experimentId, experiment.arms);
  const arm = experiment.arms.find((a) => a.id === assignment.armId);

  if (!arm) {
    return NextResponse.json(
      { error: "Assignment arm not found in experiment definition" },
      { status: 500, headers: BASE_HEADERS },
    );
  }

  return NextResponse.json(
    {
      userId,
      experimentId,
      armId: arm.id,
      label_en: arm.label_en,
      label_uk: arm.label_uk,
      isControl: arm.isControl,
      grandfathered: false,
    },
    { headers: BASE_HEADERS },
  );
}
