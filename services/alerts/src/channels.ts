import type { AlertNotification, AlertChannel } from "./types";

/**
 * Channel delivery interface.
 * Each channel implementation sends one notification.
 */
export interface ChannelDelivery {
  channel: AlertChannel;
  send(notification: AlertNotification, destination: string): Promise<void>;
}

// ── Email ─────────────────────────────────────────────────────────────────────
export class EmailChannel implements ChannelDelivery {
  channel: AlertChannel = "email";

  constructor(
    private readonly send_fn: (to: string, subject: string, html: string) => Promise<void>,
  ) {}

  async send(n: AlertNotification, to: string): Promise<void> {
    const subject = `[${n.priority.toUpperCase()}] ${n.title}`;
    const html = `
      <h2>${n.title}</h2>
      <p>${n.body}</p>
      <p><strong>Danger score:</strong> ${n.danger_score}/100 &nbsp; <strong>Confidence:</strong> ${Math.round(n.confidence * 100)}%</p>
      <p><a href="${n.url}">View event →</a></p>
      <hr><small>Aegis Lens alert · ${n.event_time}</small>
    `.trim();
    await this.send_fn(to, subject, html);
  }
}

// ── Telegram ──────────────────────────────────────────────────────────────────
export class TelegramBotChannel implements ChannelDelivery {
  channel: AlertChannel = "telegram";

  constructor(private readonly botToken: string) {}

  async send(n: AlertNotification, chatId: string): Promise<void> {
    const icon = n.priority === "critical" ? "🚨" : n.priority === "high" ? "⚠️" : "ℹ️";
    const text = [
      `${icon} *${escapeMarkdown(n.title)}*`,
      escapeMarkdown(n.body),
      `Небезпека: ${n.danger_score}/100  Впевненість: ${Math.round(n.confidence * 100)}%`,
      `[Переглянути подію](${n.url})`,
    ].join("\n\n");

    const res = await fetch(
      `https://api.telegram.org/bot${this.botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "MarkdownV2",
          disable_web_page_preview: false,
        }),
      },
    );

    if (!res.ok) throw new Error(`Telegram send failed: ${res.status}`);
  }
}

// ── Webhook ───────────────────────────────────────────────────────────────────
export class WebhookChannel implements ChannelDelivery {
  channel: AlertChannel = "webhook";

  constructor(private readonly signingSecret: string) {}

  async send(n: AlertNotification, url: string): Promise<void> {
    const body = JSON.stringify(n);
    const sig = await hmacSha256(this.signingSecret, body);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Aegis-Signature": `sha256=${sig}`,
        "X-Aegis-Timestamp": String(Date.now()),
      },
      body,
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) throw new Error(`Webhook delivery failed: ${res.status}`);
  }
}

// ── Web Push ──────────────────────────────────────────────────────────────────
export class WebPushChannel implements ChannelDelivery {
  channel: AlertChannel = "web_push";

  constructor(
    private readonly push_fn: (subscription: string, payload: string) => Promise<void>,
  ) {}

  async send(n: AlertNotification, subscriptionJson: string): Promise<void> {
    await this.push_fn(subscriptionJson, JSON.stringify({ title: n.title, body: n.body, url: n.url }));
  }
}

// ── Slack ─────────────────────────────────────────────────────────────────────
export class SlackChannel implements ChannelDelivery {
  channel: AlertChannel = "slack";

  async send(n: AlertNotification, webhookUrl: string): Promise<void> {
    const icon = n.priority === "critical" ? ":rotating_light:" : n.priority === "high" ? ":warning:" : ":information_source:";
    const color = n.priority === "critical" ? "#ed4245" : n.priority === "high" ? "#faa61a" : "#5865f2";

    const payload = {
      attachments: [
        {
          color,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `${icon} *${n.title}*\n${n.body}`,
              },
            },
            {
              type: "section",
              fields: [
                { type: "mrkdwn", text: `*Danger:* ${n.danger_score}/100` },
                { type: "mrkdwn", text: `*Confidence:* ${Math.round(n.confidence * 100)}%` },
                { type: "mrkdwn", text: `*Time:* ${n.event_time}` },
              ],
            },
            {
              type: "actions",
              elements: [
                {
                  type: "button",
                  text: { type: "plain_text", text: "View Event" },
                  url: n.url,
                  style: n.priority === "critical" ? "danger" : "primary",
                },
              ],
            },
          ],
        },
      ],
    };

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) throw new Error(`Slack webhook delivery failed: ${res.status}`);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, (c) => `\\${c}`);
}

async function hmacSha256(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
