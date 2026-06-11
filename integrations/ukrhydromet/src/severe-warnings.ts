/**
 * Per-oblast severe-weather warnings ("штормові попередження") from UHMC.
 *
 * UHMC issues graded warnings (I–III), which it maps to the EU Meteoalarm
 * yellow/orange/red colour scale. This module:
 *   - models a warning (per-oblast, phenomenon, level, validity window);
 *   - provides the colour/level taxonomy helpers (in types.ts) wired together;
 *   - parses an upstream warning feed when configured, else serves a DEMO set.
 *
 * Source: https://www.meteo.gov.ua/ (Гідрометцентр — штормові попередження).
 */

import type {
  OblastCode,
  SevereWarning,
  WarningLevel,
  WarningPhenomenon,
} from "./types";
import {
  OBLAST_GEO,
  WARNING_LEVEL_LABELS,
  WARNING_LEVEL_SEVERITY,
  PHENOMENON_LABELS,
} from "./types";

const USER_AGENT = "AegisLens/1.0 (+https://aegis-lens.app; severe-weather warnings)";

/** Raw upstream warning record (UHMC-derived JSON, when a feed is wired in). */
interface RawWarning {
  id?: string;
  oblast: string;
  phenomenon: string;
  level: string;
  onset: string;
  expires: string;
  issued?: string;
  text_uk?: string;
  text_en?: string;
}

const PHENOMENON_ALIASES: Record<string, WarningPhenomenon> = {
  wind: "wind", strong_wind: "wind", "вітер": "wind",
  rain: "rain", precip: "rain", "опади": "rain",
  thunderstorm: "thunderstorm", storm: "thunderstorm", "гроза": "thunderstorm",
  snow: "snow", snowfall: "snow",
  ice: "ice", glaze: "ice",
  fog: "fog",
  heat: "heat",
  frost: "frost",
  flood: "flood",
  fire: "fire_danger", fire_danger: "fire_danger",
};

const LEVEL_ALIASES: Record<string, WarningLevel> = {
  yellow: "yellow", "1": "yellow", i: "yellow",
  orange: "orange", "2": "orange", ii: "orange",
  red: "red", "3": "red", iii: "red",
};

export function parsePhenomenon(raw: string): WarningPhenomenon {
  return PHENOMENON_ALIASES[raw.toLowerCase().trim()] ?? "thunderstorm";
}

export function parseLevel(raw: string): WarningLevel {
  return LEVEL_ALIASES[raw.toLowerCase().trim()] ?? "yellow";
}

/** Numeric severity (1..5) for a warning level — re-exported helper. */
export function warningSeverity(level: WarningLevel): 1 | 2 | 3 | 4 | 5 {
  return WARNING_LEVEL_SEVERITY[level];
}

/** Colour hex for the map overlay. */
export function warningColor(level: WarningLevel): string {
  return WARNING_LEVEL_LABELS[level].colorHex;
}

/** Build a bilingual headline from structured fields if upstream omits text. */
export function buildHeadline(
  oblast: OblastCode,
  phenomenon: WarningPhenomenon,
  level: WarningLevel,
): { uk: string; en: string } {
  const geo = OBLAST_GEO[oblast];
  const ph = PHENOMENON_LABELS[phenomenon];
  const lvl = WARNING_LEVEL_LABELS[level];
  return {
    uk: `${lvl.uk}: ${ph.uk} — ${geo.nameUk} область`,
    en: `${lvl.en}: ${ph.en} — ${geo.nameEn} Oblast`,
  };
}

export class SevereWarningClient {
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

  /** Currently-active severe warnings across all oblasts. */
  async getActiveWarnings(): Promise<SevereWarning[]> {
    if (this.forceDemo || !this.baseUrl) return demoWarnings();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        const res = await fetch(`${this.baseUrl}/api/warnings`, {
          headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Ukrhydromet warnings ${res.status}`);
        const raw = (await res.json()) as RawWarning[];
        return raw.map((r) => this.parse(r));
      } finally {
        clearTimeout(timer);
      }
    } catch {
      return demoWarnings();
    }
  }

  private parse(raw: RawWarning): SevereWarning {
    const oblast = (OBLAST_GEO[raw.oblast as OblastCode] ? raw.oblast : "UA-30") as OblastCode;
    const phenomenon = parsePhenomenon(raw.phenomenon);
    const level = parseLevel(raw.level);
    const fallback = buildHeadline(oblast, phenomenon, level);
    return {
      warningId: raw.id ?? `uhmc:${oblast}:${phenomenon}:${raw.onset}`,
      oblast,
      phenomenon,
      level,
      onsetAt: raw.onset,
      expiresAt: raw.expires,
      issuedAt: raw.issued ?? new Date().toISOString(),
      headline: {
        uk: raw.text_uk ?? fallback.uk,
        en: raw.text_en ?? fallback.en,
      },
      source: "meteo.gov.ua",
    };
  }
}

/** True when `now` falls inside the warning's validity window. */
export function isWarningActive(w: SevereWarning, now = new Date()): boolean {
  const t = now.getTime();
  return Date.parse(w.onsetAt) <= t && t <= Date.parse(w.expiresAt);
}

// ── DEMO fixture ────────────────────────────────────────────────────────────────

export function demoWarnings(): SevereWarning[] {
  const now = Date.now();
  const iso = (offsetMs: number) => new Date(now + offsetMs).toISOString();

  const make = (
    oblast: OblastCode,
    phenomenon: WarningPhenomenon,
    level: WarningLevel,
    instructionUk: string,
    instructionEn: string,
  ): SevereWarning => {
    const headline = buildHeadline(oblast, phenomenon, level);
    return {
      warningId: `demo:${oblast}:${phenomenon}`,
      oblast,
      phenomenon,
      level,
      onsetAt: iso(-2 * 3_600_000),
      expiresAt: iso(10 * 3_600_000),
      issuedAt: iso(-3 * 3_600_000),
      headline,
      instruction: { uk: instructionUk, en: instructionEn },
      source: "meteo.gov.ua (demo)",
    };
  };

  return [
    make("UA-51", "wind", "orange",
      "Пориви вітру 18–23 м/с. Уникайте перебування під деревами та рекламними щитами.",
      "Wind gusts 18–23 m/s. Avoid trees and billboards; secure loose objects."),
    make("UA-46", "thunderstorm", "yellow",
      "Місцями грози, можливий град. Будьте обережні на дорогах.",
      "Isolated thunderstorms, hail possible. Take care on the roads."),
    make("UA-23", "rain", "red",
      "Дуже сильні дощі, ризик підтоплень. Уникайте низин і берегів річок.",
      "Very heavy rain, flooding risk. Avoid low ground and riverbanks."),
  ];
}
