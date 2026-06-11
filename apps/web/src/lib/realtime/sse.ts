/**
 * Server-Sent Events (SSE) channel factory.
 *
 * SSE provides a lightweight, one-directional server → client push channel.
 * Used for:
 *   - Real-time event feed per region/layer
 *   - Air raid alert push notifications
 *   - Map layer update notifications
 *   - Report generation progress
 *
 * Why SSE over WebSocket:
 *   - Works through HTTP/2 multiplexing without a separate upgrade
 *   - Native browser EventSource API (no library needed client-side)
 *   - Automatic reconnection handled by the browser
 *   - Simpler to proxy through Cloudflare / nginx than WS
 *
 * SSE-канал для реального часу: events, alerts, оновлення шарів.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SseEvent<T = unknown> {
  /** SSE event type. Maps to EventSource.addEventListener(type, ...). */
  event?: string;
  /** Serialisable data payload. */
  data: T;
  /** Optional event ID for reconnect "Last-Event-ID" support. */
  id?: string;
  /** Retry interval hint in milliseconds. */
  retry?: number;
}

export interface SseChannel<T = unknown> {
  /** Push an event to all connected clients. */
  push(event: SseEvent<T>): void;
  /** Number of active connections. */
  readonly connectionCount: number;
}

// ── SSE Response factory ──────────────────────────────────────────────────────

/**
 * Creates a Next.js App Router compatible SSE Response from an async generator.
 *
 * @param generator - An async generator that yields SseEvent objects.
 *                    The response closes when the generator returns.
 * @param signal    - Optional AbortSignal (from the request) to cancel on disconnect.
 * @returns A streaming Response with Content-Type: text/event-stream.
 *
 * Створює SSE Response з async generator.
 */
export function createSseResponse<T>(
  generator: AsyncGenerator<SseEvent<T>>,
  signal?: AbortSignal,
): Response {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial keepalive comment
      controller.enqueue(encoder.encode(": connected\n\n"));

      try {
        for await (const event of generator) {
          if (signal?.aborted) break;

          let chunk = "";
          if (event.id) chunk += `id: ${event.id}\n`;
          if (event.event) chunk += `event: ${event.event}\n`;
          if (event.retry) chunk += `retry: ${event.retry}\n`;
          chunk += `data: ${JSON.stringify(event.data)}\n\n`;

          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        if (
          err instanceof Error &&
          err.name !== "AbortError" &&
          !signal?.aborted
        ) {
          console.error("[sse] Generator error:", err.message);
        }
      } finally {
        controller.close();
      }
    },

    cancel() {
      // Client disconnected — generator will be GC'd
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // disable nginx buffering
      "Access-Control-Allow-Origin": "*",
    },
  });
}

// ── SseEventEmitter ───────────────────────────────────────────────────────────

type Listener<T> = (event: SseEvent<T>) => void;

/**
 * In-process broadcast SSE emitter.
 * One emitter can have multiple subscribers (one per connected client).
 *
 * For multi-process deployments, replace the in-process Map with
 * Redis Pub/Sub (see redis.ts) — subscribe in each process, emit globally.
 *
 * SSE-емітер для розсилки подій усім підключеним клієнтам.
 */
export class SseEventEmitter<T = unknown> implements SseChannel<T> {
  private readonly listeners = new Map<string, Listener<T>>();

  /** Add a subscriber. Returns an unsubscribe function. */
  subscribe(id: string, listener: Listener<T>): () => void {
    this.listeners.set(id, listener);
    return () => this.listeners.delete(id);
  }

  /** Broadcast an event to all subscribers. */
  push(event: SseEvent<T>): void {
    for (const listener of this.listeners.values()) {
      try {
        listener(event);
      } catch {
        // Don't let one bad listener break the rest
      }
    }
  }

  get connectionCount(): number {
    return this.listeners.size;
  }

  /**
   * Creates an async generator that yields events from this emitter.
   * Use with createSseResponse():
   *   createSseResponse(emitter.toGenerator(id, signal))
   */
  async *toGenerator(
    subscriberId: string,
    signal?: AbortSignal,
  ): AsyncGenerator<SseEvent<T>> {
    let resolve: (event: SseEvent<T>) => void;
    const queue: SseEvent<T>[] = [];

    const unsubscribe = this.subscribe(subscriberId, (event) => {
      if (resolve) {
        const r = resolve;
        resolve = undefined as unknown as typeof resolve;
        r(event);
      } else {
        queue.push(event);
      }
    });

    // Keepalive heartbeat every 25 seconds
    const heartbeatInterval = setInterval(() => {
      if (resolve) {
        const r = resolve;
        resolve = undefined as unknown as typeof resolve;
        r({ event: "heartbeat", data: { ts: Date.now() } as unknown as T });
      }
    }, 25_000);

    try {
      while (!signal?.aborted) {
        if (queue.length > 0) {
          yield queue.shift()!;
          continue;
        }
        const event = await new Promise<SseEvent<T>>((r) => {
          resolve = r;
        });
        yield event;
      }
    } finally {
      clearInterval(heartbeatInterval);
      unsubscribe();
    }
  }
}

// ── Per-domain channel singletons ─────────────────────────────────────────────

/**
 * Global channel for map events (filtered by region client-side or server-side).
 * Publishes: { eventId, type, region, lat, lon, timestamp }
 */
export const EventChannel = new SseEventEmitter<{
  eventId: string;
  type: string;
  region: string;
  lat?: number;
  lon?: number;
  timestamp: string;
}>();

/**
 * Channel for air raid / alert notifications.
 * Publishes: { alertId, oblast, severity, message, triggeredAt }
 */
export const AlertChannel = new SseEventEmitter<{
  alertId: string;
  oblast: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  triggeredAt: string;
}>();

/**
 * Channel for map layer cache invalidation.
 * Publishes: { layerId, version, updatedAt }
 */
export const LayerUpdateChannel = new SseEventEmitter<{
  layerId: string;
  version: number;
  updatedAt: string;
}>();
