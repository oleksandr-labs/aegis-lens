import { NextResponse } from "next/server";
import { ALL_CLASSES } from "@/lib/filter-config";
import { listEvents } from "@/lib/events-seed";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ipKey = `topics:${identifyRequest(req)}`;
  const rl = rateLimit(ipKey, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited", message: "Too many requests." },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders(rl),
          "Retry-After": String(rl.resetSeconds),
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  const events = listEvents();
  const counts = new Map<string, number>();
  for (const e of events) {
    counts.set(e.class, (counts.get(e.class) ?? 0) + 1);
  }

  const data = ALL_CLASSES.map((c) => ({
    id: c.id,
    label: c.label,
    count: counts.get(c.id) ?? 0,
  }));

  return NextResponse.json(
    { data },
    {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
