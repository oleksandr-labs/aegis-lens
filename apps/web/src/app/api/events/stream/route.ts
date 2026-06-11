/**
 * GET /api/events/stream — Server-Sent Events (SSE) stream for real-time events
 *
 * Streams new events as they arrive (simulated with cycling interval in demo).
 * In production, this is backed by a Postgres LISTEN/NOTIFY channel or Kafka consumer.
 *
 * Protocol:
 *   event: snapshot   — sent once on connect; data: { events: AegisEvent[], timestamp }
 *   event: event      — single new/updated event; data: AegisEvent (subset)
 *   event: heartbeat  — keep-alive ping every ~15 s; data: { ts: ISO }
 *   event: info       — informational message; data: { message: string }
 *
 * Query params:
 *   class     — filter by event class (repeatable)
 *   country   — filter by country code (default: ua)
 *   severity  — min severity 1–5
 *
 * Rate: 10 concurrent connections per IP.
 *
 * https://html.spec.whatwg.org/multipage/server-sent-events.html
 */

import { NextResponse } from "next/server";
import { eventsInCountry, listEvents } from "@/lib/events-seed";
import { identifyRequest, rateLimit } from "@/lib/rate-limit";
import type { AegisEvent, EventClass } from "@aegis/types";
import { EVENT_CLASSES } from "@aegis/types";

export const dynamic = "force-dynamic";

/** Interval between synthetic live-event ticks (ms). */
const TICK_MS = 8_000;
/** How many ticks between heartbeat messages (every 2nd tick → ~16 s). */
const HEARTBEAT_EVERY = 2;
/** Max stream lifetime before forcing a reconnect (ms). */
const MAX_LIFETIME_MS = 5 * 60_000;

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  // Strict rate limit for SSE — each request holds a long-lived connection.
  const rl = rateLimit(`events:stream:${ip}`, 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const url = new URL(req.url);
  const classes = url.searchParams.getAll("class") as EventClass[];
  const country = url.searchParams.get("country") ?? "ua";
  const minSeverity = parseInt(url.searchParams.get("severity") ?? "1", 10);

  const validClasses = classes.filter((c) => (EVENT_CLASSES as readonly string[]).includes(c));

  const enc = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;

      function send(eventType: string, data: unknown): void {
        if (closed) return;
        try {
          controller.enqueue(
            enc.encode(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`),
          );
        } catch {
          closed = true;
        }
      }

      function close(): void {
        if (closed) return;
        closed = true;
        try { controller.close(); } catch { /* already closed */ }
      }

      // -----------------------------------------------------------------
      // 1. Build the filtered event pool
      // -----------------------------------------------------------------
      let pool: AegisEvent[] = country ? eventsInCountry(country) : listEvents();
      if (validClasses.length > 0) {
        pool = pool.filter((e) => validClasses.includes(e.class));
      }
      if (minSeverity > 1) {
        pool = pool.filter((e) => (e.severity ?? 1) >= minSeverity);
      }
      // Stable sort: newest first
      pool = pool.slice().sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));

      // -----------------------------------------------------------------
      // 2. Initial snapshot — all matching events
      // -----------------------------------------------------------------
      send("snapshot", { events: pool, timestamp: new Date().toISOString() });

      // -----------------------------------------------------------------
      // 3. Periodic tick: alternate between synthetic event and heartbeat
      // -----------------------------------------------------------------
      let counter = 0;
      const tick = setInterval(() => {
        counter++;

        if (counter % HEARTBEAT_EVERY === 0) {
          // Heartbeat
          send("heartbeat", { ts: new Date().toISOString() });
        } else {
          // Synthetic live event — cycle through pool by modulo
          if (pool.length === 0) return;
          const template = pool[counter % pool.length]!;
          const liveEvent: Partial<AegisEvent> & {
            eventId: string;
            occurredAt: string;
          } = {
            eventId: `LIVE-${Date.now()}`,
            class: template.class,
            location: template.location,
            dangerScore: template.dangerScore,
            confidence: template.confidence,
            occurredAt: new Date().toISOString(),
            summary: template.summary,
            verificationState: template.verificationState,
            severity: template.severity,
          };
          send("event", liveEvent);
        }
      }, TICK_MS);

      // -----------------------------------------------------------------
      // 4. Max-lifetime guard — force reconnect so connections don't hang
      // -----------------------------------------------------------------
      const lifetime = setTimeout(() => {
        clearInterval(tick);
        send("info", { message: "Stream refreshed. Reconnecting…" });
        close();
      }, MAX_LIFETIME_MS);

      // -----------------------------------------------------------------
      // 5. Cleanup on client disconnect
      // -----------------------------------------------------------------
      req.signal.addEventListener("abort", () => {
        clearInterval(tick);
        clearTimeout(lifetime);
        close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-store, no-transform",
      "connection": "keep-alive",
      "x-accel-buffering": "no",
      "access-control-allow-origin": "*",
    },
  });
}
