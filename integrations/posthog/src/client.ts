import 'server-only';

export interface PostHogConfig {
  apiKey: string;
  host: string;
  flushInterval: number; // milliseconds
}

export interface PostHogEvent {
  event: string;
  distinctId: string;
  properties: Record<string, unknown>;
  timestamp?: string; // ISO-8601; defaults to now
}

const DEFAULT_HOST = 'https://eu.posthog.com'; // EU region for GDPR compliance
const DEFAULT_FLUSH_INTERVAL = 5_000; // 5 seconds
const MAX_BATCH_SIZE = 100;

export class PostHogClient {
  private readonly apiKey: string;
  private readonly host: string;
  private readonly flushInterval: number;
  private queue: PostHogEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config?: Partial<PostHogConfig>) {
    this.apiKey = config?.apiKey ?? process.env.POSTHOG_API_KEY ?? '';
    this.host =
      config?.host ??
      (process.env.POSTHOG_HOST || DEFAULT_HOST);
    this.flushInterval =
      config?.flushInterval ??
      parseInt(process.env.POSTHOG_FLUSH_INTERVAL ?? String(DEFAULT_FLUSH_INTERVAL), 10);

    if (this.isConfigured() && typeof globalThis.setInterval !== 'undefined') {
      this.flushTimer = setInterval(() => {
        void this.flush();
      }, this.flushInterval);
      // Don't hold the Node.js process open just for analytics
      if (this.flushTimer && typeof this.flushTimer === 'object' && 'unref' in this.flushTimer) {
        (this.flushTimer as { unref(): void }).unref();
      }
    }
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  /**
   * Queues an event for batched delivery.
   * No-op when PostHog is not configured.
   */
  capture(event: PostHogEvent): void {
    if (!this.isConfigured()) return;
    this.queue.push({
      ...event,
      timestamp: event.timestamp ?? new Date().toISOString(),
    });
    if (this.queue.length >= MAX_BATCH_SIZE) {
      void this.flush();
    }
  }

  /**
   * Identifies a user with properties (e.g. plan, role).
   * Sends an `$identify` event to PostHog.
   */
  identify(distinctId: string, properties: Record<string, unknown>): void {
    this.capture({
      event: '$identify',
      distinctId,
      properties: { $set: properties },
    });
  }

  /**
   * Sends all queued events to PostHog in a single batch request.
   * Clears the queue on success; on failure, events are dropped to avoid memory growth.
   */
  async flush(): Promise<void> {
    if (!this.isConfigured() || this.queue.length === 0) return;

    const batch = this.queue.splice(0, MAX_BATCH_SIZE);

    try {
      const res = await fetch(`${this.host}/batch/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: this.apiKey,
          batch: batch.map((e) => ({
            event: e.event,
            distinct_id: e.distinctId,
            properties: e.properties,
            timestamp: e.timestamp,
          })),
        }),
      });

      if (!res.ok) {
        // Log but don't throw — analytics must never break the app
        console.warn(
          `[posthog] Batch flush failed (${res.status}): ${await res.text().catch(() => '')}`,
        );
      }
    } catch (err) {
      console.warn('[posthog] Batch flush error:', err);
    }
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }
}

/** Singleton PostHog client. */
export const postHogClient = new PostHogClient();
