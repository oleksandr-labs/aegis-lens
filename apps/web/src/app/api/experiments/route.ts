/**
 * GET  /api/experiments — list experiments
 * POST /api/experiments — create experiment
 *
 * Query (GET):
 *   status=draft|running|paused|shipped|killed
 *
 * Rate: 60/min/IP
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { experimentRegistry } from "@/lib/experiments-store";
import type { ExperimentCreate } from "@ua-map/experiments";

export const dynamic = "force-dynamic";

const SAFETY_EXCLUDED_KEYWORDS = ["alert", "critical", "misinformation", "safety"];

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`experiments:list:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const statusFilter = url.searchParams.get("status") as Parameters<typeof experimentRegistry.list>[0];

  const experiments = experimentRegistry.list(statusFilter ?? undefined);

  return NextResponse.json(
    {
      data: experiments,
      meta: {
        count: experiments.length,
        running: experiments.filter((e) => e.status === "running").length,
        draft: experiments.filter((e) => e.status === "draft").length,
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

export async function POST(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`experiments:create:${ip}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const input = body as Partial<ExperimentCreate>;

  if (!input.name?.trim()) {
    return NextResponse.json({ error: "validation", message: "name is required" }, { status: 422 });
  }
  if (!input.variants?.length) {
    return NextResponse.json({ error: "validation", message: "variants are required" }, { status: 422 });
  }
  if (!input.hypothesis) {
    return NextResponse.json({ error: "validation", message: "hypothesis is required" }, { status: 422 });
  }

  // Safety gate: flag experiments on safety-critical features
  const nameLower = input.name.toLowerCase();
  const isSafetyExcluded = SAFETY_EXCLUDED_KEYWORDS.some((kw) => nameLower.includes(kw));
  if (isSafetyExcluded && !input.safetyExcluded) {
    return NextResponse.json(
      { error: "safety_gate", message: "Experiments on safety-critical features must set safetyExcluded:true explicitly after human review." },
      { status: 422 },
    );
  }

  try {
    const experiment = experimentRegistry.create({
      name: input.name.trim(),
      description: input.description,
      type: input.type,
      variants: input.variants,
      eligibility: input.eligibility,
      hypothesis: input.hypothesis,
      safetyExcluded: input.safetyExcluded ?? false,
    });

    return NextResponse.json(
      { data: experiment },
      {
        status: 201,
        headers: { "Access-Control-Allow-Origin": "*", ...rateLimitHeaders(rl) },
      },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown_error";
    return NextResponse.json({ error: "validation", message: msg }, { status: 422 });
  }
}
