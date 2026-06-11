import "server-only";

import { type SyntheticCheckResult, SYNTHETIC_CHECKS } from "./synthetic-checks";

// ---------------------------------------------------------------------------
// Source-Health Dashboard Data Layer
// Drives the public /status page "Monitored Sources" section.
// ---------------------------------------------------------------------------

export interface SourceHealthEntry {
  sourceId: string;
  displayName: string;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  /** 0.0 – 1.0 */
  successRate24h: number;
  avgLatencyMs: number;
  isPubliclyVisible: boolean;
  /** EN status text */
  statusText: string;
  /** UK status text */
  statusTextUk: string;
}

// Sources we surface on the public status page.
// Internal / proprietary sources are excluded from this list.
export const PUBLIC_SOURCES: string[] = [
  "isw",
  "oryx",
  "deepstatemap",
  "alerts-in-ua",
  "ukrenergo",
  "acled",
  "cert-ua",
  "dsns",
  "un-ocha",
  "liveuamap",
  "militarnyi",
  "ukrinform",
  "minusrus",
  "ukraine-world",
];

// ---------------------------------------------------------------------------
// Status text helpers
// ---------------------------------------------------------------------------

function statusTextEn(ok: boolean, latencyMs: number): string {
  if (!ok) return "Unavailable";
  if (latencyMs < 500) return "Operational";
  if (latencyMs < 2000) return "Degraded performance";
  return "Slow";
}

function statusTextUk(ok: boolean, latencyMs: number): string {
  if (!ok) return "Недоступне";
  if (latencyMs < 500) return "Працює";
  if (latencyMs < 2000) return "Сповільнена робота";
  return "Повільне";
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

/**
 * Build the full source health report from a batch of check results.
 * One entry per known source (uses SYNTHETIC_CHECKS for display names).
 * Assumes results come from a single round of `runAllChecks()`.
 */
export function buildSourceHealthReport(
  checks: SyntheticCheckResult[],
): SourceHealthEntry[] {
  const resultsBySource = new Map<string, SyntheticCheckResult[]>();
  for (const c of checks) {
    const arr = resultsBySource.get(c.sourceId) ?? [];
    arr.push(c);
    resultsBySource.set(c.sourceId, arr);
  }

  const displayNames = new Map(
    SYNTHETIC_CHECKS.map((c) => [c.sourceId, c.name]),
  );

  const allSourceIds = new Set([
    ...SYNTHETIC_CHECKS.map((c) => c.sourceId),
    ...resultsBySource.keys(),
  ]);

  const entries: SourceHealthEntry[] = [];

  for (const sourceId of allSourceIds) {
    const results = resultsBySource.get(sourceId) ?? [];
    const successes = results.filter((r) => r.ok);
    const failures = results.filter((r) => !r.ok);

    const successRate24h =
      results.length === 0 ? 0 : successes.length / results.length;

    const avgLatencyMs =
      results.length === 0
        ? 0
        : Math.round(
            results.reduce((a, r) => a + r.latencyMs, 0) / results.length,
          );

    const lastSuccess = successes
      .map((r) => r.checkedAt)
      .sort()
      .at(-1);

    const lastFailure = failures
      .map((r) => r.checkedAt)
      .sort()
      .at(-1);

    const latestOk = results.at(-1)?.ok ?? false;

    entries.push({
      sourceId,
      displayName: displayNames.get(sourceId) ?? sourceId,
      lastSuccessAt: lastSuccess,
      lastFailureAt: lastFailure,
      successRate24h: Math.round(successRate24h * 1000) / 1000,
      avgLatencyMs,
      isPubliclyVisible: PUBLIC_SOURCES.includes(sourceId),
      statusText: statusTextEn(latestOk, avgLatencyMs),
      statusTextUk: statusTextUk(latestOk, avgLatencyMs),
    });
  }

  return entries.sort((a, b) => a.sourceId.localeCompare(b.sourceId));
}

/**
 * Filter the full report to only publicly visible sources.
 * Used by GET /api/health/sources.
 */
export function getPublicSourceHealth(
  checks: SyntheticCheckResult[],
): SourceHealthEntry[] {
  return buildSourceHealthReport(checks).filter((e) => e.isPubliclyVisible);
}
