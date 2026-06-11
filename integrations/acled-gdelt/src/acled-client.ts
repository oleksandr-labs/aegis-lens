/**
 * ACLED client — API access + bulk-download contract. (TODO task 2)
 *
 * ACLED publishes two access paths:
 *   1. REST API:   https://api.acleddata.com/acled/read
 *                  auth via `key` + `email` query params (registered account).
 *   2. Bulk export: curated regional CSV/XLSX dumps from the data-export tool.
 *
 * LICENSING: ACLED data is NOT freely republishable. Use requires a registered
 * account; commercial use requires a paid licence; raw-row redistribution is
 * prohibited. See COMPLIANCE.md. This client therefore:
 *   - reads credentials from process.env (never hardcoded);
 *   - refuses to run live without ACLED_API_KEY + ACLED_API_EMAIL;
 *   - ships a tiny DEMO fixture so downstream code (adapters, trends) is testable
 *     WITHOUT credentials and WITHOUT touching ACLED's servers.
 *
 * Rate/ToS discipline: ACLED asks for ≤ ~1 req/s and a descriptive User-Agent.
 */

import type { AcledRawEvent } from "./types";

const ACLED_API_BASE = "https://api.acleddata.com/acled/read";
const USER_AGENT = "AegisLens/1.0 (+https://aegislens.example; research integration)";
/** Polite minimum spacing between ACLED requests (ms). */
export const ACLED_MIN_REQUEST_INTERVAL_MS = 1_100;

export interface AcledClientConfig {
  apiKey?: string;
  email?: string;
  baseUrl?: string;
  timeoutMs?: number;
  /** When true (default if creds missing), serve the demo fixture only. */
  demoMode?: boolean;
}

export interface AcledQuery {
  /** ISO3 country, e.g. "UKR". */
  iso3?: string;
  country?: string;
  /** Inclusive event_date lower bound "YYYY-MM-DD". */
  eventDateFrom?: string;
  eventDateTo?: string;
  eventType?: string;
  /** Max rows (ACLED caps page size at 5000). */
  limit?: number;
}

export class AcledClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly demoMode: boolean;
  private lastRequestAt = 0;

  constructor(private readonly config: AcledClientConfig = {}) {
    this.baseUrl = config.baseUrl ?? ACLED_API_BASE;
    this.timeoutMs = config.timeoutMs ?? 15_000;
    const key = config.apiKey ?? process.env.ACLED_API_KEY;
    const email = config.email ?? process.env.ACLED_API_EMAIL;
    this.config = { ...config, apiKey: key, email };
    this.demoMode = config.demoMode ?? !(key && email);
  }

  /** True when the client cannot reach ACLED (no creds) and serves fixtures. */
  get isDemo(): boolean {
    return this.demoMode;
  }

  /**
   * Fetch ACLED events. In demo mode returns the bundled fixture filtered by
   * the query; otherwise calls the ACLED REST API.
   */
  async getEvents(query: AcledQuery = {}): Promise<AcledRawEvent[]> {
    if (this.demoMode) {
      return filterFixture(DEMO_ACLED_EVENTS, query);
    }
    const params = new URLSearchParams();
    params.set("key", this.config.apiKey!);
    params.set("email", this.config.email!);
    if (query.iso3) params.set("iso3", query.iso3);
    if (query.country) params.set("country", query.country);
    if (query.eventType) params.set("event_type", query.eventType);
    if (query.eventDateFrom && query.eventDateTo) {
      params.set("event_date", `${query.eventDateFrom}|${query.eventDateTo}`);
      params.set("event_date_where", "BETWEEN");
    }
    params.set("limit", String(Math.min(query.limit ?? 5000, 5000)));

    await this.throttle();
    const json = await this.fetch<{ success?: boolean; data?: AcledRawEvent[] }>(
      `${this.baseUrl}?${params.toString()}`,
    );
    return json.data ?? [];
  }

  /**
   * Bulk-download contract. ACLED's data-export tool produces a signed file URL
   * for an authenticated account; we expose the shape but do NOT bundle bulk
   * data (republication restriction). In demo mode returns the fixture.
   */
  async bulkDownload(_fileUrl: string): Promise<AcledRawEvent[]> {
    if (this.demoMode) return DEMO_ACLED_EVENTS;
    await this.throttle();
    // A real implementation streams + parses the CSV/XLSX export here.
    const rows = await this.fetch<AcledRawEvent[]>(_fileUrl);
    return Array.isArray(rows) ? rows : [];
  }

  private async throttle(): Promise<void> {
    const wait = this.lastRequestAt + ACLED_MIN_REQUEST_INTERVAL_MS - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    this.lastRequestAt = Date.now();
  }

  private async fetch<T>(url: string): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
        signal: controller.signal,
      });
      if (!res.ok) throw new AcledApiError(res.status, await res.text());
      return (await res.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }
}

export class AcledApiError extends Error {
  constructor(public readonly status: number, public readonly body: string) {
    super(`ACLED API error ${status}: ${body.slice(0, 200)}`);
    this.name = "AcledApiError";
  }
}

function filterFixture(rows: AcledRawEvent[], q: AcledQuery): AcledRawEvent[] {
  return rows.filter((r) => {
    if (q.iso3 && r.iso3 !== q.iso3) return false;
    if (q.country && r.country !== q.country) return false;
    if (q.eventType && r.event_type !== q.eventType) return false;
    if (q.eventDateFrom && r.event_date < q.eventDateFrom) return false;
    if (q.eventDateTo && r.event_date > q.eventDateTo) return false;
    return true;
  });
}

/**
 * DEMO fixture — synthetic, non-redistributed rows shaped like ACLED output.
 * Safe to ship: not actual ACLED data, used only for local dev/tests.
 */
export const DEMO_ACLED_EVENTS: AcledRawEvent[] = [
  {
    event_id_cnty: "UKR-DEMO-1",
    event_date: "2024-03-21",
    year: 2024,
    event_type: "Explosions/Remote violence",
    sub_event_type: "Shelling/artillery/missile attack",
    actor1: "Military Forces of Russia (2000-)",
    actor2: "Civilians (Ukraine)",
    disorder_type: "Political violence",
    country: "Ukraine",
    iso3: "UKR",
    admin1: "Kharkiv",
    location: "Kharkiv",
    latitude: 49.99,
    longitude: 36.23,
    geo_precision: 1,
    fatalities: 4,
    notes: "Reported missile strike on residential district.",
    source: "Regional administration; local media",
    source_scale: "Subnational",
    timestamp: 1_711_065_600,
  },
  {
    event_id_cnty: "UKR-DEMO-2",
    event_date: "2024-03-22",
    year: 2024,
    event_type: "Battles",
    sub_event_type: "Armed clash",
    actor1: "Military Forces of Ukraine (2019-)",
    actor2: "Military Forces of Russia (2000-)",
    disorder_type: "Political violence",
    country: "Ukraine",
    iso3: "UKR",
    admin1: "Donetsk",
    location: "Avdiivka",
    latitude: 48.14,
    longitude: 37.74,
    geo_precision: 1,
    fatalities: 0,
    notes: "Armed clash along the contact line.",
    source: "General Staff statements",
    source_scale: "National",
    timestamp: 1_711_152_000,
  },
  {
    event_id_cnty: "SYR-DEMO-1",
    event_date: "2023-11-05",
    year: 2023,
    event_type: "Explosions/Remote violence",
    sub_event_type: "Air/drone strike",
    actor1: "Unidentified Armed Group (Syria)",
    country: "Syria",
    iso3: "SYR",
    admin1: "Aleppo",
    location: "Aleppo",
    latitude: 36.2,
    longitude: 37.16,
    geo_precision: 2,
    fatalities: 2,
    notes: "Air/drone strike (global-coverage demo row).",
    source: "Local media",
    source_scale: "Subnational",
    timestamp: 1_699_142_400,
  },
];
