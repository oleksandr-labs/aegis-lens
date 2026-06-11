/**
 * Ukrenergo (national TSO / dispatcher) client.
 *
 * Ukrenergo publishes grid status via three channels:
 *   - the official site  https://ua.energy  (press releases + power-balance pages)
 *   - the Telegram channel  https://t.me/Ukrenergo  (operative situation, GPV notices)
 *   - a published power-balance / consumption API (where available)
 *
 * Ukrenergo announces *whether* a rotating-restriction schedule (ГПВ/ГСВ) or an
 * emergency shutdown (ЕВ) is in effect, and for which queues, but the actual
 * per-group timetables are published by the regional oblenergos (see
 * oblenergo-registry.ts) and consumer portals (dtek-yasno-client.ts).
 *
 * This module ships the codeable contract: a typed client with ToS-respecting
 * behaviour (polite rate limit, descriptive User-Agent, caching cadence) plus a
 * deterministic DEMO fixture so it is usable without network or secrets.
 * Never hardcode secrets — any key is read from process.env.
 */

import type { RawProviderRecord } from "./types";

const UKRENERGO_SITE = "https://ua.energy";
const UKRENERGO_TELEGRAM = "https://t.me/Ukrenergo";

/** Polite defaults — Ukrenergo press cadence is hourly at most. */
export interface UkrenergoClientConfig {
  /** Override base site URL (testing). */
  baseUrl?: string;
  /** Bearer/API key if Ukrenergo issues one (read from env by caller). */
  apiKey?: string;
  /** Min ms between requests (politeness). Default 60_000. */
  minIntervalMs?: number;
  /** Request timeout. Default 10_000. */
  timeoutMs?: number;
  /** Descriptive UA per crawler discipline. */
  userAgent?: string;
}

const DEFAULT_UA =
  "AegisLens/1.0 (+https://aegis-lens; power-outage monitoring; contact ops@aegis-lens)";

/**
 * National-level status as declared by Ukrenergo (no per-group timetable here).
 */
export interface UkrenergoStatus {
  /** Whether a rotating restriction schedule is in force nationally/per-oblast. */
  scheduleInForce: boolean;
  /** Whether emergency (unscheduled) shutdowns are currently applied. */
  emergencyShutdowns: boolean;
  /** Which schedule type, if any. */
  scheduleType: "gpv" | "gsv" | "none";  // погодинні / стабілізаційні / none
  /** Oblasts named in the notice (ISO 3166-2:UA). */
  affectedRegions: string[];
  /** Original notice text (uk). */
  noticeUk?: string;
  publishedAt: string;
  sourceUrl: string;
  channel: "site" | "telegram" | "api";
}

/** Deterministic demo notice standing in for a live Ukrenergo announcement. */
const DEMO_STATUS: UkrenergoStatus = {
  scheduleInForce: true,
  emergencyShutdowns: true,
  scheduleType: "gpv",
  affectedRegions: ["UA-63", "UA-12", "UA-14", "UA-51", "UA-30", "UA-23"],
  noticeUk:
    "Через наслідки атак по енергооб'єктах застосовано графіки погодинних відключень " +
    "у низці областей. Подекуди діють екстрені аварійні відключення. " +
    "Час та обсяг застосування графіків можуть змінюватися.",
  publishedAt: new Date(Date.now() - 45 * 60_000).toISOString(),
  sourceUrl: UKRENERGO_TELEGRAM,
  channel: "telegram",
};

export class UkrenergoClient {
  private readonly baseUrl: string;
  private readonly minIntervalMs: number;
  private readonly timeoutMs: number;
  private readonly userAgent: string;
  private lastRequestAt = 0;

  constructor(private readonly config: UkrenergoClientConfig = {}) {
    this.baseUrl = config.baseUrl ?? UKRENERGO_SITE;
    this.minIntervalMs = config.minIntervalMs ?? 60_000;
    this.timeoutMs = config.timeoutMs ?? 10_000;
    this.userAgent = config.userAgent ?? DEFAULT_UA;
  }

  /**
   * Fetch the current national status. Without live access / partner feed this
   * returns the demo fixture. In production: GET the power-balance/press JSON or
   * parse the latest Telegram post.
   */
  async getStatus(): Promise<UkrenergoStatus> {
    if (!this.canFetch()) return DEMO_STATUS;
    try {
      await this.throttle();
      // Placeholder for the real request. Kept guarded so the demo path is the
      // default and no network call happens without an explicit endpoint+key.
      return DEMO_STATUS;
    } catch {
      return DEMO_STATUS;
    }
  }

  /**
   * Convert a national status into RawProviderRecords (one per affected region)
   * for the provider-adapter pipeline. Ukrenergo records carry no per-group
   * timetable; they flag schedule/emergency state to be merged with oblenergo
   * timetables downstream.
   */
  toRawRecords(status: UkrenergoStatus = DEMO_STATUS): RawProviderRecord[] {
    return status.affectedRegions.map((regionCode) => ({
      provider: "ukrenergo",
      regionCode,
      format: status.channel === "api" ? "ukrenergo_api" : "ukrenergo_telegram",
      raw: {
        scheduleInForce: status.scheduleInForce,
        emergencyShutdowns: status.emergencyShutdowns,
        scheduleType: status.scheduleType,
        noticeUk: status.noticeUk ?? "",
      },
      publishedAt: status.publishedAt,
      sourceUrl: status.sourceUrl,
      channel: status.channel,
    }));
  }

  private canFetch(): boolean {
    // Only attempt a live request if an explicit endpoint/key is configured.
    return Boolean(this.config.apiKey) && this.baseUrl !== UKRENERGO_SITE;
  }

  private async throttle(): Promise<void> {
    const wait = this.lastRequestAt + this.minIntervalMs - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    this.lastRequestAt = Date.now();
  }
}

/** Convenience: demo status without constructing a client. */
export function getUkrenergoDemoStatus(): UkrenergoStatus {
  return DEMO_STATUS;
}
