/**
 * Dry-run engine for alert rules.
 *
 * Given a ParsedRule, runs it against a historical event window (default: 30 days)
 * and returns match count, sample matches, estimated daily alert volume, and
 * a "too noisy?" flag with optional refinement suggestion.
 *
 * This is purely in-process (no DB) — pass events in as RuleEvent[].
 * In production, wire to the Postgres/Elastic event store.
 */

import type { ParsedRule, DryRunResult } from "./types";

export interface RuleEvent {
  eventId: string;
  class: string;
  subclass?: string;
  severity: number;
  confidence: number;
  lat?: number;
  lon?: number;
  summary: string;
  occurredAt: string;
  source?: string;
  keywords?: string[];
}

// Noisy if >50 alerts/day on average
const NOISY_THRESHOLD_DAILY = 50;

/** Haversine distance in km */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function matchesRule(event: RuleEvent, rule: ParsedRule): boolean {
  // Class filter
  if (rule.eventClasses && rule.eventClasses.length > 0) {
    if (!rule.eventClasses.includes(event.class)) return false;
  }

  // Subclass filter
  if (rule.subclasses && rule.subclasses.length > 0 && event.subclass) {
    if (!rule.subclasses.includes(event.subclass)) return false;
  }

  // Min severity
  if (rule.minSeverity !== undefined && event.severity < rule.minSeverity) return false;

  // Min confidence
  if (rule.minConfidence !== undefined && event.confidence < rule.minConfidence) return false;

  // Geo filter
  if (rule.geo && event.lat !== undefined && event.lon !== undefined) {
    const geoLat = rule.geo.lat;
    const geoLon = rule.geo.lon;
    if (geoLat !== undefined && geoLon !== undefined) {
      const dist = haversineKm(event.lat, event.lon, geoLat, geoLon);
      if (dist > rule.geo.radiusKm) return false;
    }
  }

  // Source filter
  if (rule.sources && rule.sources.length > 0 && event.source) {
    if (!rule.sources.includes(event.source)) return false;
  }

  // Keyword filter
  if (rule.keywords && rule.keywords.length > 0) {
    const summaryLower = event.summary.toLowerCase();
    const hasKeyword = rule.keywords.some((kw) => summaryLower.includes(kw.toLowerCase()));
    if (!hasKeyword) return false;
  }

  return true;
}

function buildRefinementSuggestion(rule: ParsedRule, dailyRate: number): string | undefined {
  if (dailyRate < NOISY_THRESHOLD_DAILY) return undefined;

  const suggestions: string[] = [];
  if (!rule.minSeverity || rule.minSeverity < 3) {
    suggestions.push("add `severity >= 3`");
  }
  if (!rule.minConfidence || rule.minConfidence < 0.7) {
    suggestions.push("add `confidence >= 0.7`");
  }
  if (!rule.geo) {
    suggestions.push("narrow to a specific region or AOI");
  }
  if (!rule.eventClasses || rule.eventClasses.length === 0) {
    suggestions.push("filter by a specific event class");
  }

  if (suggestions.length === 0) return "Rule matches many events — consider more specific keywords.";
  return `Rule is too broad. Try: ${suggestions.join(", ")}.`;
}

export function dryRunRule(
  rule: ParsedRule,
  events: RuleEvent[],
  periodDays = 30,
): DryRunResult {
  const cutoff = Date.now() - periodDays * 86400_000;
  const windowEvents = events.filter((e) => Date.parse(e.occurredAt) >= cutoff);

  const matches = windowEvents.filter((e) => matchesRule(e, rule));

  const estimatedDailyAlerts = matches.length / Math.max(1, periodDays);
  const isNoisy = estimatedDailyAlerts >= NOISY_THRESHOLD_DAILY;

  const sampleMatches = matches.slice(0, 5).map((e) => ({
    eventId: e.eventId,
    summary: e.summary.slice(0, 200),
    occurredAt: e.occurredAt,
    severity: e.severity,
  }));

  return {
    matchCount: matches.length,
    sampleMatches,
    periodDays,
    estimatedDailyAlerts: Math.round(estimatedDailyAlerts * 10) / 10,
    isNoisy,
    refinementSuggestion: buildRefinementSuggestion(rule, estimatedDailyAlerts),
  };
}
