/**
 * Search Console + Bing Webmaster monitoring — typed client contract + alerts.
 *
 * TODO/seo/TODO_crawl_indexing.md:
 *  - Search Console + Bing Webmaster monitoring
 *  - Per-locale Search Console properties
 *
 * This is the *codeable contract*: typed request/response models for the Google
 * Search Console (Search Analytics + URL Inspection / Index Coverage) and Bing
 * Webmaster APIs, the per-locale property registry, and a pure alert engine over
 * the normalised metrics. No network — a real implementation injects an
 * authenticated `fetch`/SDK and maps responses into these types.
 *
 * Where real data plugs in: a server job authenticates (GSC OAuth service
 * account; Bing API key from env) → fetches per-property metrics → maps to
 * `SearchPerfRow[]` / `IndexCoverage` → feeds `evaluateAlerts`.
 */

import { ACTIVE_LOCALES, type Locale } from "@aegis/i18n-config";

// ---------- Per-locale property registry (task 11) ----------

export type WebmasterEngine = "google" | "bing";

export type SearchProperty = {
  engine: WebmasterEngine;
  locale: Locale;
  /**
   * Property identifier as registered with the engine. For a single-domain,
   * path-prefix locale strategy this is a URL-prefix property; for a subdomain
   * strategy it would be the sc-domain/host.
   */
  property: string;
  /** Path prefix this property covers ("" for en at root). */
  pathPrefix: string;
};

/**
 * Per-locale Search Console + Bing Webmaster properties. We run path-prefix
 * properties per locale so each locale's coverage/perf can be monitored
 * independently. `siteUrl` is the bare origin.
 */
export function buildPropertyRegistry(siteUrl: string): SearchProperty[] {
  const base = siteUrl.replace(/\/$/, "");
  const props: SearchProperty[] = [];
  for (const engine of ["google", "bing"] as const) {
    for (const locale of ACTIVE_LOCALES) {
      const pathPrefix = locale === "en" ? "" : `/${locale}`;
      props.push({
        engine,
        locale,
        property: `${base}${pathPrefix}/`,
        pathPrefix,
      });
    }
  }
  return props;
}

// ---------- Search Analytics models ----------

export type SearchPerfRow = {
  /** Date (ISO) the row aggregates. */
  date: string;
  /** Page URL or query, depending on dimension. */
  key: string;
  clicks: number;
  impressions: number;
  /** Click-through rate 0..1. */
  ctr: number;
  /** Average position (1 = top). */
  position: number;
};

export type SearchPerfRequest = {
  property: string;
  startDate: string;
  endDate: string;
  dimensions: ("date" | "page" | "query" | "country" | "device")[];
  rowLimit?: number;
};

/** A webmaster API client contract — implemented later with a real auth layer. */
export interface WebmasterClient {
  engine: WebmasterEngine;
  searchPerformance(req: SearchPerfRequest): Promise<SearchPerfRow[]>;
  indexCoverage(property: string): Promise<IndexCoverage>;
}

// ---------- Index coverage models ----------

export type CoverageState = "indexed" | "excluded" | "error" | "crawled_not_indexed" | "discovered_not_indexed";

export type IndexCoverage = {
  property: string;
  fetchedAt: string;
  counts: Record<CoverageState, number>;
  /** Total URLs known to the engine for this property. */
  total: number;
};

// ---------- Alert engine (feeds crawl-stat regression dashboard) ----------

export type SearchAlert = {
  severity: "info" | "warning" | "critical";
  property: string;
  code:
    | "clicks_drop"
    | "impressions_drop"
    | "position_worsened"
    | "coverage_errors"
    | "indexation_drop";
  message: string;
  /** Fractional change vs baseline where applicable. */
  delta?: number;
};

export type PropertySnapshot = {
  property: string;
  clicks: number;
  impressions: number;
  avgPosition: number;
  coverage: IndexCoverage;
};

export type AlertThresholds = {
  clicksDropWarn: number;
  clicksDropCrit: number;
  impressionsDropWarn: number;
  positionWorsenWarn: number; // absolute position points
  coverageErrorWarn: number; // share 0..1 of error+excluded
};

export const DEFAULT_THRESHOLDS: AlertThresholds = {
  clicksDropWarn: 0.2,
  clicksDropCrit: 0.5,
  impressionsDropWarn: 0.2,
  positionWorsenWarn: 3,
  coverageErrorWarn: 0.1,
};

/** Evaluate a current property snapshot against a baseline → alerts. */
export function evaluateAlerts(
  current: PropertySnapshot,
  baseline: PropertySnapshot,
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS,
): SearchAlert[] {
  const out: SearchAlert[] = [];
  const property = current.property;

  const clicksDelta = pctChange(current.clicks, baseline.clicks);
  if (clicksDelta <= -thresholds.clicksDropCrit) {
    out.push({ severity: "critical", property, code: "clicks_drop", delta: r3(clicksDelta), message: `Clicks fell ${pct(clicksDelta)} vs baseline` });
  } else if (clicksDelta <= -thresholds.clicksDropWarn) {
    out.push({ severity: "warning", property, code: "clicks_drop", delta: r3(clicksDelta), message: `Clicks fell ${pct(clicksDelta)} vs baseline` });
  }

  const imprDelta = pctChange(current.impressions, baseline.impressions);
  if (imprDelta <= -thresholds.impressionsDropWarn) {
    out.push({ severity: "warning", property, code: "impressions_drop", delta: r3(imprDelta), message: `Impressions fell ${pct(imprDelta)} vs baseline` });
  }

  const posWorsen = current.avgPosition - baseline.avgPosition;
  if (posWorsen >= thresholds.positionWorsenWarn) {
    out.push({ severity: "warning", property, code: "position_worsened", delta: r3(posWorsen), message: `Avg position worsened by ${posWorsen.toFixed(1)} points` });
  }

  const cov = current.coverage;
  const bad = (cov.counts.error ?? 0) + (cov.counts.excluded ?? 0);
  const errShare = cov.total ? bad / cov.total : 0;
  if (errShare >= thresholds.coverageErrorWarn) {
    out.push({ severity: "warning", property, code: "coverage_errors", delta: r3(errShare), message: `${pct(errShare)} of URLs excluded/errored in index coverage` });
  }

  const idxDelta = pctChange(current.coverage.counts.indexed ?? 0, baseline.coverage.counts.indexed ?? 0);
  if (idxDelta <= -thresholds.clicksDropWarn) {
    out.push({ severity: idxDelta <= -thresholds.clicksDropCrit ? "critical" : "warning", property, code: "indexation_drop", delta: r3(idxDelta), message: `Indexed URL count fell ${pct(idxDelta)} vs baseline` });
  }

  return out;
}

function pctChange(cur: number, base: number): number {
  if (base === 0) return cur === 0 ? 0 : 1;
  return (cur - base) / base;
}
function pct(frac: number): string {
  return `${(frac * 100).toFixed(1)}%`;
}
function r3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
