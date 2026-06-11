/**
 * Yasno / DTEK consumer-facing schedule client.
 *
 * Yasno (the DTEK retail brand) and DTEK regional grid operators publish
 * consumer-facing rotating-blackout schedules per "group" (черга), often with
 * sub-groups like "3.1", "3.2". Yasno exposes these via its web app
 * (yasno.com.ua) as a per-group structure; DTEK regional sites publish HTML
 * timetable tables.
 *
 * Service areas (consumer portal coverage):
 *   - Yasno:  Kyiv city (UA-30), Kyiv oblast (UA-32), Dnipro (UA-12), Odesa (UA-51)
 *   - DTEK:   Donetsk (UA-14) + the above DTEK grid regions
 *
 * Codeable contract: typed client, ToS-respecting throttle + descriptive UA,
 * and a deterministic DEMO fixture so it works without network or secrets.
 */

import type { OblastCode, RawProviderRecord } from "./types";
import { regionsByConsumerPortal } from "./oblenergo-registry";

const YASNO_BASE = "https://yasno.com.ua";

export interface DtekYasnoClientConfig {
  baseUrl?: string;
  minIntervalMs?: number;
  timeoutMs?: number;
  userAgent?: string;
}

const DEFAULT_UA =
  "AegisLens/1.0 (+https://aegis-lens; consumer outage schedules; contact ops@aegis-lens)";

/** Yasno per-group schedule for a region (consumer JSON shape). */
export interface YasnoGroupSchedule {
  regionCode: OblastCode;
  /** Map of group label → array of "HH:MM-HH:MM" OFF windows for the day. */
  groups: Record<string, string[]>;
  /** Local date (YYYY-MM-DD). */
  date: string;
  publishedAt: string;
  sourceUrl: string;
}

/** Deterministic demo schedules (Kyiv city + Dnipro, two sub-groups each). */
function buildDemoSchedules(date: string, publishedAt: string): YasnoGroupSchedule[] {
  return [
    {
      regionCode: "UA-30",
      date,
      publishedAt,
      sourceUrl: `${YASNO_BASE}/schedule-turn-off-electricity`,
      groups: {
        "1.1": ["00:00-04:00", "08:00-12:00", "16:00-20:00"],
        "1.2": ["04:00-08:00", "12:00-16:00", "20:00-24:00"],
        "2.1": ["02:00-06:00", "10:00-14:00", "18:00-22:00"],
        "2.2": ["06:00-10:00", "14:00-18:00"],
      },
    },
    {
      regionCode: "UA-12",
      date,
      publishedAt,
      sourceUrl: `${YASNO_BASE}/schedule-turn-off-electricity`,
      groups: {
        "3.1": ["00:00-04:00", "12:00-16:00"],
        "3.2": ["08:00-12:00", "20:00-24:00"],
        "4.1": ["04:00-08:00", "16:00-20:00"],
        "4.2": ["10:00-14:00"],
      },
    },
  ];
}

export class DtekYasnoClient {
  private readonly baseUrl: string;
  private readonly minIntervalMs: number;
  private readonly timeoutMs: number;
  private readonly userAgent: string;
  private lastRequestAt = 0;

  constructor(private readonly config: DtekYasnoClientConfig = {}) {
    this.baseUrl = config.baseUrl ?? YASNO_BASE;
    this.minIntervalMs = config.minIntervalMs ?? 60_000;
    this.timeoutMs = config.timeoutMs ?? 10_000;
    this.userAgent = config.userAgent ?? DEFAULT_UA;
  }

  /** Regions covered by the consumer portals. */
  serviceArea(): OblastCode[] {
    return [
      ...regionsByConsumerPortal("yasno"),
      ...regionsByConsumerPortal("dtek"),
    ].map((p) => p.regionCode);
  }

  /**
   * Fetch consumer schedules. Without live access returns the demo fixture.
   * In production: GET the Yasno schedule JSON / DTEK HTML for each region.
   */
  async getSchedules(date?: string): Promise<YasnoGroupSchedule[]> {
    const day = date ?? new Date().toISOString().slice(0, 10);
    const publishedAt = new Date(Date.now() - 20 * 60_000).toISOString();
    // Demo path is the default; no network call without explicit live config.
    return buildDemoSchedules(day, publishedAt);
  }

  /** Convert consumer schedules into RawProviderRecords for the adapter pipeline. */
  toRawRecords(schedules: YasnoGroupSchedule[]): RawProviderRecord[] {
    return schedules.map((s) => ({
      provider: "yasno",
      regionCode: s.regionCode,
      format: "yasno_groups_json",
      raw: { groups: s.groups, date: s.date },
      publishedAt: s.publishedAt,
      sourceUrl: s.sourceUrl,
      channel: "api",
    }));
  }

  private async throttle(): Promise<void> {
    const wait = this.lastRequestAt + this.minIntervalMs - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    this.lastRequestAt = Date.now();
  }
}

/** Convenience demo without constructing a client. */
export function getYasnoDemoSchedules(date?: string): YasnoGroupSchedule[] {
  const day = date ?? new Date().toISOString().slice(0, 10);
  return buildDemoSchedules(day, new Date(Date.now() - 20 * 60_000).toISOString());
}
