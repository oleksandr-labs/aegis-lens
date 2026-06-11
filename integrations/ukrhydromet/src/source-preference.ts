/**
 * Geo-gated weather source preference.
 *
 * Product rule (TODO task 7): inside Ukraine the weather overlay defaults to the
 * national authority (Ukrhydromet); outside the UA bbox it falls back to the
 * global model (Open-Meteo). This module is the pure decision function the
 * overlay + API route call — no I/O.
 */

import { UKRAINE_BBOX, OBLAST_GEO } from "./types";
import type { OblastCode } from "./types";

export type WeatherSource = "ukrhydromet" | "open-meteo";

export interface SourceDecision {
  source: WeatherSource;
  insideUa: boolean;
  reason: { en: string; uk: string };
  attribution: { en: string; uk: string };
  attributionUrl: string;
}

const ATTRIBUTION: Record<WeatherSource, { attribution: { en: string; uk: string }; url: string }> = {
  ukrhydromet: {
    attribution: {
      en: "Weather: Ukrainian Hydrometeorological Center (meteo.gov.ua)",
      uk: "Погода: Український гідрометеорологічний центр (meteo.gov.ua)",
    },
    url: "https://www.meteo.gov.ua/",
  },
  "open-meteo": {
    attribution: {
      en: "Weather: Open-Meteo (open-meteo.com)",
      uk: "Погода: Open-Meteo (open-meteo.com)",
    },
    url: "https://open-meteo.com/",
  },
};

/** True when a point falls inside the mainland-Ukraine bounding box. */
export function isInsideUkraine(lat: number, lon: number): boolean {
  return (
    lat >= UKRAINE_BBOX.minLat &&
    lat <= UKRAINE_BBOX.maxLat &&
    lon >= UKRAINE_BBOX.minLon &&
    lon <= UKRAINE_BBOX.maxLon
  );
}

/**
 * Decide which weather source to use for a coordinate.
 * Inside UA → Ukrhydromet (national authority). Otherwise → Open-Meteo.
 */
export function selectWeatherSource(lat: number, lon: number): SourceDecision {
  const insideUa = isInsideUkraine(lat, lon);
  const source: WeatherSource = insideUa ? "ukrhydromet" : "open-meteo";
  const attr = ATTRIBUTION[source];
  return {
    source,
    insideUa,
    reason: insideUa
      ? { en: "Inside Ukraine — using the national meteorological authority.", uk: "В межах України — використовується національна метеослужба." }
      : { en: "Outside Ukraine — using the global model.", uk: "За межами України — використовується глобальна модель." },
    attribution: attr.attribution,
    attributionUrl: attr.url,
  };
}

/** Resolve the nearest oblast centre to a UA coordinate (for forecast lookup). */
export function nearestOblast(lat: number, lon: number): OblastCode {
  let best: OblastCode = "UA-30";
  let bestDist = Infinity;
  for (const code of Object.keys(OBLAST_GEO) as OblastCode[]) {
    const [olon, olat] = OBLAST_GEO[code].center;
    const d = (lat - olat) ** 2 + (lon - olon) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = code;
    }
  }
  return best;
}
