/**
 * Minimal Slack Bolt-compatible HTTP client.
 *
 * Implements the Slack Events API / Slash Commands webhook contract without
 * requiring the full @slack/bolt package (keeps bundle lean). Supports:
 *   - slash commands (application/x-www-form-urlencoded POST)
 *   - events API (JSON POST with challenge handshake)
 *   - request signature verification (hmac-sha256)
 */

import { createHmac, timingSafeEqual } from "crypto";

export interface SlackSlashCommand {
  command: string;         // e.g. "/search"
  text: string;            // args after the command
  user_id: string;
  user_name: string;
  channel_id: string;
  channel_name: string;
  team_id: string;
  response_url: string;
  trigger_id: string;
}

export interface SlackEventWrapper {
  type: "event_callback" | "url_verification";
  token?: string;
  challenge?: string;
  event?: {
    type: string;
    text?: string;
    user?: string;
    channel?: string;
    ts?: string;
  };
}

export interface SlackMessage {
  text?: string;
  blocks?: SlackBlock[];
  response_type?: "in_channel" | "ephemeral";
}

export interface SlackBlock {
  type: "section" | "divider" | "header" | "context";
  text?: { type: "mrkdwn" | "plain_text"; text: string };
  fields?: Array<{ type: "mrkdwn" | "plain_text"; text: string }>;
}

export class SlackBoltClient {
  constructor(private readonly signingSecret: string) {}

  /** Verify Slack request signature per https://api.slack.com/authentication/verifying-requests-from-slack */
  verifySignature(rawBody: string, timestamp: string, signature: string): boolean {
    const nowS = Math.floor(Date.now() / 1000);
    if (Math.abs(nowS - Number(timestamp)) > 300) return false; // replay guard

    const baseString = `v0:${timestamp}:${rawBody}`;
    const expected = "v0=" + createHmac("sha256", this.signingSecret).update(baseString).digest("hex");

    try {
      return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  /** Parse a slash command payload from application/x-www-form-urlencoded body */
  parseSlashCommand(body: string): SlackSlashCommand {
    const params = new URLSearchParams(body);
    return {
      command: params.get("command") ?? "",
      text: params.get("text") ?? "",
      user_id: params.get("user_id") ?? "",
      user_name: params.get("user_name") ?? "",
      channel_id: params.get("channel_id") ?? "",
      channel_name: params.get("channel_name") ?? "",
      team_id: params.get("team_id") ?? "",
      response_url: params.get("response_url") ?? "",
      trigger_id: params.get("trigger_id") ?? "",
    };
  }

  /** Post a delayed response to the response_url (supports longer operations) */
  async postDelayedResponse(responseUrl: string, message: SlackMessage): Promise<void> {
    await fetch(responseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
  }

  /** Build a simple section block */
  static sectionBlock(text: string): SlackBlock {
    return { type: "section", text: { type: "mrkdwn", text } };
  }

  /** Build a divider block */
  static dividerBlock(): SlackBlock {
    return { type: "divider" };
  }

  /** Build a header block */
  static headerBlock(text: string): SlackBlock {
    return { type: "header", text: { type: "plain_text", text } };
  }
}
