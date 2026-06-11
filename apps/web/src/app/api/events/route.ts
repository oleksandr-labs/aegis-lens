import { NextResponse } from "next/server";
import { EVENT_CLASSES, type EventClass } from "@aegis/types";
import { listEvents, eventsInCountry } from "@/lib/events-seed";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export async function GET(req: Request) {
  const ipKey = `events:${identifyRequest(req)}`;
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
  const country = url.searchParams.get("country");
  const classes = url.searchParams.getAll("class") as EventClass[];
  const sinceRaw = url.searchParams.get("since");
  const hoursRaw = url.searchParams.get("hours");
  const limitRaw = url.searchParams.get("limit");
  const minSeverity = Number(url.searchParams.get("minSeverity") ?? 0);
  const minConfidence = Number(url.searchParams.get("minConfidence") ?? 0);
  const verification = url.searchParams.get("verification") ?? "";
  const minDanger = Number(url.searchParams.get("minDanger") ?? 0);
  const hasMedia = url.searchParams.get("hasMedia") ?? "";

  let events = country ? eventsInCountry(country) : listEvents();

  if (classes.length > 0) {
    const valid = classes.filter((c) => (EVENT_CLASSES as readonly string[]).includes(c));
    if (valid.length > 0) {
      events = events.filter((e) => valid.includes(e.class));
    }
  }

  if (Number.isFinite(minSeverity) && minSeverity > 0) {
    events = events.filter((e) => (e.severity ?? 0) >= minSeverity);
  }

  if (Number.isFinite(minConfidence) && minConfidence > 0) {
    // minConfidence is passed as 0–100 from the client; confidence is stored as 0–1.
    events = events.filter((e) => (e.confidence ?? 0) * 100 >= minConfidence);
  }

  if (verification !== "") {
    events = events.filter((e) => e.verificationState === verification);
  }

  if (Number.isFinite(minDanger) && minDanger > 0) {
    events = events.filter((e) => ((e as Record<string, unknown>).dangerScore as number | undefined ?? 0) >= minDanger);
  }

  // hasMedia: seed data does not have a media field yet — filter is a no-op for now
  // but we validate the param so it's ready when media fields are added.
  if (hasMedia && ["image", "video", "satellite"].includes(hasMedia)) {
    events = events.filter((e) => {
      const media = (e as Record<string, unknown>).media as string[] | undefined;
      return Array.isArray(media) && media.includes(hasMedia);
    });
  }

  if (sinceRaw) {
    const sinceMs = Date.parse(sinceRaw);
    if (Number.isFinite(sinceMs)) {
      events = events.filter((e) => Date.parse(e.occurredAt) >= sinceMs);
    }
  } else if (hoursRaw) {
    const hours = Number(hoursRaw);
    if (Number.isFinite(hours) && hours > 0) {
      const cutoff = Date.now() - hours * 3600 * 1000;
      events = events.filter((e) => Date.parse(e.occurredAt) >= cutoff);
    }
  }

  // Stable order: occurredAt desc, eventId desc (tiebreaker).
  events = events.slice().sort((a, b) => {
    const t = Date.parse(b.occurredAt) - Date.parse(a.occurredAt);
    if (t !== 0) return t;
    return b.eventId.localeCompare(a.eventId);
  });

  const total = events.length;

  // Cursor: base64url of `${occurredAt}|${eventId}` of the LAST returned item.
  // Next page starts at items strictly older than the cursor.
  const cursorRaw = url.searchParams.get("cursor");
  if (cursorRaw) {
    try {
      const decoded = Buffer.from(cursorRaw, "base64url").toString("utf8");
      const [occurredAt, eventId] = decoded.split("|");
      const cursorMs = Date.parse(occurredAt);
      if (Number.isFinite(cursorMs)) {
        events = events.filter((e) => {
          const ms = Date.parse(e.occurredAt);
          if (ms < cursorMs) return true;
          if (ms === cursorMs) return e.eventId.localeCompare(eventId) < 0;
          return false;
        });
      }
    } catch {
      // Invalid cursor → ignore (treat as first page).
    }
  }

  let limit = Number(limitRaw);
  if (!Number.isFinite(limit) || limit <= 0) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  const data = events.slice(0, limit);
  const last = data[data.length - 1];
  const hasMore = events.length > data.length;
  const nextCursor =
    hasMore && last
      ? Buffer.from(`${last.occurredAt}|${last.eventId}`, "utf8").toString("base64url")
      : null;

  // RFC 5988 Link header for HATEOAS-style clients. Echoes the current request's
  // filters so the `next` URL is directly fetchable.
  const headers: Record<string, string> = {
    "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Expose-Headers": "Link, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset",
    ...rateLimitHeaders(rl),
  };
  if (nextCursor) {
    const next = new URL(req.url);
    next.searchParams.set("cursor", nextCursor);
    next.searchParams.set("limit", String(limit));
    headers["Link"] = `<${next.pathname}${next.search}>; rel="next"`;
  }

  return NextResponse.json(
    {
      data,
      meta: {
        count: data.length,
        total,
        hasMore,
        nextCursor,
      },
    },
    { headers },
  );
}
