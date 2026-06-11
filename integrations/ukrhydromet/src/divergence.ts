/**
 * Cross-reference Ukrhydromet against global feeds (Open-Meteo, NOAA) for
 * divergence detection.
 *
 * Purpose: when the national authority and a global model disagree materially
 * (temperature, precipitation, wind), surface that so the overlay can flag low
 * confidence / show both. We compare against the EXISTING open-meteo integration
 * (integrations/open-meteo) via a small structural shim so this package keeps no
 * hard dependency on it (additive-only). The shim shape matches open-meteo's
 * `DailyWeather` arrays + `WeatherPoint`.
 */

import type { OblastForecast, OblastCode } from "./types";

/** Comparison point from ANY global feed, already collapsed to per-day values. */
export interface GlobalDailyPoint {
  date: string; // YYYY-MM-DD
  tempMaxC?: number;
  tempMinC?: number;
  precipMm?: number;
  windMaxMs?: number;
}

export interface GlobalForecastForOblast {
  oblast: OblastCode;
  source: "open-meteo" | "noaa" | string;
  days: GlobalDailyPoint[];
}

/** Thresholds beyond which a difference is "material". */
export interface DivergenceThresholds {
  tempC: number;
  precipMm: number;
  windMs: number;
}

export const DEFAULT_THRESHOLDS: DivergenceThresholds = {
  tempC: 4,
  precipMm: 8,
  windMs: 5,
};

export type DivergenceField = "tempMax" | "tempMin" | "precip" | "wind";

export interface DivergenceFinding {
  oblast: OblastCode;
  date: string;
  field: DivergenceField;
  ukrhydromet: number;
  global: number;
  globalSource: string;
  /** Absolute difference (ukrhydromet - global). */
  delta: number;
  note: { en: string; uk: string };
}

export interface DivergenceReport {
  generatedAt: string;
  comparedSource: string;
  findingCount: number;
  /** Mean absolute temperature delta across compared days (model agreement). */
  meanTempDeltaC: number;
  findings: DivergenceFinding[];
}

function diff(a: number | undefined, b: number | undefined): number | undefined {
  if (a === undefined || b === undefined || Number.isNaN(a) || Number.isNaN(b)) return undefined;
  return a - b;
}

function record(
  oblast: OblastCode,
  date: string,
  field: DivergenceField,
  ua: number,
  global: number,
  globalSource: string,
  unit: string,
): DivergenceFinding {
  const delta = ua - global;
  return {
    oblast,
    date,
    field,
    ukrhydromet: ua,
    global,
    globalSource,
    delta,
    note: {
      en: `${field} on ${date}: Ukrhydromet ${ua}${unit} vs ${globalSource} ${global}${unit} (Δ ${delta >= 0 ? "+" : ""}${delta.toFixed(1)}${unit})`,
      uk: `${field} ${date}: Укргідрометцентр ${ua}${unit} проти ${globalSource} ${global}${unit} (Δ ${delta >= 0 ? "+" : ""}${delta.toFixed(1)}${unit})`,
    },
  };
}

/**
 * Compare one oblast's UHMC forecast against a global feed for the same oblast.
 * Days are matched by date string.
 */
export function detectOblastDivergence(
  ua: OblastForecast,
  global: GlobalForecastForOblast,
  thresholds: DivergenceThresholds = DEFAULT_THRESHOLDS,
): DivergenceFinding[] {
  const findings: DivergenceFinding[] = [];
  const byDate = new Map<string, GlobalDailyPoint>();
  for (const g of global.days) byDate.set(g.date, g);

  for (const d of ua.days) {
    const g = byDate.get(d.date);
    if (!g) continue;

    const dTempMax = diff(d.tempMaxC, g.tempMaxC);
    if (dTempMax !== undefined && Math.abs(dTempMax) >= thresholds.tempC)
      findings.push(record(ua.oblast, d.date, "tempMax", d.tempMaxC, g.tempMaxC!, global.source, "°C"));

    const dTempMin = diff(d.tempMinC, g.tempMinC);
    if (dTempMin !== undefined && Math.abs(dTempMin) >= thresholds.tempC)
      findings.push(record(ua.oblast, d.date, "tempMin", d.tempMinC, g.tempMinC!, global.source, "°C"));

    const dPrecip = diff(d.precipMm, g.precipMm);
    if (dPrecip !== undefined && Math.abs(dPrecip) >= thresholds.precipMm)
      findings.push(record(ua.oblast, d.date, "precip", d.precipMm, g.precipMm!, global.source, "mm"));

    const dWind = diff(d.windSpeedMs, g.windMaxMs);
    if (dWind !== undefined && Math.abs(dWind) >= thresholds.windMs)
      findings.push(record(ua.oblast, d.date, "wind", d.windSpeedMs, g.windMaxMs!, global.source, "m/s"));
  }
  return findings;
}

/** Run divergence across many oblasts and summarise. */
export function buildDivergenceReport(
  uaForecasts: OblastForecast[],
  globalForecasts: GlobalForecastForOblast[],
  thresholds: DivergenceThresholds = DEFAULT_THRESHOLDS,
): DivergenceReport {
  const globalByOblast = new Map<OblastCode, GlobalForecastForOblast>();
  for (const g of globalForecasts) globalByOblast.set(g.oblast, g);

  const findings: DivergenceFinding[] = [];
  const tempDeltas: number[] = [];
  let comparedSource = globalForecasts[0]?.source ?? "open-meteo";

  for (const ua of uaForecasts) {
    const g = globalByOblast.get(ua.oblast);
    if (!g) continue;
    comparedSource = g.source;
    findings.push(...detectOblastDivergence(ua, g, thresholds));

    const byDate = new Map(g.days.map((d) => [d.date, d]));
    for (const d of ua.days) {
      const gd = byDate.get(d.date);
      const dt = diff(d.tempMaxC, gd?.tempMaxC);
      if (dt !== undefined) tempDeltas.push(Math.abs(dt));
    }
  }

  const meanTempDeltaC =
    tempDeltas.length > 0 ? tempDeltas.reduce((a, b) => a + b, 0) / tempDeltas.length : 0;

  return {
    generatedAt: new Date().toISOString(),
    comparedSource,
    findingCount: findings.length,
    meanTempDeltaC: Math.round(meanTempDeltaC * 10) / 10,
    findings,
  };
}

// ── Open-Meteo shim ─────────────────────────────────────────────────────────────

/**
 * Collapse an open-meteo daily block (integrations/open-meteo `DailyWeather`)
 * into our GlobalForecastForOblast. Kept structural so we don't import the
 * sibling package (additive-only). Pass the arrays straight from open-meteo's
 * `WeatherPoint.daily`.
 */
export function fromOpenMeteoDaily(
  oblast: OblastCode,
  daily: {
    time: string[];
    temperature2mMax: number[];
    temperature2mMin: number[];
    precipitationSum: number[];
    windSpeed10mMax: number[];
  },
): GlobalForecastForOblast {
  const days: GlobalDailyPoint[] = daily.time.map((t, i) => ({
    date: t.slice(0, 10),
    tempMaxC: daily.temperature2mMax[i],
    tempMinC: daily.temperature2mMin[i],
    precipMm: daily.precipitationSum[i],
    // open-meteo wind is km/h; convert to m/s to match UHMC units.
    windMaxMs: kmhToMs(daily.windSpeed10mMax[i]),
  }));
  return { oblast, source: "open-meteo", days };
}

export function kmhToMs(kmh: number): number {
  return Math.round((kmh / 3.6) * 10) / 10;
}
