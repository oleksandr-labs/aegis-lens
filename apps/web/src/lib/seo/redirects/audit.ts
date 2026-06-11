/**
 * Quarterly redirect audit.
 *
 * Redirects accrete; stale ones should be reviewed and retired. This module
 * produces a typed audit report over the registry, flagging:
 *   - chains / cycles (delegated to chain-detector)
 *   - aged 302s that should probably be 301 or removed
 *   - redirects older than the review horizon (candidates for retirement once
 *     their `from` no longer receives traffic — wire a real metrics source at
 *     the noted seam)
 *   - 410s (informational: confirm they are still intentionally gone)
 *
 * See TODO/seo/TODO_redirects.md. Pure/deterministic given a `now` injection so
 * it is unit-testable and runnable in CI on a schedule.
 */

import type { RedirectRegistry, RedirectRule } from "./registry";
import { detectChains, type ChainIssue } from "./chain-detector";

/** How old (days) before a redirect is flagged for review. */
export const REVIEW_HORIZON_DAYS = 365;
/** How old (days) before a 302 is flagged as suspiciously long-lived. */
export const TEMP_REDIRECT_MAX_DAYS = 90;

export interface AuditFinding {
  rule: RedirectRule;
  /** Why it was flagged. */
  flag: "aged-temporary" | "stale-review" | "gone";
  ageDays: number;
}

export interface AuditReport {
  generatedAt: string;
  totalRules: number;
  findings: AuditFinding[];
  chainIssues: ChainIssue[];
  /** Optional hook: where live traffic data would plug in (see runAudit docs). */
  trafficSource: string;
}

function ageInDays(createdAt: string, now: Date): number {
  const t = Date.parse(createdAt);
  if (Number.isNaN(t)) return 0;
  return Math.floor((now.getTime() - t) / 86_400_000);
}

/**
 * Run the audit.
 *
 * @param registry the loaded redirect registry
 * @param now reference time (inject for tests; defaults to current time)
 *
 * Metrics seam: to retire zero-traffic redirects automatically, fetch hit
 * counts per `rule.from` from the edge/access-log analytics store and drop or
 * down-rank findings whose `from` still receives meaningful traffic. The
 * `trafficSource` field documents that seam for the dashboard.
 */
export function runAudit(registry: RedirectRegistry, now: Date = new Date()): AuditReport {
  const findings: AuditFinding[] = [];

  for (const rule of registry.rules) {
    const ageDays = ageInDays(rule.createdAt, now);
    if (rule.status === 302 && ageDays > TEMP_REDIRECT_MAX_DAYS) {
      findings.push({ rule, flag: "aged-temporary", ageDays });
    } else if (rule.status === 410) {
      findings.push({ rule, flag: "gone", ageDays });
    } else if (ageDays > REVIEW_HORIZON_DAYS) {
      findings.push({ rule, flag: "stale-review", ageDays });
    }
  }

  const chain = detectChains(registry);

  return {
    generatedAt: now.toISOString(),
    totalRules: registry.rules.length,
    findings,
    chainIssues: chain.issues,
    trafficSource: "edge-access-logs (per-`from` hit counts) — not yet wired",
  };
}

/** Human-readable summary for a quarterly review doc / CI log. */
export function formatAuditReport(report: AuditReport): string {
  const lines = [
    `Redirect audit @ ${report.generatedAt}`,
    `  rules: ${report.totalRules}`,
    `  chain/cycle issues: ${report.chainIssues.length}`,
    `  findings: ${report.findings.length}`,
  ];
  for (const f of report.findings) {
    lines.push(`    [${f.flag}] ${f.rule.from} (age ${f.ageDays}d, ${f.rule.status})`);
  }
  return lines.join("\n");
}
