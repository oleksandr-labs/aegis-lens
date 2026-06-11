/**
 * Per-persona starter rule templates shown on first run.
 */

import type { PersoanaRuleTemplate } from "./types";

export const PERSONA_TEMPLATES: PersoanaRuleTemplate[] = [
  // ── Journalist ────────────────────────────────────────────────────────────
  {
    persona: "journalist",
    title: "Breaking: Missile strikes anywhere in Ukraine",
    description: "High-severity military events for breaking news coverage",
    nlText: "alert me when there's a missile strike anywhere in Ukraine with severity ≥ 2",
    rule: {
      eventClasses: ["military_action"],
      subclasses: ["missile_strike"],
      minSeverity: 2,
      channels: ["push", "email"],
    },
  },
  {
    persona: "journalist",
    title: "Frontline changes",
    description: "Significant battlefield developments",
    nlText: "notify me on major military actions with high engagement near the front line",
    rule: {
      eventClasses: ["military_action"],
      minSeverity: 3,
      channels: ["push"],
    },
  },
  // ── Analyst ──────────────────────────────────────────────────────────────
  {
    persona: "analyst",
    title: "Zaporizhzhia NPP — any incident",
    description: "All events within 30km of the nuclear plant",
    nlText: "alert me on any event within 30km of Zaporizhzhia nuclear power plant",
    rule: {
      geo: { placeName: "zaporizhzhia", lat: 47.84, lon: 35.14, radiusKm: 30 },
      channels: ["push", "email", "telegram"],
    },
  },
  {
    persona: "analyst",
    title: "Infrastructure strikes — critical",
    description: "Power grid and critical infrastructure attacks",
    nlText: "notify me when there are infrastructure damage events with severity ≥ 2",
    rule: {
      eventClasses: ["infrastructure_damage"],
      minSeverity: 2,
      channels: ["push", "email"],
    },
  },
  // ── NGO humanitarian ─────────────────────────────────────────────────────
  {
    persona: "ngo",
    title: "Civilian alerts — Kherson region",
    description: "Civilian safety events in Kherson area",
    nlText: "alert me on civilian alerts and shelling within 50km of Kherson",
    rule: {
      eventClasses: ["civilian_alert", "military_action"],
      geo: { placeName: "kherson", lat: 46.64, lon: 32.62, radiusKm: 50 },
      channels: ["push", "email"],
    },
  },
  // ── Trader / finance ─────────────────────────────────────────────────────
  {
    persona: "trader",
    title: "Odesa port disruptions",
    description: "Events that may affect Black Sea shipping",
    nlText: "notify me on any military or infrastructure events within 30km of Odesa port",
    rule: {
      eventClasses: ["military_action", "infrastructure_damage"],
      geo: { placeName: "odesa", lat: 46.48, lon: 30.74, radiusKm: 30 },
      channels: ["push"],
    },
  },
];
