/**
 * Cross-link comms outages to power outages (correlation).
 *
 * A loss of grid power is one of several plausible explanations for a comms
 * outage (towers and exchanges run on battery/generator for a limited time).
 * This module correlates a per-region communications severity with concurrent
 * power-outage coverage and produces a transparent correlation score.
 *
 * IMPORTANT — editorial neutrality (see TODO Примітки): correlation is NOT
 * causation. Comms outages can be intentional (sanctions, censorship, military
 * action) or caused by cable/BGP faults independent of power. This module only
 * reports the STRENGTH OF TEMPORAL/SPATIAL OVERLAP and an explicitly hedged
 * note; it never asserts that power loss caused the comms outage.
 */

import type { RegionSeverity } from "./severity-index";

/** Minimal shape of a power-outage event needed for correlation. */
export interface PowerOutageRef {
  regionCode: string;
  /** Fraction of region without power, 0–1. */
  coverage: number;
  /** Power-event confidence, 0–1. */
  confidence: number;
  /** "scheduled" | "damage" | "weather" | "unknown" */
  cause: string;
  startedAt: string; // ISO 8601
}

export interface CommsPowerCorrelation {
  regionCode: string;
  /** Comms severity index 0–100 for the region. */
  commsIndex: number;
  /** Power coverage 0–1 for the region (0 if no concurrent power outage). */
  powerCoverage: number;
  /**
   * Correlation strength 0–1: how strongly the comms disruption co-occurs with
   * a power outage in the same region. High = strong overlap, NOT proof.
   */
  correlation: number;
  /** True only when overlap is strong enough to surface a hedged hint. */
  powerLinked: boolean;
  /** Hedged, neutral explanatory note (en/uk). */
  note: { en: string; uk: string };
}

export interface CorrelationConfig {
  /** Correlation threshold above which `powerLinked` is set (default 0.5). */
  linkThreshold: number;
}

export const DEFAULT_CORRELATION_CONFIG: CorrelationConfig = { linkThreshold: 0.5 };

function neutralNote(correlation: number, powerCoverage: number): { en: string; uk: string } {
  if (powerCoverage <= 0) {
    return {
      en: "No concurrent power outage detected in this region — comms disruption appears unrelated to grid power.",
      uk: "Одночасних відключень електроенергії в цьому регіоні не виявлено — збій зв'язку, ймовірно, не пов'язаний з електромережею.",
    };
  }
  if (correlation >= 0.5) {
    return {
      en: "A concurrent power outage overlaps this comms disruption. This is a temporal/spatial correlation only — not confirmation that power loss is the cause (outages may also be intentional or caused by network faults).",
      uk: "Одночасне відключення електроенергії збігається з цим збоєм зв'язку. Це лише часовий/просторовий збіг — не підтвердження причини (збій також може бути навмисним або спричиненим мережевими несправностями).",
    };
  }
  return {
    en: "A partial power outage is present but overlap with this comms disruption is weak; causation cannot be inferred.",
    uk: "Присутнє часткове відключення електроенергії, але збіг із цим збоєм зв'язку слабкий; причинно-наслідковий зв'язок встановити не можна.",
  };
}

/**
 * Correlate comms severities with power outages by region.
 *
 * Correlation = normalisedCommsSeverity × powerCoverage × powerConfidence.
 * (All three high → strong overlap.) Scheduled blackouts are slightly
 * down-weighted because they are planned and operators usually pre-empt them.
 */
export function correlateCommsWithPower(
  commsSeverities: RegionSeverity[],
  powerOutages: PowerOutageRef[],
  config: CorrelationConfig = DEFAULT_CORRELATION_CONFIG,
): CommsPowerCorrelation[] {
  const powerByRegion = new Map<string, PowerOutageRef>();
  for (const p of powerOutages) {
    // Keep the most severe power event per region.
    const existing = powerByRegion.get(p.regionCode);
    if (!existing || p.coverage > existing.coverage) powerByRegion.set(p.regionCode, p);
  }

  return commsSeverities.map((c) => {
    const power = powerByRegion.get(c.regionCode);
    const powerCoverage = power?.coverage ?? 0;
    const commsNorm = Math.max(0, Math.min(1, c.index / 100));

    let correlation = 0;
    if (power) {
      const causeWeight = power.cause === "scheduled" ? 0.7 : 1;
      correlation = commsNorm * powerCoverage * power.confidence * causeWeight;
    }
    correlation = parseFloat(Math.max(0, Math.min(1, correlation)).toFixed(2));

    return {
      regionCode: c.regionCode,
      commsIndex: c.index,
      powerCoverage: parseFloat(powerCoverage.toFixed(2)),
      correlation,
      powerLinked: correlation >= config.linkThreshold,
      note: neutralNote(correlation, powerCoverage),
    };
  });
}
