import "server-only";

// ---------------------------------------------------------------------------
// Operational Alerting — PagerDuty Events v2 + Slack webhooks
// ---------------------------------------------------------------------------

export type AlertSeverity = "info" | "warning" | "error" | "critical";

export interface OpsAlert {
  title: string;
  description: string;
  severity: AlertSeverity;
  service: string;
  runbookUrl?: string;
  tags?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Emoji mapping for Slack formatting
// ---------------------------------------------------------------------------

export const SEVERITY_EMOJI: Record<AlertSeverity, string> = {
  info: "ℹ️",
  warning: "⚠️",
  error: "🔴",
  critical: "🚨",
};

// ---------------------------------------------------------------------------
// PagerDuty Events v2
// ---------------------------------------------------------------------------

/** Maps our severity to PD severity strings. */
function pdSeverity(s: AlertSeverity): "critical" | "error" | "warning" | "info" {
  if (s === "critical") return "critical";
  if (s === "error") return "error";
  if (s === "warning") return "warning";
  return "info";
}

export async function sendPagerDutyAlert(alert: OpsAlert): Promise<void> {
  const routingKey = process.env.PAGERDUTY_ROUTING_KEY;
  if (!routingKey) {
    console.warn("[alerting] PAGERDUTY_ROUTING_KEY not set — skipping PD alert");
    return;
  }

  const payload = {
    routing_key: routingKey,
    event_action: "trigger",
    dedup_key: `aegis-${alert.service}-${alert.title}`.replace(/\s+/g, "-").toLowerCase(),
    payload: {
      summary: alert.title,
      source: alert.service,
      severity: pdSeverity(alert.severity),
      custom_details: {
        description: alert.description,
        runbook_url: alert.runbookUrl,
        ...alert.tags,
      },
    },
    links: alert.runbookUrl
      ? [{ href: alert.runbookUrl, text: "Runbook" }]
      : undefined,
  };

  const res = await fetch("https://events.pagerduty.com/v2/enqueue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PagerDuty API error ${res.status}: ${text}`);
  }
}

// ---------------------------------------------------------------------------
// Slack Incoming Webhook
// ---------------------------------------------------------------------------

export async function sendSlackOpsAlert(alert: OpsAlert): Promise<void> {
  const webhookUrl = process.env.OPS_SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("[alerting] OPS_SLACK_WEBHOOK_URL not set — skipping Slack alert");
    return;
  }

  const emoji = SEVERITY_EMOJI[alert.severity];
  const color =
    alert.severity === "critical" ? "#FF0000"
    : alert.severity === "error" ? "#FF4500"
    : alert.severity === "warning" ? "#FFA500"
    : "#36A64F";

  const blocks: unknown[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `${emoji} [${alert.severity.toUpperCase()}] ${alert.title}`,
        emoji: true,
      },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Service:*\n${alert.service}` },
        { type: "mrkdwn", text: `*Severity:*\n${alert.severity}` },
      ],
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: `*Description:*\n${alert.description}` },
    },
  ];

  if (alert.tags && Object.keys(alert.tags).length > 0) {
    const tagText = Object.entries(alert.tags)
      .map(([k, v]) => `\`${k}\`: ${v}`)
      .join("  |  ");
    blocks.push({ type: "section", text: { type: "mrkdwn", text: `*Tags:* ${tagText}` } });
  }

  if (alert.runbookUrl) {
    blocks.push({
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "Open Runbook", emoji: true },
          url: alert.runbookUrl,
          style: "primary",
        },
      ],
    });
  }

  const body = {
    attachments: [
      {
        color,
        blocks,
        fallback: `${emoji} [${alert.severity.toUpperCase()}] ${alert.service}: ${alert.title}`,
      },
    ],
  };

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Slack webhook error ${res.status}: ${text}`);
  }
}

// ---------------------------------------------------------------------------
// Fan-out dispatcher
// ---------------------------------------------------------------------------

/**
 * Route alert to appropriate channels based on severity.
 * - critical → PagerDuty + Slack
 * - error/warning/info → Slack only
 *
 * Errors from individual channels are caught and logged so one failure
 * doesn't prevent delivery to the other channel.
 */
export async function triggerAlert(alert: OpsAlert): Promise<void> {
  const timestamp = new Date().toISOString();
  console.log(
    JSON.stringify({
      event: "alert_triggered",
      severity: alert.severity,
      service: alert.service,
      title: alert.title,
      timestamp,
    }),
  );

  const tasks: Promise<void>[] = [];

  if (alert.severity === "critical") {
    tasks.push(
      sendPagerDutyAlert(alert).catch((err: unknown) =>
        console.error("[alerting] PagerDuty delivery failed", err),
      ),
    );
  }

  tasks.push(
    sendSlackOpsAlert(alert).catch((err: unknown) =>
      console.error("[alerting] Slack delivery failed", err),
    ),
  );

  await Promise.all(tasks);
}
