/**
 * POST /api/integrations/slack — Slack slash command endpoint
 *
 * Receives slash commands from Slack, verifies the HMAC signature,
 * and returns an immediate response. Long operations use response_url
 * (delayed responses, within Slack's 30-minute window).
 *
 * Slash commands registered:
 *   /aegis-search /aegis-region /aegis-event /aegis-ask /aegis-subscribe /aegis-help
 *
 * https://api.slack.com/interactivity/slash-commands
 */

import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

export const dynamic = "force-dynamic";

// Simple mock dependencies for the bot — replace with real service calls in production
const mockDeps = {
  async searchEvents(query: string) {
    return [
      {
        eventId: "01HXDEMO001",
        summary: `[demo] Search result for "${query}" — synthetic event`,
        class: "military_action",
        occurredAt: new Date(Date.now() - 3600_000).toISOString(),
        danger: 65,
      },
    ];
  },
  async getRegionBrief(region: string) {
    return `${region}: Situation is evolving. No verified events in the past 6 hours. (Demo)`;
  },
  async getEvent(eventId: string) {
    if (eventId.startsWith("01HX")) {
      return {
        eventId,
        summary: "[demo] Synthetic event — for testing",
        class: "military_action",
        occurredAt: new Date(Date.now() - 7200_000).toISOString(),
        danger: 55,
      };
    }
    return null;
  },
  async askCopilot(question: string) {
    return `[Demo AI] You asked: "${question}". In production, this calls Claude via the copilot service.`;
  },
  async subscribe(channelId: string, filter: string) {
    return `Subscribed channel ${channelId} to filter: "${filter}". Alerts will appear here.`;
  },
};

function verifySlackSignature(
  signingSecret: string,
  rawBody: string,
  timestamp: string,
  signature: string,
): boolean {
  const nowS = Math.floor(Date.now() / 1000);
  if (Math.abs(nowS - Number(timestamp)) > 300) return false;

  const baseString = `v0:${timestamp}:${rawBody}`;
  const expected = "v0=" + createHmac("sha256", signingSecret).update(baseString).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const timestamp = req.headers.get("x-slack-request-timestamp") ?? "";
  const signature = req.headers.get("x-slack-signature") ?? "";
  const signingSecret = process.env.SLACK_SIGNING_SECRET ?? "dev-secret";

  if (process.env.NODE_ENV === "production") {
    if (!verifySlackSignature(signingSecret, rawBody, timestamp, signature)) {
      return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
    }
  }

  const params = new URLSearchParams(rawBody);
  const command = params.get("command") ?? "";
  const text = params.get("text") ?? "";
  const channelId = params.get("channel_id") ?? "";

  // Determine locale from text content (Cyrillic → uk)
  const cyrillicRatio = [...text].filter((c) => /[Ѐ-ӿ]/.test(c)).length / (text.length || 1);
  const isUk = cyrillicRatio > 0.3;

  type Block = { type: string; text?: { type: string; text: string }; elements?: unknown[] };

  const blocks: Block[] = [];

  try {
    switch (command) {
      case "/aegis-help":
        blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: isUk
              ? "*Команди AegisLens:*\n`/aegis-search <запит>` `/aegis-region <назва>` `/aegis-event <id>` `/aegis-ask <питання>` `/aegis-subscribe <фільтр>`"
              : "*AegisLens Commands:*\n`/aegis-search <query>` `/aegis-region <name>` `/aegis-event <id>` `/aegis-ask <question>` `/aegis-subscribe <filter>`",
          },
        });
        break;

      case "/aegis-search": {
        if (!text.trim()) {
          return NextResponse.json({ text: isUk ? "Вкажіть запит" : "Provide a search query", response_type: "ephemeral" });
        }
        const results = await mockDeps.searchEvents(text);
        blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: results
              .slice(0, 5)
              .map((e) => `• *[${e.class}]* ${e.summary.slice(0, 80)} (${e.occurredAt.slice(0, 10)}, danger: ${e.danger})`)
              .join("\n"),
          },
        });
        break;
      }

      case "/aegis-region": {
        const brief = await mockDeps.getRegionBrief(text || "Ukraine");
        blocks.push({ type: "section", text: { type: "mrkdwn", text: brief } });
        break;
      }

      case "/aegis-event": {
        const ev = await mockDeps.getEvent(text.trim());
        if (!ev) {
          return NextResponse.json({ text: isUk ? "Подію не знайдено" : "Event not found", response_type: "ephemeral" });
        }
        blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*[${ev.class}]* ${ev.summary}\n📅 ${ev.occurredAt.slice(0, 10)} · Danger: *${ev.danger}/100* · ID: \`${ev.eventId}\``,
          },
        });
        break;
      }

      case "/aegis-ask": {
        const answer = await mockDeps.askCopilot(text);
        blocks.push({ type: "section", text: { type: "mrkdwn", text: answer } });
        break;
      }

      case "/aegis-subscribe": {
        const confirmation = await mockDeps.subscribe(channelId, text);
        blocks.push({ type: "section", text: { type: "mrkdwn", text: confirmation } });
        break;
      }

      default:
        return NextResponse.json({
          text: isUk ? "Невідома команда. Спробуйте `/aegis-help`" : "Unknown command. Try `/aegis-help`",
          response_type: "ephemeral",
        });
    }
  } catch {
    return NextResponse.json({
      text: isUk ? "Виникла помилка. Спробуйте пізніше." : "An error occurred. Please try again.",
      response_type: "ephemeral",
    });
  }

  return NextResponse.json({ blocks, response_type: "in_channel" });
}
