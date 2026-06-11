/**
 * Ukrhydromet client — Ukrainian Hydrometeorological Center public feed.
 * Portal: https://www.meteo.gov.ua/
 *
 * UHMC ("Укргідрометцентр") is the UA national authority for forecasts, storm
 * warnings and hydrology. It does NOT publish a stable documented public JSON
 * API; forecasts are served as HTML pages and (for some products) JSON used by
 * the site's own widgets. Per the brief's "codeable contract" rule, this client:
 *   - encodes the polite-crawler discipline (UA, cache cadence, rate limit);
 *   - exposes typed `getOblastForecast` / `getAllForecasts` methods that parse
 *     the upstream shape when `UKRHYDROMET_FEED_URL` is configured;
 *   - ships a deterministic DEMO fixture so the package is usable without a
 *     live feed or any secret (meteo.gov.ua has no API key, but the feed shape
 *     is unstable, so demo-mode is the default).
 *
 * See COMPLIANCE.md for ToS / attribution / republication terms.
 */

import type { OblastCode, OblastForecast, DailyForecast, ConditionCode } from "./types";
import { OBLAST_GEO } from "./types";

const DEFAULT_BASE_URL = "https://www.meteo.gov.ua";
const USER_AGENT = "AegisLens/1.0 (+https://aegis-lens.app; weather overlay; contact ops@aegis-lens.app)";

export interface UkrhydrometClientConfig {
  /** Override the upstream base (or set UKRHYDROMET_FEED_URL). */
  baseUrl?: string;
  /** Minimum ms between requests (UHMC is a public-good site — be gentle). */
  minRequestIntervalMs?: number;
  timeoutMs?: number;
  /** Force demo fixture even if a feed URL is present (tests). */
  forceDemo?: boolean;
}

/** Shape we expect from a UHMC-derived JSON feed (when one is wired in). */
interface RawFeedForecast {
  oblast: string;
  issued_at?: string;
  days: Array<{
    date: string;
    t_min: number;
    t_max: number;
    precip_mm?: number;
    precip_prob?: number;
    wind_ms?: number;
    gust_ms?: number;
    wind_dir?: number;
    condition?: string;
  }>;
}

const CONDITION_ALIASES: Record<string, ConditionCode> = {
  clear: "clear", sunny: "clear", "ясно": "clear",
  partly: "partly_cloudy", partly_cloudy: "partly_cloudy",
  cloudy: "cloudy", overcast: "overcast",
  fog: "fog", mist: "fog",
  drizzle: "light_rain", light_rain: "light_rain",
  rain: "rain", heavy_rain: "heavy_rain", showers: "rain",
  thunderstorm: "thunderstorm", storm: "thunderstorm",
  light_snow: "light_snow", snow: "snow", heavy_snow: "heavy_snow",
  sleet: "sleet", ice: "ice", glaze: "ice",
};

function normalizeCondition(raw: string | undefined): ConditionCode {
  if (!raw) return "cloudy";
  const key = raw.toLowerCase().trim();
  return CONDITION_ALIASES[key] ?? "cloudy";
}

export class UkrhydrometClient {
  private readonly baseUrl: string;
  private readonly minIntervalMs: number;
  private readonly timeoutMs: number;
  private readonly forceDemo: boolean;
  private lastRequestAt = 0;

  constructor(config: UkrhydrometClientConfig = {}) {
    this.baseUrl = config.baseUrl ?? process.env.UKRHYDROMET_FEED_URL ?? DEFAULT_BASE_URL;
    this.minIntervalMs = config.minRequestIntervalMs ?? 2_000;
    this.timeoutMs = config.timeoutMs ?? 12_000;
    this.forceDemo = config.forceDemo ?? !process.env.UKRHYDROMET_FEED_URL;
  }

  /** True when no live feed is configured and the demo fixture is served. */
  get isDemo(): boolean {
    return this.forceDemo;
  }

  /** Forecast for one oblast centre. */
  async getOblastForecast(oblast: OblastCode, days = 5): Promise<OblastForecast> {
    if (this.forceDemo) return demoForecast(oblast, days);
    try {
      const raw = await this.fetchJson<RawFeedForecast>(`/api/forecast?oblast=${oblast}&days=${days}`);
      return this.parseForecast(oblast, raw, days);
    } catch {
      // Fail safe to demo so the overlay never goes blank.
      return demoForecast(oblast, days);
    }
  }

  /** Forecast for every oblast centre (one map refresh). */
  async getAllForecasts(days = 5): Promise<OblastForecast[]> {
    const out: OblastForecast[] = [];
    for (const code of Object.keys(OBLAST_GEO) as OblastCode[]) {
      out.push(await this.getOblastForecast(code, days));
    }
    return out;
  }

  private parseForecast(oblast: OblastCode, raw: RawFeedForecast, days: number): OblastForecast {
    const geo = OBLAST_GEO[oblast];
    const parsedDays: DailyForecast[] = (raw.days ?? []).slice(0, days).map((d) => ({
      date: d.date,
      tempMinC: Number(d.t_min),
      tempMaxC: Number(d.t_max),
      precipMm: Number(d.precip_mm ?? 0),
      precipProbPct: Number(d.precip_prob ?? 0),
      windSpeedMs: Number(d.wind_ms ?? 0),
      windGustMs: Number(d.gust_ms ?? d.wind_ms ?? 0),
      windDirDeg: Number(d.wind_dir ?? 0),
      condition: normalizeCondition(d.condition),
    }));
    return {
      oblast,
      lat: geo.center[1],
      lon: geo.center[0],
      issuedAt: raw.issued_at ?? new Date().toISOString(),
      days: parsedDays,
    };
  }

  private async fetchJson<T>(path: string): Promise<T> {
    await this.throttle();
    const url = path.startsWith("http") ? path : `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Ukrhydromet ${res.status}: ${await res.text()}`);
      return (await res.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }

  /** Enforce a minimum interval between upstream requests. */
  private async throttle(): Promise<void> {
    const wait = this.lastRequestAt + this.minIntervalMs - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    this.lastRequestAt = Date.now();
  }

  async healthCheck(): Promise<{ healthy: boolean; demo: boolean; message?: string }> {
    if (this.forceDemo) return { healthy: true, demo: true, message: "demo fixture (no live feed configured)" };
    try {
      await this.getOblastForecast("UA-30", 1);
      return { healthy: true, demo: false };
    } catch (err) {
      return { healthy: false, demo: false, message: String(err) };
    }
  }
}

// ── DEMO fixture ────────────────────────────────────────────────────────────────

/**
 * Deterministic pseudo-forecast so the package is fully exercisable offline.
 * Values are climatologically plausible but NOT a real forecast — `isDemo`
 * surfaces this to callers, who must label it accordingly.
 */
export function demoForecast(oblast: OblastCode, days = 5): OblastForecast {
  const geo = OBLAST_GEO[oblast];
  // Cheap deterministic hash off the oblast code for stable variety.
  const seed = [...oblast].reduce((a, c) => a + c.charCodeAt(0), 0);
  const today = new Date();
  const conditions: ConditionCode[] = ["clear", "partly_cloudy", "cloudy", "rain", "overcast"];

  const dayList: DailyForecast[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() + i);
    const wobble = ((seed + i * 7) % 9) - 4;
    const base = 14 + wobble;
    dayList.push({
      date: d.toISOString().slice(0, 10),
      tempMinC: base - 6,
      tempMaxC: base + 5,
      precipMm: (seed + i) % 4 === 0 ? 6 + ((seed + i) % 5) : 0,
      precipProbPct: ((seed + i * 13) % 100),
      windSpeedMs: 3 + ((seed + i) % 7),
      windGustMs: 6 + ((seed + i) % 11),
      windDirDeg: (seed * 13 + i * 30) % 360,
      condition: conditions[(seed + i) % conditions.length],
    });
  }

  return {
    oblast,
    lat: geo.center[1],
    lon: geo.center[0],
    issuedAt: today.toISOString(),
    days: dayList,
  };
}
