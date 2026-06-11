/**
 * GET /api/onboarding/personas — list all personas for the persona picker
 *
 * Returns persona definitions including onboarding steps, default layers,
 * and sample saved searches. Used by the signup/onboarding persona picker UI.
 *
 * Cache: 5 min (personas change rarely).
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { listPersonas, type PersonaId } from "@ua-map/onboarding";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`onboarding:personas:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const idFilter = url.searchParams.get("id") as PersonaId | null;

  let personas = listPersonas();
  if (idFilter) {
    personas = personas.filter((p) => p.id === idFilter);
  }

  return NextResponse.json(
    { data: personas, meta: { count: personas.length } },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
