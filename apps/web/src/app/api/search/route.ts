import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { listEvents } from "@/lib/events-seed";

export const dynamic = "force-dynamic";

const MAX_RESULTS = 50;

/**
 * GET /api/search
 *
 * Query params:
 *   q        — full-text query (required)
 *   class    — filter by event class (repeatable)
 *   severity — minimum severity (1|2|3)
 *   since    — ISO timestamp lower bound
 *   until    — ISO timestamp upper bound
 *   lat, lon, radius_km — geo filter
 *   limit    — max results (default 20, max 50)
 *   cursor   — pagination cursor
 *
 * Note: This route implements a lightweight in-memory search over seed data.
 * Production deployments connect to services/search (Elasticsearch + Qdrant).
 */
export async function GET(req: Request) {
  const ipKey = `search:${identifyRequest(req)}`;
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

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json(
      { error: "bad_request", message: "Query parameter 'q' is required." },
      { status: 400, headers: { "Access-Control-Allow-Origin": "*", ...rateLimitHeaders(rl) } },
    );
  }

  const classes = url.searchParams.getAll("class");
  const minSeverity = Number(url.searchParams.get("severity") ?? 0);
  const since = url.searchParams.get("since");
  const until = url.searchParams.get("until");
  const lat = Number(url.searchParams.get("lat") ?? NaN);
  const lon = Number(url.searchParams.get("lon") ?? NaN);
  const radiusKm = Number(url.searchParams.get("radius_km") ?? 50);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), MAX_RESULTS);
  const cursorRaw = url.searchParams.get("cursor");
  const offset = cursorRaw
    ? Number(Buffer.from(cursorRaw, "base64url").toString())
    : 0;

  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);

  let events = listEvents();

  // Text filter
  events = events.filter((e) => {
    const hay = [
      e.summary?.en ?? "",
      e.summary?.uk ?? "",
      e.class,
      e.subclass ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return terms.every((t) => hay.includes(t));
  });

  // Class filter
  if (classes.length > 0) {
    events = events.filter((e) => classes.includes(e.class));
  }

  // Severity filter
  if (minSeverity > 0) {
    events = events.filter((e) => (e.severity ?? 0) >= minSeverity);
  }

  // Date range
  if (since) {
    const ms = Date.parse(since);
    if (Number.isFinite(ms)) events = events.filter((e) => Date.parse(e.occurredAt) >= ms);
  }
  if (until) {
    const ms = Date.parse(until);
    if (Number.isFinite(ms)) events = events.filter((e) => Date.parse(e.occurredAt) <= ms);
  }

  // Geo filter
  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    events = events.filter((e) => {
      if (!e.location) return false;
      const dLat = ((e.location.lat - lat) * Math.PI) / 180;
      const dLon = ((e.location.lon - lon) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat * Math.PI) / 180) *
          Math.cos((e.location.lat * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
      const distKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return distKm <= radiusKm;
    });
  }

  const total = events.length;
  const page = events.slice(offset, offset + limit);
  const nextOffset = offset + limit;
  const nextCursor =
    nextOffset < total
      ? Buffer.from(String(nextOffset)).toString("base64url")
      : null;

  const headers = {
    "Cache-Control": "private, no-store",
    "Access-Control-Allow-Origin": "*",
    ...rateLimitHeaders(rl),
  };

  return NextResponse.json(
    {
      data: page,
      meta: {
        query: q,
        total,
        limit,
        offset,
        nextCursor,
      },
    },
    { headers },
  );
}
