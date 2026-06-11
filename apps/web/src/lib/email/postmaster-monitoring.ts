/**
 * Google Postmaster Tools + Microsoft SNDS monitoring configuration.
 *
 * Postmaster Tools gives per-domain and per-IP reputation signals directly
 * from Gmail. Monitor daily; alert on any degradation.
 *
 * Key metrics to watch:
 *   - Spam rate:       < 0.10% warning | < 0.08% target | 0%+ immediate action
 *   - IP reputation:   high > medium (alert) > low (pause sending) > bad (stop)
 *   - Domain reputation: same scale
 *   - Authentication: DKIM / SPF / DMARC pass rate should be 100%
 *
 * Моніторинг репутації через Google Postmaster Tools і Microsoft SNDS.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type ReputationLevel = "high" | "medium" | "low" | "bad";

export interface PostmasterMetric {
  /** Date of the metric snapshot (YYYY-MM-DD). */
  date: string;
  /** Domain (e.g. "aegislens.com" or "mail.aegislens.com"). */
  domain: string;
  /**
   * Fraction of user-seen messages flagged as spam by Gmail.
   * Target: < 0.001 (0.1%). Google starts throttling at 0.01 (1%).
   */
  spamRate: number;
  /**
   * User-reported spam count (absolute, not rate).
   * Use spamRate for policy decisions; this is for trend analysis.
   */
  userReportedSpam: number;
  /** Gmail's assessment of the sending IP's reputation. */
  ipReputation: ReputationLevel;
  /** Gmail's assessment of the sending domain's reputation. */
  domainReputation: ReputationLevel;
}

// ── Thresholds ────────────────────────────────────────────────────────────────

export const POSTMASTER_ALERT_THRESHOLDS = {
  /**
   * Warning threshold for spam rate.
   * Gmail SLO for bulk senders: < 0.3% to avoid throttling.
   * Our target: < 0.1% to maintain "high" domain reputation.
   */
  spamRateWarning: 0.001 as const,

  /**
   * Critical threshold for spam rate.
   * At 1%, Gmail begins active throttling and may suspend delivery.
   */
  spamRateCritical: 0.01 as const,

  /**
   * Any reputation level at or below this value triggers an alert.
   * "medium" means you are one bad campaign away from "low".
   */
  reputationWarning: "medium" as const,
} as const;

// ── Metric evaluator ──────────────────────────────────────────────────────────

export interface PostmasterEvaluation {
  alerts: string[];
  recommendations: string[];
}

/**
 * Evaluates a PostmasterMetric snapshot and returns actionable alerts and
 * recommendations.
 *
 * Wire this up in a daily cron job:
 *   1. Fetch metrics from Google Postmaster Tools API (OAuth required).
 *   2. Call evaluatePostmasterMetrics(metric).
 *   3. If alerts.length > 0, notify via Slack / PagerDuty.
 *
 * Оцінює метрики Postmaster і повертає попередження та рекомендації.
 */
export function evaluatePostmasterMetrics(
  metric: PostmasterMetric,
): PostmasterEvaluation {
  const alerts: string[] = [];
  const recommendations: string[] = [];

  const { spamRateWarning, spamRateCritical, reputationWarning } =
    POSTMASTER_ALERT_THRESHOLDS;

  // Spam rate checks
  if (metric.spamRate >= spamRateCritical) {
    alerts.push(
      `CRITICAL: Spam rate ${(metric.spamRate * 100).toFixed(2)}% on ${metric.domain} ` +
        `exceeds ${(spamRateCritical * 100).toFixed(1)}% — Gmail may suspend delivery.`,
    );
    recommendations.push(
      "Immediately pause all marketing sends.",
      "Review recent campaigns for engagement quality.",
      "Check suppression list for missed complaint entries.",
      "Contact Resend/Postmark support for IP investigation.",
    );
  } else if (metric.spamRate >= spamRateWarning) {
    alerts.push(
      `WARNING: Spam rate ${(metric.spamRate * 100).toFixed(3)}% on ${metric.domain} ` +
        `exceeds ${(spamRateWarning * 100).toFixed(1)}% threshold.`,
    );
    recommendations.push(
      "Review last 7 days of campaigns for unengaged recipients.",
      "Increase unsubscribe prominence in marketing templates.",
      "Run list cleaning: remove > 90d inactive subscribers.",
    );
  }

  // Reputation level checks
  const reputationOrder: ReputationLevel[] = ["high", "medium", "low", "bad"];
  const warningIdx = reputationOrder.indexOf(reputationWarning);

  const ipIdx = reputationOrder.indexOf(metric.ipReputation);
  if (ipIdx >= warningIdx) {
    alerts.push(
      `IP reputation is "${metric.ipReputation}" on ${metric.date} for ${metric.domain}.`,
    );
    recommendations.push(
      `Reduce send volume by 50% for pool serving ${metric.domain}.`,
      "Warm up with highest-engagement segment only.",
    );
  }

  const domainIdx = reputationOrder.indexOf(metric.domainReputation);
  if (domainIdx >= warningIdx) {
    alerts.push(
      `Domain reputation is "${metric.domainReputation}" on ${metric.date} for ${metric.domain}.`,
    );
    recommendations.push(
      "Audit all sending streams — domain reputation affects all subdomains.",
      "File a deliverability review with Google (Postmaster Tools feedback form).",
    );
  }

  return { alerts, recommendations };
}

// ── Tool URLs ─────────────────────────────────────────────────────────────────

/**
 * Reference URLs for postmaster monitoring setup.
 *
 * OAuth scopes for Google Postmaster Tools API:
 *   https://www.googleapis.com/auth/postmaster.readonly
 *
 * Microsoft SNDS (Smart Network Data Services) requires domain ownership
 * verification via a TXT record.
 */
export const POSTMASTER_TOOLS_URLS = {
  google: "https://postmaster.google.com",
  googleApi: "https://gmailpostmastertools.googleapis.com/v1/domains",
  googleApiDocs:
    "https://developers.google.com/gmail/postmaster/reference/rest",
  microsoft: "https://postmaster.live.com",
  microsoftSnds: "https://sendersupport.olc.protection.outlook.com/snds/",
  microsoftJmapDocs:
    "https://learn.microsoft.com/en-us/exchange/mail-flow-best-practices/use-connectors-to-configure-mail-flow",
};
