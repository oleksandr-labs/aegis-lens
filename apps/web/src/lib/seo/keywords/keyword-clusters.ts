/**
 * Master keyword list for Aegis Lens / Ukrainian MAP.
 *
 * Covers all primary clusters and long-tail variants in EN + UK locales.
 * Priority: 1 = primary target, 2 = secondary, 3 = supporting long-tail.
 *
 * Source: TODO/seo/TODO_keywords.md
 */

import type { KeywordEntry } from "./types";

export const KEYWORD_CLUSTERS: KeywordEntry[] = [
  // ─── OSINT Platform ─────────────────────────────────────────────────────────
  {
    keyword: "OSINT platform",
    locale: "en",
    cluster: "osint_platform",
    intent: "commercial",
    targetPagePath: "/",
    estimatedVolume: "high",
    priority: 1,
  },
  {
    keyword: "OSINT платформа",
    locale: "uk",
    cluster: "osint_platform",
    intent: "commercial",
    targetPagePath: "/",
    estimatedVolume: "medium",
    priority: 1,
  },
  {
    keyword: "OSINT tools",
    locale: "en",
    cluster: "osint_platform",
    intent: "commercial",
    targetPagePath: "/",
    estimatedVolume: "very_high",
    priority: 2,
  },
  {
    keyword: "інструменти OSINT",
    locale: "uk",
    cluster: "osint_platform",
    intent: "commercial",
    targetPagePath: "/",
    estimatedVolume: "medium",
    priority: 2,
  },
  {
    keyword: "open source intelligence software",
    locale: "en",
    cluster: "osint_platform",
    intent: "commercial",
    targetPagePath: "/",
    estimatedVolume: "medium",
    priority: 2,
  },

  // ─── Ukraine War Map ─────────────────────────────────────────────────────────
  {
    keyword: "Ukraine war map",
    locale: "en",
    cluster: "ukraine_war_map",
    intent: "informational",
    targetPagePath: "/",
    estimatedVolume: "very_high",
    priority: 1,
  },
  {
    keyword: "карта війни в Україні",
    locale: "uk",
    cluster: "ukraine_war_map",
    intent: "informational",
    targetPagePath: "/",
    estimatedVolume: "very_high",
    priority: 1,
  },
  {
    keyword: "live conflict map",
    locale: "en",
    cluster: "ukraine_war_map",
    intent: "informational",
    targetPagePath: "/",
    estimatedVolume: "high",
    priority: 2,
  },
  {
    keyword: "real-time war tracker",
    locale: "en",
    cluster: "ukraine_war_map",
    intent: "informational",
    targetPagePath: "/",
    estimatedVolume: "medium",
    priority: 2,
  },

  // ─── AI Intelligence ─────────────────────────────────────────────────────────
  {
    keyword: "AI intelligence platform",
    locale: "en",
    cluster: "ai_intelligence",
    intent: "commercial",
    targetPagePath: "/",
    estimatedVolume: "high",
    priority: 1,
  },
  {
    keyword: "платформа розвідки ШІ",
    locale: "uk",
    cluster: "ai_intelligence",
    intent: "commercial",
    targetPagePath: "/",
    estimatedVolume: "low",
    priority: 1,
  },
  {
    keyword: "AI OSINT",
    locale: "en",
    cluster: "ai_intelligence",
    intent: "commercial",
    targetPagePath: "/",
    estimatedVolume: "medium",
    priority: 2,
  },
  {
    keyword: "AI analyst",
    locale: "en",
    cluster: "ai_intelligence",
    intent: "informational",
    targetPagePath: "/",
    estimatedVolume: "medium",
    priority: 2,
  },

  // ─── Satellite Monitoring ────────────────────────────────────────────────────
  {
    keyword: "satellite imagery monitoring",
    locale: "en",
    cluster: "satellite_monitoring",
    intent: "commercial",
    targetPagePath: "/",
    estimatedVolume: "medium",
    priority: 2,
  },
  {
    keyword: "drone tracking",
    locale: "en",
    cluster: "satellite_monitoring",
    intent: "informational",
    targetPagePath: "/",
    estimatedVolume: "high",
    priority: 2,
  },
  {
    keyword: "missile tracking",
    locale: "en",
    cluster: "satellite_monitoring",
    intent: "informational",
    targetPagePath: "/",
    estimatedVolume: "high",
    priority: 2,
  },

  // ─── Geopolitical Analytics ──────────────────────────────────────────────────
  {
    keyword: "geopolitical analytics",
    locale: "en",
    cluster: "geopolitical_analytics",
    intent: "commercial",
    targetPagePath: "/",
    estimatedVolume: "medium",
    priority: 2,
  },
  {
    keyword: "геополітична аналітика",
    locale: "uk",
    cluster: "geopolitical_analytics",
    intent: "commercial",
    targetPagePath: "/",
    estimatedVolume: "medium",
    priority: 2,
  },
  {
    keyword: "crisis monitoring platform",
    locale: "en",
    cluster: "geopolitical_analytics",
    intent: "commercial",
    targetPagePath: "/",
    estimatedVolume: "low",
    priority: 2,
  },

  // ─── Verification ────────────────────────────────────────────────────────────
  {
    keyword: "how to verify OSINT",
    locale: "en",
    cluster: "verification",
    intent: "informational",
    targetPagePath: "/blog/how-to-verify-osint",
    estimatedVolume: "medium",
    priority: 3,
  },
  {
    keyword: "geolocation OSINT",
    locale: "en",
    cluster: "geolocation_longtail",
    intent: "informational",
    targetPagePath: "/blog/geolocation-osint",
    estimatedVolume: "medium",
    priority: 3,
  },
  {
    keyword: "image verification",
    locale: "en",
    cluster: "verification",
    intent: "informational",
    targetPagePath: "/blog/image-verification",
    estimatedVolume: "medium",
    priority: 3,
  },

  // ─── Region Long-tail ────────────────────────────────────────────────────────
  {
    keyword: "Donetsk live map",
    locale: "en",
    cluster: "region_longtail",
    intent: "informational",
    targetPagePath: "/regions/donetsk",
    estimatedVolume: "medium",
    priority: 3,
  },
  {
    keyword: "Black Sea maritime monitoring",
    locale: "en",
    cluster: "region_longtail",
    intent: "informational",
    targetPagePath: "/regions/black-sea",
    estimatedVolume: "low",
    priority: 3,
  },

  // ─── Comparison Queries ──────────────────────────────────────────────────────
  {
    keyword: "Palantir alternative",
    locale: "en",
    cluster: "comparison_queries",
    intent: "commercial",
    targetPagePath: "/compare/palantir-alternative",
    estimatedVolume: "medium",
    priority: 3,
  },
  {
    keyword: "LiveUAmap alternative",
    locale: "en",
    cluster: "comparison_queries",
    intent: "commercial",
    targetPagePath: "/compare/liveuamap-alternative",
    estimatedVolume: "low",
    priority: 3,
  },
];
