/**
 * Per-surface evaluation metric configuration.
 *
 * Different surfaces have different success metrics:
 *   - home_feed: CTR (first engagement signal)
 *   - event_inspector: downstream_engagement (did they explore further?)
 *   - dashboard: dwell_time_s (did they linger on the recommendation?)
 *   - sidebar: ctr (quick glance, click = success)
 *   - email: conversion (opens + click-throughs that lead to sign-in / action)
 *
 * Primary metric drives A/B test evaluation; secondary metrics are tracked
 * for canary analysis and guardrail monitoring.
 */

import type { RecommendationContext } from "./types";

// ── Types ─────────────────────────────────────────────────────────────────────

export type SurfaceMetric =
  | "ctr"
  | "downstream_engagement"
  | "dwell_time_s"
  | "conversion";

export interface SurfaceEvalConfig {
  surface: RecommendationContext;
  primaryMetric: SurfaceMetric;
  secondaryMetrics: SurfaceMetric[];
}

// ── Configuration ─────────────────────────────────────────────────────────────

export const SURFACE_EVAL_CONFIGS: SurfaceEvalConfig[] = [
  {
    surface: "home_feed",
    primaryMetric: "ctr",
    secondaryMetrics: ["downstream_engagement", "dwell_time_s"],
  },
  {
    surface: "event_inspector",
    primaryMetric: "downstream_engagement",
    secondaryMetrics: ["ctr", "dwell_time_s"],
  },
  {
    surface: "dashboard",
    primaryMetric: "dwell_time_s",
    secondaryMetrics: ["ctr", "downstream_engagement"],
  },
  {
    surface: "sidebar",
    primaryMetric: "ctr",
    secondaryMetrics: ["downstream_engagement", "conversion"],
  },
  {
    surface: "email",
    primaryMetric: "conversion",
    secondaryMetrics: ["ctr", "downstream_engagement"],
  },
];
