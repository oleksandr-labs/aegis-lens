/**
 * Hydrology — river-gauge water levels + derived flood risk (UHMC hydrology dept).
 *
 * UHMC's hydrology service publishes daily water-level bulletins per gauge
 * station, with "несприятливе явище" (adverse) and "небезпечне явище" (danger)
 * marks. We model a gauge reading and derive a FloodRisk band from the measured
 * level vs those marks. Serves a DEMO fixture when no live feed is configured.
 *
 * Source: https://www.meteo.gov.ua/ (гідрологічні бюлетені).
 */

import type { OblastCode, RiverGauge, FloodRisk } from "./types";
import { OBLAST_GEO } from "./types";

const USER_AGENT = "AegisLens/1.0 (+https://aegis-lens.app; hydrology)";

/** Raw upstream gauge record (UHMC-derived JSON, when a feed is wired in). */
interface RawGauge {
  id?: string;
  station: string;
  station_en?: string;
  river: string;
  river_en?: string;
  oblast: string;
  lat: number;
  lon: number;
  level_cm: number;
  change_cm_24h?: number;
  adverse_cm: number;
  danger_cm: number;
  measured_at?: string;
}

/**
 * Derive a flood-risk band.
 *  danger   : level >= danger mark.
 *  adverse  : level >= adverse mark (or within 20cm of danger and rising).
 *  elevated : within 50cm of the adverse mark and rising.
 *  normal   : otherwise.
 */
export function deriveFloodRisk(
  levelCm: number,
  adverseMarkCm: number,
  dangerMarkCm: number,
  changeCm24h = 0,
): FloodRisk {
  if (levelCm >= dangerMarkCm) return "danger";
  if (levelCm >= adverseMarkCm) return "adverse";
  if (changeCm24h > 0 && levelCm >= dangerMarkCm - 20) return "adverse";
  if (changeCm24h > 0 && levelCm >= adverseMarkCm - 50) return "elevated";
  return "normal";
}

export class HydrologyClient {
  private readonly baseUrl: string | undefined;
  private readonly timeoutMs: number;
  private readonly forceDemo: boolean;

  constructor(config: { baseUrl?: string; timeoutMs?: number; forceDemo?: boolean } = {}) {
    this.baseUrl = config.baseUrl ?? process.env.UKRHYDROMET_FEED_URL;
    this.timeoutMs = config.timeoutMs ?? 12_000;
    this.forceDemo = config.forceDemo ?? !this.baseUrl;
  }

  get isDemo(): boolean {
    return this.forceDemo;
  }

  /** Latest reading for every monitored gauge. */
  async getGauges(): Promise<RiverGauge[]> {
    if (this.forceDemo || !this.baseUrl) return demoGauges();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        const res = await fetch(`${this.baseUrl}/api/hydrology`, {
          headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Ukrhydromet hydrology ${res.status}`);
        const raw = (await res.json()) as RawGauge[];
        return raw.map((r) => this.parse(r));
      } finally {
        clearTimeout(timer);
      }
    } catch {
      return demoGauges();
    }
  }

  /** Gauges currently at adverse or danger risk. */
  async getFloodAlerts(): Promise<RiverGauge[]> {
    const gauges = await this.getGauges();
    return gauges.filter((g) => g.risk === "adverse" || g.risk === "danger");
  }

  private parse(raw: RawGauge): RiverGauge {
    const oblast = (OBLAST_GEO[raw.oblast as OblastCode] ? raw.oblast : "UA-30") as OblastCode;
    const change = Number(raw.change_cm_24h ?? 0);
    const risk = deriveFloodRisk(raw.level_cm, raw.adverse_cm, raw.danger_cm, change);
    return {
      gaugeId: raw.id ?? `uhmc:${oblast}:${raw.station}`,
      stationUk: raw.station,
      stationEn: raw.station_en ?? raw.station,
      riverUk: raw.river,
      riverEn: raw.river_en ?? raw.river,
      oblast,
      lat: raw.lat,
      lon: raw.lon,
      levelCm: raw.level_cm,
      changeCm24h: change,
      adverseMarkCm: raw.adverse_cm,
      dangerMarkCm: raw.danger_cm,
      risk,
      measuredAt: raw.measured_at ?? new Date().toISOString(),
      source: "meteo.gov.ua",
    };
  }
}

// ── DEMO fixture ────────────────────────────────────────────────────────────────

export function demoGauges(): RiverGauge[] {
  const measuredAt = new Date().toISOString();
  const rows: Array<Omit<RiverGauge, "risk" | "source" | "gaugeId">> = [
    { stationUk: "Київ", stationEn: "Kyiv", riverUk: "Дніпро", riverEn: "Dnipro", oblast: "UA-30", lat: 50.45, lon: 30.52, levelCm: 320, changeCm24h: 4, adverseMarkCm: 700, dangerMarkCm: 850, measuredAt },
    { stationUk: "Чернівці", stationEn: "Chernivtsi", riverUk: "Прут", riverEn: "Prut", oblast: "UA-77", lat: 48.29, lon: 25.94, levelCm: 410, changeCm24h: 55, adverseMarkCm: 420, dangerMarkCm: 520, measuredAt },
    { stationUk: "Мукачево", stationEn: "Mukachevo", riverUk: "Латориця", riverEn: "Latorica", oblast: "UA-21", lat: 48.44, lon: 22.72, levelCm: 540, changeCm24h: 80, adverseMarkCm: 450, dangerMarkCm: 560, measuredAt },
    { stationUk: "Херсон", stationEn: "Kherson", riverUk: "Дніпро", riverEn: "Dnipro", oblast: "UA-65", lat: 46.64, lon: 32.61, levelCm: 180, changeCm24h: -3, adverseMarkCm: 480, dangerMarkCm: 600, measuredAt },
    { stationUk: "Галич", stationEn: "Halych", riverUk: "Дністер", riverEn: "Dniester", oblast: "UA-26", lat: 49.12, lon: 24.72, levelCm: 300, changeCm24h: 12, adverseMarkCm: 360, dangerMarkCm: 450, measuredAt },
  ];

  return rows.map((r) => ({
    ...r,
    gaugeId: `demo:${r.oblast}:${r.stationEn}`,
    risk: deriveFloodRisk(r.levelCm, r.adverseMarkCm, r.dangerMarkCm, r.changeCm24h),
    source: "meteo.gov.ua (demo)",
  }));
}
