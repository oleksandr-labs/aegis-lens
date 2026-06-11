/**
 * Real-User Monitoring (RUM) collector model for Core Web Vitals.
 *
 * See TODO/seo/TODO_core_web_vitals.md ("CWV monitoring (CrUX + RUM)"). CrUX
 * gives field data with a ~28-day lag; this is the FIRST-PARTY RUM half: a
 * model for capturing LCP/INP/CLS/TTFB from the `web-vitals` library on public
 * pages and beaconing them to an ingest endpoint, so we can attribute
 * regressions to a release within hours.
 *
 * This module is the typed contract: the beacon payload shape, a normalizer
 * that turns a raw web-vitals `Metric` into a payload, a sampling decision, and
 * the surface/locale tagging. The actual `onLCP/onINP/onCLS/onTTFB` wiring and
 * the ingest route plug into these types. No DOM/network access here (testable).
 */

import type { CwvMetric, CwvSurface } from "./budgets";

/** web-vitals rates a metric good/needs-improvement/poor; mirror that. */
export type MetricRating = "good" | "needs-improvement" | "poor";

/** Minimal shape of a web-vitals `Metric` we consume (decoupled from the lib). */
export interface RawVitalsMetric {
  name: CwvMetric | (string & {});
  value: number;
  rating?: MetricRating;
  /** Stable id web-vitals assigns to dedupe deltas. */
  id: string;
  /** navigation type, if provided. */
  navigationType?: string;
}

/** The beacon payload sent to the RUM ingest endpoint. */
export interface RumBeacon {
  metric: CwvMetric;
  value: number;
  rating: MetricRating;
  /** web-vitals metric id (dedupe). */
  id: string;
  /** Locale-stripped route template, e.g. "/regions/[slug]". */
  route: string;
  /** Which public surface. */
  surface: CwvSurface;
  /** Active locale. */
  locale: string;
  /** Coarse device class for segmentation. */
  device: "mobile" | "desktop";
  /** Release/build id, to attribute regressions. */
  build: string;
  /** Epoch ms when captured. */
  ts: number;
}

const TRACKED: ReadonlySet<string> = new Set<CwvMetric>(["LCP", "INP", "CLS", "TTFB"]);

/** Is this a metric we beacon? */
export function isTrackedMetric(name: string): name is CwvMetric {
  return TRACKED.has(name);
}

export interface RumContext {
  route: string;
  surface: CwvSurface;
  locale: string;
  device: "mobile" | "desktop";
  build: string;
  /** Sampling rate in [0,1]. Workspace surface should be 0 (exempt). */
  sampleRate: number;
  /** Injectable RNG for tests; defaults to Math.random. */
  rng?: () => number;
  /** Injectable clock for tests; defaults to Date.now. */
  now?: () => number;
}

/**
 * Decide whether to send this metric, given context. Returns the beacon to
 * send, or null when filtered out (untracked metric, sampled out, or the
 * exempt workspace surface).
 */
export function buildBeacon(metric: RawVitalsMetric, ctx: RumContext): RumBeacon | null {
  if (!isTrackedMetric(metric.name)) return null;
  if (ctx.surface === "workspace") return null; // exempt from public CWV scoring
  const rng = ctx.rng ?? Math.random;
  if (rng() >= ctx.sampleRate) return null;

  return {
    metric: metric.name,
    value: round(metric.value, metric.name),
    rating: metric.rating ?? "needs-improvement",
    id: metric.id,
    route: ctx.route,
    surface: ctx.surface,
    locale: ctx.locale,
    device: ctx.device,
    build: ctx.build,
    ts: (ctx.now ?? Date.now)(),
  };
}

/** CLS is a unitless ratio (keep precision); the rest are ms (round to int). */
function round(value: number, metric: CwvMetric): number {
  return metric === "CLS" ? Math.round(value * 1000) / 1000 : Math.round(value);
}

/** Endpoint the beacon POSTs to (served by the RUM ingest API route). */
export const RUM_INGEST_PATH = "/api/rum/cwv";

/**
 * Serialize a beacon for `navigator.sendBeacon` (string body). Kept pure so
 * tests can assert the wire format without a browser.
 */
export function serializeBeacon(beacon: RumBeacon): string {
  return JSON.stringify(beacon);
}
