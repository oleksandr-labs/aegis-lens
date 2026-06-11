/**
 * Travel risk scorer.
 *
 * Computes composite risk index for a city from:
 *   - Recent military events (weighted by severity + recency)
 *   - Infrastructure damage signals
 *   - Civil unrest events
 *   - Severe weather
 *   - Accessibility (airport, roads, border status)
 *
 * Score: 0–100 (0 = safe, 100 = extreme danger).
 * Decay: signals older than 30 days halve in weight.
 */

import type { RiskScore, RiskDimension, CityRiskIndex, RiskSignal, RiskLevel } from "./types";

const DIMENSION_WEIGHTS = {
  militaryActivity: 0.45,
  infrastructure: 0.20,
  civilUnrest: 0.15,
  weather: 0.10,
  accessibility: 0.10,
};

function scoreToLevel(score: number): RiskLevel {
  if (score >= 80) return "extreme";
  if (score >= 60) return "high";
  if (score >= 40) return "medium";
  if (score >= 20) return "low";
  return "minimal";
}

function decayWeight(occurredAt: string, nowMs = Date.now()): number {
  const ageMs = nowMs - new Date(occurredAt).getTime();
  const ageDays = ageMs / 86_400_000;
  if (ageDays <= 1) return 1.0;
  if (ageDays <= 7) return 0.9;
  if (ageDays <= 14) return 0.7;
  if (ageDays <= 30) return 0.5;
  return 0.2;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function distanceWeight(distKm: number, radiusKm: number): number {
  if (distKm <= radiusKm * 0.2) return 1.0;
  if (distKm <= radiusKm * 0.5) return 0.8;
  if (distKm <= radiusKm) return 0.5;
  return 0.0;
}

export function scoreMilitaryDimension(
  cityLat: number,
  cityLon: number,
  signals: RiskSignal[],
  radiusKm = 50,
): RiskDimension {
  const militarySignals = signals.filter(
    (s) => s.class === "military_action" || s.class === "explosion",
  );

  let rawScore = 0;
  const usedSignals: string[] = [];

  for (const sig of militarySignals) {
    const dist = haversineKm(cityLat, cityLon, sig.lat, sig.lon);
    const dw = distanceWeight(dist, radiusKm);
    if (dw === 0) continue;

    const decay = decayWeight(sig.occurredAt);
    const severityFactor = sig.severity / 3;
    rawScore += severityFactor * dw * decay * 30;
    usedSignals.push(`${sig.class} (${dist.toFixed(0)}km, sev ${sig.severity})`);
  }

  const score = Math.min(100, rawScore);
  return {
    name: "militaryActivity",
    score,
    weight: DIMENSION_WEIGHTS.militaryActivity,
    signals: usedSignals.slice(0, 5),
  };
}

export function scoreInfrastructureDimension(
  cityLat: number,
  cityLon: number,
  signals: RiskSignal[],
  radiusKm = 30,
): RiskDimension {
  const infraSignals = signals.filter(
    (s) => s.class === "infrastructure_damage" || s.class === "power_outage",
  );

  let rawScore = 0;
  const usedSignals: string[] = [];

  for (const sig of infraSignals) {
    const dist = haversineKm(cityLat, cityLon, sig.lat, sig.lon);
    const dw = distanceWeight(dist, radiusKm);
    if (dw === 0) continue;

    const decay = decayWeight(sig.occurredAt);
    rawScore += (sig.severity / 3) * dw * decay * 25;
    usedSignals.push(`${sig.class} (${dist.toFixed(0)}km)`);
  }

  return {
    name: "infrastructure",
    score: Math.min(100, rawScore),
    weight: DIMENSION_WEIGHTS.infrastructure,
    signals: usedSignals.slice(0, 3),
  };
}

export function scoreWeatherDimension(signals: RiskSignal[]): RiskDimension {
  const weatherSignals = signals.filter((s) => s.class === "environmental");
  const maxSeverity = weatherSignals.reduce((max, s) => Math.max(max, s.severity), 0);
  const score = (maxSeverity / 3) * 60;
  return {
    name: "weather",
    score,
    weight: DIMENSION_WEIGHTS.weather,
    signals: weatherSignals.map((s) => `${s.class} sev ${s.severity}`).slice(0, 2),
  };
}

export function computeCompositeRisk(dimensions: Record<string, RiskDimension>): RiskScore {
  let weightedSum = 0;
  let totalWeight = 0;
  const allSignals: string[] = [];

  for (const dim of Object.values(dimensions)) {
    weightedSum += dim.score * dim.weight;
    totalWeight += dim.weight;
    allSignals.push(...dim.signals);
  }

  const score = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  const signalCount = allSignals.length;
  const confidence = Math.min(1, signalCount / 10);

  const caveats: string[] = [];
  if (confidence < 0.3) caveats.push("Limited signal data — estimate may be inaccurate");
  if (dimensions.militaryActivity.score > 70) caveats.push("Active conflict zone — avoid non-essential travel");

  return { score, level: scoreToLevel(score), confidence, caveats };
}

export function generateAdvisoryText(
  cityName: string,
  composite: RiskScore,
  dimensions: Record<string, RiskDimension>,
): { en: string; uk: string } {
  const levelTexts: Record<RiskLevel, string> = {
    extreme: "DO NOT TRAVEL. Active conflict and extreme danger present.",
    high: "Reconsider travel. Significant security risks remain.",
    medium: "Exercise high caution. Monitor situation closely.",
    low: "Exercise normal precautions.",
    minimal: "Generally safe. Standard travel awareness applies.",
  };

  const levelTextsUk: Record<RiskLevel, string> = {
    extreme: "НЕ ПОДОРОЖУЙТЕ. Активний конфлікт та надзвичайна небезпека.",
    high: "Перегляньте плани. Значні ризики безпеки.",
    medium: "Дотримуйтесь підвищеної обережності. Стежте за ситуацією.",
    low: "Дотримуйтесь звичайних застережень.",
    minimal: "Загалом безпечно. Стандартна уважність.",
  };

  const base = levelTexts[composite.level];
  const baseUk = levelTextsUk[composite.level];

  return {
    en: `${cityName}: Risk ${composite.level.toUpperCase()} (${composite.score}/100). ${base}`,
    uk: `${cityName}: Ризик ${composite.level.toUpperCase()} (${composite.score}/100). ${baseUk}`,
  };
}
