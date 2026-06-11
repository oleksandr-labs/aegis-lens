/**
 * Shadow-fleet tracking module.
 *
 * The "shadow" (or "dark") fleet is the pool of ageing tankers used to move
 * sanctioned crude above the price cap. There is no official roster, so we score
 * vessels against a set of public behavioural indicators and emit a typed
 * assessment with reasons (EN + UK). This is a transparent heuristic, not an
 * accusation — confidence and contributing factors are always returned.
 */

import type { VesselRegistryEntry, AisStatus, Scored } from "./types";
import type { PortCall } from "./port-calls";

export interface ShadowFleetSignals {
  registry: VesselRegistryEntry;
  ais_status: AisStatus;
  /** Recent port calls — STS transfers and sanctioned-port visits matter */
  recent_port_calls: PortCall[];
  /** Number of flag changes in the trailing 24 months, if known */
  flag_changes_24m?: number;
  /** True if the vessel's P&I insurance is unknown / unverifiable */
  insurance_unknown?: boolean;
  /** Hours of AIS gaps in the trailing 30 days, if known */
  ais_dark_hours_30d?: number;
}

export type ShadowFleetTier = "none" | "watch" | "likely" | "high";

export interface ShadowFleetAssessment {
  mmsi: string;
  /** Aggregate shadow-fleet score 0..1 */
  score: number;
  tier: ShadowFleetTier;
  /** Confidence in the underlying signals */
  confidence: Scored<ShadowFleetTier>;
  factorsEn: string[];
  factorsUk: string[];
}

const AGEING_THRESHOLD_YEARS = 15;

/** Score a vessel against shadow-fleet behavioural indicators. */
export function assessShadowFleet(signals: ShadowFleetSignals): ShadowFleetAssessment {
  const { registry } = signals;
  const factorsEn: string[] = [];
  const factorsUk: string[] = [];
  let score = 0;

  // Ageing tanker — the classic shadow-fleet hull profile.
  const age = registry.year_built ? new Date().getFullYear() - registry.year_built : null;
  const isTanker = registry.ship_type === "tanker";
  if (isTanker && age !== null && age >= AGEING_THRESHOLD_YEARS) {
    score += 0.2;
    factorsEn.push(`Ageing tanker (${age} yrs).`);
    factorsUk.push(`Старий танкер (${age} р.).`);
  }

  // Flag of convenience.
  if (registry.flag_of_convenience) {
    score += 0.2;
    factorsEn.push(`Flag of convenience (${registry.flag_name_en ?? registry.flag}).`);
    factorsUk.push(`Зручний прапор (${registry.flag_name_uk ?? registry.flag}).`);
  }

  // Opaque ownership.
  if (registry.operator?.opaque_ownership) {
    score += 0.15;
    factorsEn.push("Opaque / shell-company ownership.");
    factorsUk.push("Непрозора власність (компанії-оболонки).");
  }

  // Frequent re-flagging.
  if ((signals.flag_changes_24m ?? 0) >= 2) {
    score += 0.15;
    factorsEn.push(`${signals.flag_changes_24m} flag changes in 24 months.`);
    factorsUk.push(`${signals.flag_changes_24m} змін прапора за 24 місяці.`);
  }

  // AIS manipulation / dark running.
  if (signals.ais_status === "dark" || (signals.ais_dark_hours_30d ?? 0) >= 24) {
    score += 0.2;
    factorsEn.push("Extended AIS gaps / dark running.");
    factorsUk.push("Тривалі прогалини AIS / рух без AIS.");
  }

  // STS transfers — the laundering mechanism.
  const stsCalls = signals.recent_port_calls.filter((c) => c.is_sts_zone).length;
  if (stsCalls > 0) {
    score += Math.min(0.2, 0.1 * stsCalls);
    factorsEn.push(`${stsCalls} ship-to-ship transfer(s) in known STS zones.`);
    factorsUk.push(`${stsCalls} перевалок «судно-судно» у відомих зонах STS.`);
  }

  // Sanctioned-port calls.
  const ruCalls = signals.recent_port_calls.filter((c) => c.country === "RU").length;
  if (ruCalls > 0) {
    score += Math.min(0.15, 0.05 * ruCalls);
    factorsEn.push(`${ruCalls} call(s) at Russian oil ports.`);
    factorsUk.push(`${ruCalls} заходів до російських нафтопортів.`);
  }

  // Unknown insurance.
  if (signals.insurance_unknown) {
    score += 0.1;
    factorsEn.push("Unverifiable P&I insurance.");
    factorsUk.push("Неможливо підтвердити страхування P&I.");
  }

  score = Math.min(1, Math.round(score * 100) / 100);
  const tier = scoreToTier(score);

  return {
    mmsi: registry.mmsi,
    score,
    tier,
    confidence: { value: tier, confidence: factorsEn.length >= 2 ? 0.7 : 0.45, sourceCount: factorsEn.length },
    factorsEn,
    factorsUk,
  };
}

export function scoreToTier(score: number): ShadowFleetTier {
  if (score >= 0.7) return "high";
  if (score >= 0.45) return "likely";
  if (score >= 0.2) return "watch";
  return "none";
}
