/**
 * Report delivery module.
 *
 * Dispatches a generated report to one or more channels:
 *   web | email | slack | telegram | api
 *
 * All third-party calls use environment variables for credentials.
 * Fail-soft: a failed channel returns DeliveryResult with success=false
 * rather than throwing, so remaining channels proceed.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type DeliveryChannel = "web" | "email" | "slack" | "telegram" | "api";

export interface DeliveryTarget {
  channel: DeliveryChannel;
  /** Email address, Slack webhook URL, Telegram chat ID, or API callback URL */
  recipient: string;
  locale: string;
}

export interface DeliveryResult {
  channel: DeliveryChannel;
  success: boolean;
  deliveredAt?: string;
  error?: string;
}

// ── In-memory web availability store ─────────────────────────────────────────

/** Tracks report IDs that have been made available via the web channel */
const webAvailableReports = new Set<string>();

export function isWebAvailable(reportId: string): boolean {
  return webAvailableReports.has(reportId);
}

// ── Per-channel handlers ──────────────────────────────────────────────────────

async function handleWeb(reportId: string, _target: DeliveryTarget): Promise<DeliveryResult> {
  webAvailableReports.add(reportId);
  return {
    channel: "web",
    success: true,
    deliveredAt: new Date().toISOString(),
  };
}

async function handleEmail(reportId: string, target: DeliveryTarget): Promise<DeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { channel: "email", success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.REPORT_EMAIL_FROM ?? "reports@aegislens.com",
        to: [target.recipient],
        subject: `Aegis Lens Intelligence Report — ${reportId}`,
        html: `<p>Your report <strong>${reportId}</strong> is ready. <a href="${process.env.APP_URL ?? "https://aegislens.com"}/reports/${reportId}">View report</a></p>`,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { channel: "email", success: false, error: `Resend ${res.status}: ${body}` };
    }

    return { channel: "email", success: true, deliveredAt: new Date().toISOString() };
  } catch (err) {
    return { channel: "email", success: false, error: String(err) };
  }
}

async function handleSlack(reportId: string, target: DeliveryTarget): Promise<DeliveryResult> {
  const webhookUrl = target.recipient || process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    return { channel: "slack", success: false, error: "Slack webhook URL not configured" };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `*Aegis Lens Report Ready*`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Intelligence Report* \`${reportId}\` is ready for review.\n<${process.env.APP_URL ?? "https://aegislens.com"}/reports/${reportId}|View report>`,
            },
          },
        ],
      }),
    });

    if (!res.ok) {
      return { channel: "slack", success: false, error: `Slack webhook ${res.status}` };
    }

    return { channel: "slack", success: true, deliveredAt: new Date().toISOString() };
  } catch (err) {
    return { channel: "slack", success: false, error: String(err) };
  }
}

async function handleTelegram(reportId: string, target: DeliveryTarget): Promise<DeliveryResult> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return { channel: "telegram", success: false, error: "TELEGRAM_BOT_TOKEN not configured" };
  }
  if (!target.recipient) {
    return { channel: "telegram", success: false, error: "Telegram chat ID (recipient) required" };
  }

  try {
    const reportUrl = `${process.env.APP_URL ?? "https://aegislens.com"}/reports/${reportId}`;
    const text = `*Aegis Lens Intelligence Report*\n\nReport \`${reportId}\` is ready.\n[View report](${reportUrl})`;

    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: target.recipient,
          text,
          parse_mode: "Markdown",
          disable_web_page_preview: false,
        }),
      },
    );

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { channel: "telegram", success: false, error: `Telegram API ${res.status}: ${body}` };
    }

    return { channel: "telegram", success: true, deliveredAt: new Date().toISOString() };
  } catch (err) {
    return { channel: "telegram", success: false, error: String(err) };
  }
}

async function handleApi(_reportId: string, _target: DeliveryTarget): Promise<DeliveryResult> {
  // API channel: the report is already available via GET /api/reports/:id
  // No push action required — clients poll or subscribe via webhooks separately.
  return {
    channel: "api",
    success: true,
    deliveredAt: new Date().toISOString(),
  };
}

// ── ReportDeliveryService ─────────────────────────────────────────────────────

export class ReportDeliveryService {
  /**
   * Deliver a report to a single target channel.
   * Never throws — returns DeliveryResult with success=false on error.
   */
  async deliver(reportId: string, target: DeliveryTarget): Promise<DeliveryResult> {
    try {
      switch (target.channel) {
        case "web":      return await handleWeb(reportId, target);
        case "email":    return await handleEmail(reportId, target);
        case "slack":    return await handleSlack(reportId, target);
        case "telegram": return await handleTelegram(reportId, target);
        case "api":      return await handleApi(reportId, target);
        default: {
          const exhaustive: never = target.channel;
          return { channel: exhaustive, success: false, error: `Unknown channel: ${String(exhaustive)}` };
        }
      }
    } catch (err) {
      return { channel: target.channel, success: false, error: String(err) };
    }
  }

  /**
   * Deliver a report to all targets in parallel.
   * Returns one DeliveryResult per target; failures do not block others.
   */
  async deliverToAll(
    reportId: string,
    targets: DeliveryTarget[],
  ): Promise<DeliveryResult[]> {
    return Promise.all(targets.map((target) => this.deliver(reportId, target)));
  }
}
