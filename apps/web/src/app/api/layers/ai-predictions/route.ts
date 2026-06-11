/**
 * GET /api/layers/ai-predictions — AI forecasting layer
 *
 * IMPORTANT: This layer displays probabilistic forecasts, NOT observations.
 * Every response includes "isPrediction: true" and UI must display the
 * "AI prediction — not observation" badge prominently.
 *
 * This layer is DISABLED for civilian persona by default.
 *
 * Query params:
 *   region        — ISO 3166-2 oblast code
 *   horizon       — 24h | 7d (default: 24h)
 *   type          — event_density | escalation_index | anomaly_probability
 *   minProb       — minimum probability 0–1
 *
 * Cache: 1800s (predictions update every 30 min)
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type PredictionHorizon = "24h" | "7d";
type PredictionType = "event_density" | "escalation_index" | "anomaly_probability";

interface RegionPrediction {
  predictionId: string;
  regionCode: string;
  regionName: string;
  /** ISO-8601 forecast valid time start */
  validFrom: string;
  /** ISO-8601 forecast valid time end */
  validTo: string;
  type: PredictionType;
  /** Predicted value (events/day for density; 0–1 for indices) */
  predictedValue: number;
  /** 90% confidence interval */
  ci90: { low: number; high: number };
  /** 0–1 model confidence in this prediction */
  modelConfidence: number;
  /** Which model version produced this */
  modelVersion: string;
  /** Comparison to 7-day baseline */
  vsBaseline: number;
  /** Conflict escalation risk 0–1 */
  escalationProbability?: number;
  lat: number;
  lon: number;
  /**
   * REQUIRED: always true. UI must display the "AI prediction" badge.
   * Do not confuse with observed events.
   */
  isPrediction: true;
  /** Disclaimer shown in UI */
  disclaimerEn: string;
  disclaimerUk: string;
}

const OBLAST_DATA: Record<string, { en: string; lat: number; lon: number }> = {
  "UA-63": { en: "Kharkiv", lat: 49.99, lon: 36.23 },
  "UA-30": { en: "Kyiv City", lat: 50.45, lon: 30.52 },
  "UA-14": { en: "Donetsk", lat: 48.0, lon: 37.8 },
  "UA-23": { en: "Zaporizhzhia", lat: 47.84, lon: 35.14 },
  "UA-65": { en: "Kherson", lat: 46.65, lon: 32.61 },
  "UA-48": { en: "Mykolaiv", lat: 46.97, lon: 31.99 },
  "UA-46": { en: "Lviv", lat: 49.84, lon: 24.02 },
  "UA-12": { en: "Dnipropetrovsk", lat: 48.46, lon: 35.04 },
  "UA-59": { en: "Sumy", lat: 50.91, lon: 34.8 },
  "UA-09": { en: "Luhansk", lat: 48.57, lon: 39.3 },
};

const DISCLAIMER_EN =
  "AI forecast — not an observation. Predictions are probabilistic and may be incorrect. Do not use for tactical decisions.";
const DISCLAIMER_UK =
  "AI-прогноз — не спостереження. Прогнози є ймовірнісними та можуть бути неточними. Не використовувати для тактичних рішень.";

// Demo density predictions (events/day estimates for 24h horizon)
const DENSITY_ESTIMATES: Record<string, { density: number; escalation: number; vsBaseline: number }> = {
  "UA-14": { density: 18.4, escalation: 0.82, vsBaseline: 1.3 },
  "UA-63": { density: 12.1, escalation: 0.71, vsBaseline: 1.15 },
  "UA-09": { density: 14.7, escalation: 0.78, vsBaseline: 1.2 },
  "UA-23": { density: 8.3, escalation: 0.55, vsBaseline: 1.05 },
  "UA-65": { density: 6.2, escalation: 0.48, vsBaseline: 0.95 },
  "UA-30": { density: 4.5, escalation: 0.35, vsBaseline: 0.9 },
  "UA-48": { density: 3.8, escalation: 0.31, vsBaseline: 0.88 },
  "UA-46": { density: 2.1, escalation: 0.18, vsBaseline: 0.82 },
  "UA-12": { density: 5.7, escalation: 0.42, vsBaseline: 1.0 },
  "UA-59": { density: 7.3, escalation: 0.52, vsBaseline: 1.08 },
};

function buildPredictions(type: PredictionType, horizon: PredictionHorizon): RegionPrediction[] {
  const now = new Date();
  const hoursAhead = horizon === "24h" ? 24 : 168;
  const validFrom = now.toISOString();
  const validTo = new Date(now.getTime() + hoursAhead * 3600_000).toISOString();

  const predictions: RegionPrediction[] = [];
  let i = 0;

  for (const [regionCode, data] of Object.entries(DENSITY_ESTIMATES)) {
    const oblast = OBLAST_DATA[regionCode];
    if (!oblast) continue;

    let predictedValue: number;
    let ci90: { low: number; high: number };

    if (type === "event_density") {
      const multiplier = horizon === "7d" ? 7 : 1;
      predictedValue = parseFloat((data.density * multiplier).toFixed(1));
      ci90 = {
        low: parseFloat((predictedValue * 0.65).toFixed(1)),
        high: parseFloat((predictedValue * 1.45).toFixed(1)),
      };
    } else if (type === "escalation_index") {
      predictedValue = parseFloat(data.escalation.toFixed(2));
      ci90 = {
        low: parseFloat((data.escalation * 0.75).toFixed(2)),
        high: Math.min(1, parseFloat((data.escalation * 1.25).toFixed(2))),
      };
    } else {
      // anomaly_probability
      predictedValue = parseFloat(Math.min(0.99, data.escalation * 1.1).toFixed(2));
      ci90 = {
        low: parseFloat((predictedValue * 0.7).toFixed(2)),
        high: Math.min(0.99, parseFloat((predictedValue * 1.3).toFixed(2))),
      };
    }

    predictions.push({
      predictionId: `pred-${i++}`,
      regionCode,
      regionName: oblast.en,
      validFrom,
      validTo,
      type,
      predictedValue,
      ci90,
      modelConfidence: parseFloat((0.55 + Math.random() * 0.2).toFixed(2)),
      modelVersion: "aegis-forecast-v0.3",
      vsBaseline: data.vsBaseline,
      escalationProbability: data.escalation,
      lat: oblast.lat,
      lon: oblast.lon,
      isPrediction: true,
      disclaimerEn: DISCLAIMER_EN,
      disclaimerUk: DISCLAIMER_UK,
    });
  }

  return predictions.sort((a, b) => b.predictedValue - a.predictedValue);
}

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`layers:ai-predictions:${ip}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const regionFilter = url.searchParams.get("region");
  const horizon = (url.searchParams.get("horizon") as PredictionHorizon) ?? "24h";
  const type = (url.searchParams.get("type") as PredictionType) ?? "event_density";
  const minProb = parseFloat(url.searchParams.get("minProb") ?? "0");

  if (!["24h", "7d"].includes(horizon)) {
    return NextResponse.json({ error: "invalid_horizon", valid: ["24h", "7d"] }, { status: 400 });
  }
  if (!["event_density", "escalation_index", "anomaly_probability"].includes(type)) {
    return NextResponse.json({ error: "invalid_type", valid: ["event_density", "escalation_index", "anomaly_probability"] }, { status: 400 });
  }

  let predictions = buildPredictions(type, horizon);

  if (regionFilter) predictions = predictions.filter((p) => p.regionCode === regionFilter);
  if (minProb > 0) predictions = predictions.filter((p) => p.predictedValue >= minProb);

  const meta = {
    total: predictions.length,
    horizon,
    type,
    modelVersion: "aegis-forecast-v0.3",
    generatedAt: new Date().toISOString(),
    isDemo: true,
    isPrediction: true,
    disclaimer: DISCLAIMER_EN,
    disclaimerUk: DISCLAIMER_UK,
  };

  return NextResponse.json(
    { data: predictions, meta },
    {
      headers: {
        "Cache-Control": "public, max-age=1800, stale-while-revalidate=3600",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
