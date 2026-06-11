/**
 * Aegis Lens TypeScript SDK client.
 *
 * Usage:
 *   const client = new AegisClient({ apiKey: "ak_..." });
 *   const events = await client.events.list({ country: "UA", limit: 20 });
 */

import type {
  AegisEvent,
  AegisSource,
  AegisReport,
  PaginatedResponse,
  CopilotResponse,
  SearchResponse,
  EventClass,
} from "./types";

export interface AegisClientOptions {
  apiKey?: string;
  baseUrl?: string;
  /** Request timeout in ms. Default: 30_000 */
  timeoutMs?: number;
  /** User-Agent string. Default: "aegis-sdk-ts/<version>" */
  userAgent?: string;
}

export interface ListEventsOptions {
  country?: "UA" | "PL" | "DE";
  class?: EventClass | EventClass[];
  since?: string | Date;
  hours?: number;
  limit?: number;
  cursor?: string;
}

export interface SearchOptions {
  q: string;
  class?: EventClass | EventClass[];
  severity?: 1 | 2 | 3;
  since?: string | Date;
  until?: string | Date;
  lat?: number;
  lon?: number;
  radiusKm?: number;
  limit?: number;
  cursor?: string;
}

export interface CopilotOptions {
  prompt: string;
  country?: "UA" | "PL" | "DE";
  hours?: number;
}

export type CopilotStreamChunk =
  | { type: "stats"; data: CopilotResponse["stats"] }
  | { type: "delta"; text: string }
  | { type: "citation"; eventId: string }
  | { type: "done" };

const SDK_VERSION = "0.1.0";

class AegisApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message);
    this.name = "AegisApiError";
  }
}

export class AegisClient {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;
  private readonly timeoutMs: number;

  readonly events: EventsResource;
  readonly sources: SourcesResource;
  readonly reports: ReportsResource;
  readonly search: SearchResource;
  readonly copilot: CopilotResource;

  constructor(opts: AegisClientOptions = {}) {
    this.baseUrl = (opts.baseUrl ?? "https://aegislens.io").replace(/\/$/, "");
    this.timeoutMs = opts.timeoutMs ?? 30_000;
    this.headers = {
      "Content-Type": "application/json",
      "User-Agent": opts.userAgent ?? `aegis-sdk-ts/${SDK_VERSION}`,
    };
    if (opts.apiKey) {
      this.headers["X-Api-Key"] = opts.apiKey;
    }

    this.events = new EventsResource(this);
    this.sources = new SourcesResource(this);
    this.reports = new ReportsResource(this);
    this.search = new SearchResource(this);
    this.copilot = new CopilotResource(this);
  }

  async fetch<T>(path: string, init?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        headers: { ...this.headers, ...(init?.headers as Record<string, string> ?? {}) },
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new AegisApiError(`Aegis API ${res.status} ${res.statusText}`, res.status, body);
      }

      return res.json() as Promise<T>;
    } finally {
      clearTimeout(timer);
    }
  }

  buildUrl(path: string, params: Record<string, string | string[] | number | boolean | undefined>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        value.forEach((v) => url.searchParams.append(key, String(v)));
      } else {
        url.searchParams.set(key, String(value));
      }
    }
    return url.pathname + url.search;
  }
}

class EventsResource {
  constructor(private readonly client: AegisClient) {}

  async list(opts: ListEventsOptions = {}): Promise<PaginatedResponse<AegisEvent>> {
    const path = this.client.buildUrl("/api/events", {
      country: opts.country,
      class: opts.class,
      since: opts.since instanceof Date ? opts.since.toISOString() : opts.since,
      hours: opts.hours,
      limit: opts.limit,
      cursor: opts.cursor,
    });
    return this.client.fetch(path);
  }

  async get(id: string): Promise<AegisEvent> {
    return this.client.fetch(`/api/events/${encodeURIComponent(id)}`);
  }

  /** Iterate all events matching the filter (auto-paginates) */
  async *iterate(opts: ListEventsOptions = {}): AsyncGenerator<AegisEvent> {
    let cursor: string | null | undefined = opts.cursor;
    do {
      const page: PaginatedResponse<AegisEvent> = await this.list({ ...opts, cursor: cursor ?? undefined });
      for (const event of page.data) yield event;
      cursor = page.meta.nextCursor;
    } while (cursor);
  }
}

class SourcesResource {
  constructor(private readonly client: AegisClient) {}

  async list(): Promise<{ data: AegisSource[] }> {
    return this.client.fetch("/api/sources");
  }
}

class ReportsResource {
  constructor(private readonly client: AegisClient) {}

  async list(opts: { limit?: number } = {}): Promise<{ data: AegisReport[] }> {
    const path = this.client.buildUrl("/api/reports", { limit: opts.limit });
    return this.client.fetch(path);
  }
}

class SearchResource {
  constructor(private readonly client: AegisClient) {}

  async query(opts: SearchOptions): Promise<SearchResponse> {
    const path = this.client.buildUrl("/api/search", {
      q: opts.q,
      class: opts.class,
      severity: opts.severity,
      since: opts.since instanceof Date ? opts.since.toISOString() : opts.since,
      until: opts.until instanceof Date ? opts.until.toISOString() : opts.until,
      lat: opts.lat,
      lon: opts.lon,
      radius_km: opts.radiusKm,
      limit: opts.limit,
      cursor: opts.cursor,
    });
    return this.client.fetch(path);
  }

  async suggest(q: string, limit = 8): Promise<{ data: { kind: string; label: string; href: string; sub?: string }[] }> {
    const path = this.client.buildUrl("/api/search/suggest", { q, limit });
    return this.client.fetch(path);
  }
}

class CopilotResource {
  constructor(private readonly client: AegisClient) {}

  async ask(opts: CopilotOptions): Promise<CopilotResponse> {
    return this.client.fetch("/api/copilot", {
      method: "POST",
      body: JSON.stringify(opts),
    });
  }

  /** Stream copilot response as async chunks */
  async *stream(opts: CopilotOptions): AsyncGenerator<CopilotStreamChunk> {
    const res = await fetch(`${(this.client as unknown as { baseUrl: string }).baseUrl}/api/copilot/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(opts),
    });

    if (!res.ok || !res.body) {
      throw new AegisApiError(`Copilot stream failed: ${res.status}`, res.status, null);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const chunk = JSON.parse(line.slice(6)) as CopilotStreamChunk;
          yield chunk;
          if (chunk.type === "done") return;
        } catch {
          // Skip malformed SSE lines
        }
      }
    }
  }
}

export { AegisApiError };
