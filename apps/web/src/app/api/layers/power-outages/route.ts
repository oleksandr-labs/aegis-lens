/**
 * GET /api/layers/power-outages — multi-signal power outage layer
 *
 * Query params:
 *   region — filter by ISO 3166-2:UA oblast code (e.g. "UA-63")
 *   status  — filter by status: active | partial | scheduled | restored
 *   cause   — filter by cause: damage | scheduled | weather | unknown
 *   minSeverity — integer 1-5
 *   minDurationHours — only outages ongoing at least this many hours (since startedAt)
 *   maxDurationHours — only outages ongoing at most this many hours (since startedAt)
 *   forecast — "1"/"true" to include a clearly-labeled forecast block (predictions, not observations)
 *
 * Demo: signals are generated from a static scheduled-blackout table and
 * seeded damage signals. In production these come from live integrations.
 *
 * Cache: 60s / stale-while-revalidate 120s (outages change every few hours).
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// ---------- inline types (avoids transpile issues) ----------

type OutageCause = "damage" | "scheduled" | "weather" | "unknown";
type OutageStatus = "active" | "partial" | "scheduled" | "restored";

interface OutageSignal {
  source: string;
  regionCode: string;
  confidence: number;
  detectedAt: string;
  cause: OutageCause;
  estimatedCoverage?: number;
}

interface OutageEvent {
  outageId: string;
  regionCode: string;
  regionName: string;
  status: OutageStatus;
  cause: OutageCause;
  confidence: number;
  coverage: number;
  severity: 1 | 2 | 3 | 4 | 5;
  startedAt: string;
  estimatedRestorationAt: string | null;
  restoredAt: string | null;
  summaryEn: string;
  summaryUk: string;
}

// ---------- static seed data ----------

const OBLAST_NAMES: Record<string, { en: string; uk: string }> = {
  "UA-71": { en: "Cherkasy",        uk: "Черкаська" },
  "UA-74": { en: "Chernihiv",       uk: "Чернігівська" },
  "UA-77": { en: "Chernivtsi",      uk: "Чернівецька" },
  "UA-12": { en: "Dnipropetrovsk",  uk: "Дніпропетровська" },
  "UA-14": { en: "Donetsk",         uk: "Донецька" },
  "UA-26": { en: "Ivano-Frankivsk", uk: "Івано-Франківська" },
  "UA-63": { en: "Kharkiv",         uk: "Харківська" },
  "UA-65": { en: "Kherson",         uk: "Херсонська" },
  "UA-68": { en: "Khmelnytskyi",    uk: "Хмельницька" },
  "UA-35": { en: "Kirovohrad",      uk: "Кіровоградська" },
  "UA-30": { en: "Kyiv City",       uk: "м. Київ" },
  "UA-32": { en: "Kyiv",            uk: "Київська" },
  "UA-09": { en: "Luhansk",         uk: "Луганська" },
  "UA-46": { en: "Lviv",            uk: "Львівська" },
  "UA-48": { en: "Mykolaiv",        uk: "Миколаївська" },
  "UA-51": { en: "Odesa",           uk: "Одеська" },
  "UA-53": { en: "Poltava",         uk: "Полтавська" },
  "UA-56": { en: "Rivne",           uk: "Рівненська" },
  "UA-59": { en: "Sumy",            uk: "Сумська" },
  "UA-61": { en: "Ternopil",        uk: "Тернопільська" },
  "UA-05": { en: "Vinnytsia",       uk: "Вінницька" },
  "UA-07": { en: "Volyn",           uk: "Волинська" },
  "UA-21": { en: "Zakarpattia",     uk: "Закарпатська" },
  "UA-23": { en: "Zaporizhzhia",    uk: "Запорізька" },
  "UA-18": { en: "Zhytomyr",        uk: "Житомирська" },
};

// Seeded damage outages (demo)
const DAMAGE_SIGNALS: OutageSignal[] = [
  {
    source: "telegram_channel",
    regionCode: "UA-63",
    confidence: 0.82,
    detectedAt: new Date(Date.now() - 4 * 3600_000).toISOString(),
    cause: "damage",
    estimatedCoverage: 0.45,
  },
  {
    source: "cloudflare_radar",
    regionCode: "UA-63",
    confidence: 0.65,
    detectedAt: new Date(Date.now() - 3.5 * 3600_000).toISOString(),
    cause: "damage",
    estimatedCoverage: 0.4,
  },
  {
    source: "telegram_channel",
    regionCode: "UA-14",
    confidence: 0.9,
    detectedAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
    cause: "damage",
    estimatedCoverage: 0.7,
  },
  {
    source: "community_report",
    regionCode: "UA-14",
    confidence: 0.55,
    detectedAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
    cause: "damage",
    estimatedCoverage: 0.6,
  },
  {
    source: "telegram_channel",
    regionCode: "UA-48",
    confidence: 0.72,
    detectedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    cause: "damage",
    estimatedCoverage: 0.35,
  },
];

// Scheduled signals (mimic what the schedule adapter would produce)
const SCHEDULED_SIGNALS: OutageSignal[] = [
  { source: "scheduled_blackout", regionCode: "UA-12", confidence: 0.95, detectedAt: new Date(Date.now() - 1800_000).toISOString(), cause: "scheduled", estimatedCoverage: 0.17 },
  { source: "scheduled_blackout", regionCode: "UA-51", confidence: 0.95, detectedAt: new Date(Date.now() - 1800_000).toISOString(), cause: "scheduled", estimatedCoverage: 0.17 },
  { source: "scheduled_blackout", regionCode: "UA-30", confidence: 0.95, detectedAt: new Date(Date.now() - 1800_000).toISOString(), cause: "scheduled", estimatedCoverage: 0.17 },
];

function weightedConf(signals: OutageSignal[]): number {
  const weights: Record<string, number> = { scheduled_blackout: 1.0, telegram_channel: 0.75, cloudflare_radar: 0.6, community_report: 0.5, viirs_nightlights: 0.8 };
  let ws = 0, wt = 0;
  for (const s of signals) { const w = weights[s.source] ?? 0.5; ws += s.confidence * w; wt += w; }
  return wt > 0 ? Math.min(1, ws / wt) : 0;
}

function avgCov(signals: OutageSignal[]): number {
  const has = signals.filter((s) => s.estimatedCoverage != null);
  if (!has.length) return 0.3;
  return has.reduce((sum, s) => sum + (s.estimatedCoverage ?? 0), 0) / has.length;
}

function toSeverity(cov: number): 1 | 2 | 3 | 4 | 5 {
  if (cov >= 0.8) return 5;
  if (cov >= 0.6) return 4;
  if (cov >= 0.4) return 3;
  if (cov >= 0.2) return 2;
  return 1;
}

function buildOutages(): OutageEvent[] {
  const allSignals = [...DAMAGE_SIGNALS, ...SCHEDULED_SIGNALS];
  const byRegion = new Map<string, OutageSignal[]>();
  for (const s of allSignals) {
    const arr = byRegion.get(s.regionCode) ?? [];
    arr.push(s);
    byRegion.set(s.regionCode, arr);
  }

  const events: OutageEvent[] = [];
  let i = 0;
  for (const [regionCode, sigs] of byRegion) {
    const conf = weightedConf(sigs);
    if (conf < 0.3) continue;
    const cov = avgCov(sigs);
    const cause = sigs[0].cause;
    const status: OutageStatus = cause === "scheduled" ? "scheduled" : conf >= 0.7 ? "active" : "partial";
    const sev = toSeverity(cov);
    const earliest = sigs.map((s) => s.detectedAt).sort()[0];
    const names = OBLAST_NAMES[regionCode] ?? { en: regionCode, uk: regionCode };
    const pct = Math.round(cov * 100);
    const causeEn = cause === "damage" ? "infrastructure damage" : cause === "scheduled" ? "scheduled blackout" : cause;
    const causeUk = cause === "damage" ? "пошкодження інфраструктури" : cause === "scheduled" ? "планових відключень" : cause;
    events.push({
      outageId: `outage-${i++}`,
      regionCode,
      regionName: names.en,
      status,
      cause,
      confidence: parseFloat(conf.toFixed(2)),
      coverage: parseFloat(cov.toFixed(2)),
      severity: sev,
      startedAt: earliest,
      estimatedRestorationAt: null,
      restoredAt: null,
      summaryEn: `${names.en} oblast: ${status} power outage (~${pct}% affected) due to ${causeEn}. Severity: ${sev}/5.`,
      summaryUk: `${names.uk} область: відключення електроенергії (~${pct}% постраждало) через ${causeUk}. Рівень: ${sev}/5.`,
    });
  }

  return events.sort((a, b) => b.severity - a.severity);
}

// ---------- forecast (clearly-labeled prediction) ----------

const FORECAST_DISCLAIMER = {
  en: "Prediction — not an observation. Forecasted outage likelihood from schedules and recent patterns; actual supply may differ.",
  uk: "Прогноз — не спостереження. Ймовірність відключення за графіками та нещодавніми патернами; фактичне постачання може відрізнятися.",
};

interface OutageForecast {
  isPrediction: true;
  regionCode: string;
  regionName: string;
  windowStart: string;
  windowEnd: string;
  probability: number;
  likelyCause: OutageCause;
  expectedCoverage: number;
  summaryEn: string;
  summaryUk: string;
  disclaimer: { en: string; uk: string };
}

/**
 * Heuristic recurrence forecast over the current outages: regions currently in
 * active/partial outage are flagged as likely to keep shedding over the next 6h.
 * Every item is isPrediction:true with a bilingual disclaimer.
 */
function buildForecasts(events: OutageEvent[], horizonHours = 6): OutageForecast[] {
  const now = Date.now();
  const causeEnF: Record<OutageCause, string> = {
    damage: "infrastructure damage", scheduled: "scheduled rotation",
    weather: "severe weather", unknown: "recurring instability",
  };
  const causeUkF: Record<OutageCause, string> = {
    damage: "пошкодження інфраструктури", scheduled: "планової ротації",
    weather: "несприятливої погоди", unknown: "повторюваної нестабільності",
  };

  return events
    .filter((e) => e.status === "active" || e.status === "partial")
    .map((e) => {
      const probability = parseFloat(Math.min(0.8, 0.4 + 0.5 * e.confidence).toFixed(2));
      const pct = Math.round(e.coverage * 100);
      return {
        isPrediction: true as const,
        regionCode: e.regionCode,
        regionName: e.regionName,
        windowStart: new Date(now).toISOString(),
        windowEnd: new Date(now + horizonHours * 3600_000).toISOString(),
        probability,
        likelyCause: e.cause,
        expectedCoverage: e.coverage,
        summaryEn: `${e.regionName} oblast: ${Math.round(probability * 100)}% chance of continued outage within ${horizonHours}h due to ${causeEnF[e.cause]} (~${pct}% expected).`,
        summaryUk: `${e.regionName} область: ${Math.round(probability * 100)}% ймовірності продовження відключення протягом ${horizonHours} год через ${causeUkF[e.cause]} (~${pct}% очікувано).`,
        disclaimer: FORECAST_DISCLAIMER,
      };
    })
    .sort((a, b) => b.probability - a.probability);
}

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`layers:power-outages:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const regionFilter = url.searchParams.get("region");
  const statusFilter = url.searchParams.get("status") as OutageStatus | null;
  const causeFilter = url.searchParams.get("cause") as OutageCause | null;
  const minSev = parseInt(url.searchParams.get("minSeverity") ?? "1", 10);
  const minDurationHours = parseFloat(url.searchParams.get("minDurationHours") ?? "");
  const maxDurationHours = parseFloat(url.searchParams.get("maxDurationHours") ?? "");
  const includeForecast = ["1", "true"].includes((url.searchParams.get("forecast") ?? "").toLowerCase());

  let events = buildOutages();

  if (regionFilter) events = events.filter((e) => e.regionCode === regionFilter);
  if (statusFilter) events = events.filter((e) => e.status === statusFilter);
  if (causeFilter) events = events.filter((e) => e.cause === causeFilter);
  if (minSev > 1) events = events.filter((e) => e.severity >= minSev);

  // Duration facet: hours elapsed since the outage started.
  const now = Date.now();
  const durationHours = (e: OutageEvent) => (now - new Date(e.startedAt).getTime()) / 3600_000;
  if (!Number.isNaN(minDurationHours)) events = events.filter((e) => durationHours(e) >= minDurationHours);
  if (!Number.isNaN(maxDurationHours)) events = events.filter((e) => durationHours(e) <= maxDurationHours);

  const forecasts = includeForecast ? buildForecasts(events) : undefined;

  const meta = {
    total: events.length,
    active: events.filter((e) => e.status === "active").length,
    scheduled: events.filter((e) => e.status === "scheduled").length,
    restored: events.filter((e) => e.status === "restored").length,
    generatedAt: new Date().toISOString(),
    isDemo: true,
    forecastIncluded: includeForecast,
  };

  return NextResponse.json(
    { data: events, ...(forecasts ? { forecasts } : {}), meta },
    {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
