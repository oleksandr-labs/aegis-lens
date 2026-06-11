/**
 * GET /api/events/density — event-density histogram for the timeline scrubber
 *
 * Returns bucketed counts for a time range. Used by the timeline scrubber's
 * mini-histogram and the "jump to next significant event" control.
 *
 * Query params:
 *   from      — ISO 8601 start (default: 30 days ago)
 *   to        — ISO 8601 end (default: now)
 *   buckets   — number of time buckets (default: 60, max: 720)
 *   class     — filter by event class (repeatable)
 *   region    — filter by country/oblast
 *   threshold — significance threshold 1–5 (default: 3); for "jump to next" control
 *
 * Response: array of { t: ISO8601, count: number, maxSeverity: number }
 * Cache: 60s (density changes as new events arrive).
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { listEvents, eventsInCountry } from "@/lib/events-seed";
import type { EventClass } from "@aegis/types";
import { EVENT_CLASSES } from "@aegis/types";

export const dynamic = "force-dynamic";

interface DensityBucket {
  /** ISO 8601 start of bucket */
  t: string;
  count: number;
  maxSeverity: number;
  /** true if maxSeverity ≥ threshold — used for "jump to next significant event" */
  isSignificant: boolean;
}

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`events:density:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const fromRaw = url.searchParams.get("from");
  const toRaw = url.searchParams.get("to");
  const bucketCount = Math.min(parseInt(url.searchParams.get("buckets") ?? "60", 10), 720);
  const classes = url.searchParams.getAll("class") as EventClass[];
  const region = url.searchParams.get("region");
  const threshold = parseInt(url.searchParams.get("threshold") ?? "3", 10);

  const now = Date.now();
  const fromMs = fromRaw ? Date.parse(fromRaw) : now - 30 * 24 * 3600_000;
  const toMs = toRaw ? Date.parse(toRaw) : now;

  if (!Number.isFinite(fromMs) || !Number.isFinite(toMs) || fromMs >= toMs) {
    return NextResponse.json({ error: "validation", message: "Invalid time range" }, { status: 422 });
  }

  let events = region ? eventsInCountry(region) : listEvents();

  if (classes.length > 0) {
    const valid = classes.filter((c) => (EVENT_CLASSES as readonly string[]).includes(c));
    if (valid.length > 0) events = events.filter((e) => valid.includes(e.class));
  }

  events = events.filter((e) => {
    const ms = Date.parse(e.occurredAt);
    return ms >= fromMs && ms <= toMs;
  });

  const span = toMs - fromMs;
  const bucketSize = span / bucketCount;

  const buckets: DensityBucket[] = Array.from({ length: bucketCount }, (_, i) => ({
    t: new Date(fromMs + i * bucketSize).toISOString(),
    count: 0,
    maxSeverity: 0,
    isSignificant: false,
  }));

  for (const ev of events) {
    const ms = Date.parse(ev.occurredAt);
    const idx = Math.min(Math.floor((ms - fromMs) / bucketSize), bucketCount - 1);
    if (idx >= 0) {
      buckets[idx].count += 1;
      const sev = (ev as { severity?: number }).severity ?? 1;
      if (sev > buckets[idx].maxSeverity) buckets[idx].maxSeverity = sev;
    }
  }

  for (const b of buckets) {
    b.isSignificant = b.maxSeverity >= threshold;
  }

  const significant = buckets.filter((b) => b.isSignificant);
  const total = events.length;

  return NextResponse.json(
    {
      data: buckets,
      meta: {
        total,
        from: new Date(fromMs).toISOString(),
        to: new Date(toMs).toISOString(),
        bucketSizeMs: bucketSize,
        bucketCount,
        significantBuckets: significant.length,
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
