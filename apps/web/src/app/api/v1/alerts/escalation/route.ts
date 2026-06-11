/**
 * GET  /api/v1/alerts/escalation — list escalation policies for an org
 * POST /api/v1/alerts/escalation — create a new escalation policy
 *
 * GET  /api/v1/alerts/escalation — список ескалаційних політик організації
 * POST /api/v1/alerts/escalation — створити нову ескалаційну політику
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  escalationPolicyStore,
} from "@/../../services/alerts/src/escalation-policy";
import type {
  EscalationLevel,
  OnCallShift,
} from "@/../../services/alerts/src/escalation-policy";

export const dynamic = "force-dynamic";

// ── GET ───────────────────────────────────────────────────────────────────────

export function GET(req: NextRequest): NextResponse {
  const orgId = req.nextUrl.searchParams.get("orgId");

  if (!orgId) {
    return NextResponse.json(
      {
        error: "Missing required query parameter: orgId",
        note_en: "Pass ?orgId=<id> to list escalation policies for your organisation.",
        note_uk: "Передайте ?orgId=<id> для перегляду ескалаційних політик вашої організації.",
      },
      { status: 400 },
    );
  }

  const policies = escalationPolicyStore.listByOrg(orgId);
  return NextResponse.json({ policies, count: policies.length }, { status: 200 });
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Body must be a JSON object" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;

  // Required fields validation
  if (typeof data.orgId !== "string" || !data.orgId) {
    return NextResponse.json({ error: "orgId (string) is required" }, { status: 422 });
  }
  if (typeof data.name !== "string" || !data.name) {
    return NextResponse.json({ error: "name (string) is required" }, { status: 422 });
  }
  if (!Array.isArray(data.levels) || data.levels.length === 0) {
    return NextResponse.json(
      { error: "levels (non-empty array of EscalationLevel) is required" },
      { status: 422 },
    );
  }

  // Validate level entries
  for (const lvl of data.levels as unknown[]) {
    const l = lvl as Record<string, unknown>;
    if (
      typeof l.level !== "number" ||
      l.level < 1 ||
      l.level > 4 ||
      !Array.isArray(l.targets)
    ) {
      return NextResponse.json(
        { error: "Each level must have: level (1–4), timeoutMinutes (number|null), targets (string[])" },
        { status: 422 },
      );
    }
  }

  const policy = escalationPolicyStore.upsert({
    policyId: typeof data.policyId === "string" ? data.policyId : undefined,
    orgId: data.orgId as string,
    name: data.name as string,
    levels: data.levels as EscalationLevel[],
    rotations: Array.isArray(data.rotations)
      ? (data.rotations as OnCallShift[])
      : [],
  });

  return NextResponse.json(
    {
      ok: true,
      policy,
      note_en: "Escalation policy created. Test it before an incident using the simulate endpoint.",
      note_uk: "Ескалаційну політику створено. Перевірте її перед інцидентом за допомогою ендпоінту симуляції.",
    },
    { status: 201 },
  );
}
