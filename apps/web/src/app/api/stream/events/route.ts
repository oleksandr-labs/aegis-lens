/**
 * GET /api/stream/events?region=UA-30
 *
 * SSE endpoint — streams new Aegis Lens events for the requested region.
 *
 * Query params:
 *   region    — oblast code filter (e.g. "UA-30") — optional (all regions if omitted)
 *   lastId    — Last-Event-ID for reconnect (resume from event)
 *
 * Client usage:
 *   const es = new EventSource("/api/stream/events?region=UA-30");
 *   es.addEventListener("event", (e) => console.log(JSON.parse(e.data)));
 *   es.addEventListener("heartbeat", () => {}); // keepalive
 *
 * SSE-ендпоінт для потоку подій у реальному часі за регіоном.
 */

import { EventChannel, createSseResponse } from "@/lib/realtime/sse";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const region = url.searchParams.get("region");

  const subscriberId = `events:${randomUUID()}`;

  async function* filteredGenerator() {
    const gen = EventChannel.toGenerator(subscriberId, req.signal);

    // Send a synthetic "connected" event
    yield {
      event: "connected",
      data: {
        subscriberId,
        region: region ?? "all",
        serverTime: new Date().toISOString(),
      },
    };

    for await (const event of gen) {
      // Filter by region if requested
      if (
        region &&
        event.event !== "heartbeat" &&
        (event.data as { region?: string })?.region !== region
      ) {
        continue;
      }
      yield { ...event, event: event.event ?? "event" };
    }
  }

  return createSseResponse(filteredGenerator(), req.signal);
}
