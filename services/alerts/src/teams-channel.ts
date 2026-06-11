'use server';
/**
 * Microsoft Teams channel delivery via Incoming Webhook + Adaptive Cards v1.5.
 * Teams rate limit: 100 requests/second per connector (we treat this as 100 rpm for safety).
 *
 * Доставка сповіщень у Microsoft Teams через вхідний webhook та Adaptive Cards v1.5.
 * Ліміт Teams: 100 запитів/секунду на конектор (для безпеки вважаємо 100 rpm).
 */

import type { AlertNotification } from "./types";

// ── Config ────────────────────────────────────────────────────────────────────

export interface TeamsWebhookConfig {
  /** Full Incoming Webhook URL provided by Teams connector setup */
  webhookUrl: string;
  /** Organisation identifier for routing/logging */
  orgId: string;
  /** Display name of the Teams channel (for logging only) */
  channelName: string;
}

// ── Adaptive Card builder ─────────────────────────────────────────────────────

/**
 * Build an Adaptive Card JSON payload for a given AlertNotification.
 * Spec: https://adaptivecards.io/explorer/ — version 1.5 (Teams supports up to 1.5).
 *
 * Будує JSON-payload Adaptive Card для заданого AlertNotification.
 */
export function buildTeamsAdaptiveCard(
  notification: AlertNotification,
): Record<string, unknown> {
  const priorityLabel =
    notification.priority === "critical"
      ? "🚨 CRITICAL"
      : notification.priority === "high"
      ? "⚠️ HIGH"
      : notification.priority === "medium"
      ? "ℹ️ MEDIUM"
      : "LOW";

  const accentColor =
    notification.priority === "critical"
      ? "attention"
      : notification.priority === "high"
      ? "warning"
      : "accent";

  return {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        contentUrl: null,
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.5",
          body: [
            {
              type: "TextBlock",
              text: `${priorityLabel} — ${notification.title}`,
              weight: "bolder",
              size: "medium",
              color: accentColor,
              wrap: true,
            },
            {
              type: "TextBlock",
              text: notification.body,
              wrap: true,
              spacing: "small",
            },
            {
              type: "FactSet",
              spacing: "medium",
              facts: [
                {
                  title: "Danger score",
                  value: `${notification.danger_score}/100`,
                },
                {
                  title: "Confidence",
                  value: `${Math.round(notification.confidence * 100)}%`,
                },
                {
                  title: "Event time",
                  value: notification.event_time,
                },
              ],
            },
          ],
          actions: [
            {
              type: "Action.OpenUrl",
              title: "View Event",
              url: notification.url,
              style:
                notification.priority === "critical" ? "destructive" : "positive",
            },
          ],
          msteams: {
            width: "full",
          },
        },
      },
    ],
  };
}

// ── Send ──────────────────────────────────────────────────────────────────────

/**
 * Send an alert notification to a Microsoft Teams channel via Incoming Webhook.
 * Returns {ok, status} — does not throw on HTTP errors to allow the router to handle retries.
 *
 * Надсилає сповіщення про тривогу в канал Microsoft Teams через вхідний webhook.
 */
export async function sendTeamsAlert(
  config: TeamsWebhookConfig,
  notification: AlertNotification,
): Promise<{ ok: boolean; status: number }> {
  const card = buildTeamsAdaptiveCard(notification);

  let res: Response;
  try {
    res = await fetch(config.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(card),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    // Network failure — return synthetic status
    console.error(
      `[teams-channel] Network error sending to ${config.channelName} (org=${config.orgId}):`,
      err,
    );
    return { ok: false, status: 0 };
  }

  if (!res.ok) {
    console.error(
      `[teams-channel] Delivery failed for org=${config.orgId} channel=${config.channelName}: HTTP ${res.status}`,
    );
  }

  return { ok: res.ok, status: res.status };
}

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const TEAMS_CHANNEL_NOTES_EN = [
  "Teams integration uses Incoming Webhooks only — no bot framework required; configure the webhook URL in the Teams channel connector settings.",
  "Notifications are delivered as Adaptive Cards v1.5 with TextBlock title/body, FactSet for danger score/confidence, and an Action.OpenUrl button.",
  "Teams rate limit is 100 requests/second per connector; Aegis applies a conservative 100 rpm cap and will queue excess messages.",
];

export const TEAMS_CHANNEL_NOTES_UK = [
  "Інтеграція з Teams використовує лише вхідні webhook — фреймворк ботів не потрібен; налаштуйте URL webhook у налаштуваннях конектора каналу Teams.",
  "Сповіщення доставляються як Adaptive Cards v1.5 з TextBlock для заголовка/тіла, FactSet для балу небезпеки/впевненості та кнопкою Action.OpenUrl.",
  "Ліміт Teams: 100 запитів/секунду на конектор; Aegis застосовує консервативне обмеження 100 rpm і буферизуватиме надлишкові повідомлення.",
];
