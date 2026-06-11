/**
 * DeepStateMAP public Telegram channel — commentary context (TODO task:
 * "Their public Telegram channel for commentary context").
 *
 * DeepState publishes daily editorial commentary (in Ukrainian) on their public
 * Telegram channel (@DeepStateUA). We reuse the platform's read-only Telegram Bot API
 * client (integrations/telegram/src/bot-api-client.ts) — Bot API only, public channel
 * only, no userbot scraping (Telegram + DeepState ToS respected).
 *
 * The Bot API cannot read arbitrary channel history; a bot only receives `channel_post`
 * updates for channels it is an administrator of. So this module supports two modes:
 *   1. Live: a bot added to a forwarding/companion channel emits channel_post updates.
 *   2. Demo: a bundled fixture so the pipeline is exercisable without a bot token.
 *
 * Translation: commentary is normalized into { en, uk } summaries. The `uk` field
 * preserves the original; `en` is a translated summary (here, a stub passthrough —
 * wire to the platform's translation service where available).
 */

import type { FrontlineCommentary } from "./types";
import { DEEPSTATE_TELEGRAM_URL } from "./attribution";

/**
 * Minimal local mirror of the read-only Telegram Bot API client surface from
 * `integrations/telegram/src/bot-api-client.ts` (`@ua-map/integration-telegram`).
 * We re-declare the tiny shape we use here instead of cross-importing, because this
 * repo does not configure TS path mappings between integration packages and we must
 * stay additive + conservative. Same Bot-API-only, public-channel-only discipline.
 */
export interface TelegramMessage {
  message_id: number;
  chat: { id: number; type: string; username?: string; title?: string };
  date: number; // unix seconds
  text?: string;
  caption?: string;
}

interface TelegramUpdate {
  update_id: number;
  channel_post?: TelegramMessage;
  message?: TelegramMessage;
}

/** Read-only Bot API client (getUpdates polling). Mirrors the shared telegram client. */
export class TelegramBotApiClient {
  private readonly base: string;
  private readonly timeout: number;

  constructor(config: { botToken: string; timeoutMs?: number }) {
    this.base = `https://api.telegram.org/bot${config.botToken}`;
    this.timeout = config.timeoutMs ?? 30_000;
  }

  async getUpdates(offset?: number, limit = 100): Promise<TelegramUpdate[]> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (offset !== undefined) params.set("offset", String(offset));
    const res = await fetch(`${this.base}/getUpdates?${params}`, {
      signal: AbortSignal.timeout(this.timeout),
    });
    if (!res.ok) throw new Error(`Telegram API error ${res.status}`);
    const data = (await res.json()) as { ok: boolean; result: TelegramUpdate[] };
    if (!data.ok) throw new Error("Telegram getUpdates returned ok=false");
    return data.result;
  }
}

export const DEEPSTATE_CHANNEL = "DeepStateUA";

export interface TelegramContextConfig {
  botToken?: string;
  channel?: string;
  timeoutMs?: number;
}

/**
 * Translate Ukrainian commentary to an EN summary. Stub: returns the original text as
 * the uk summary and a marked passthrough for en. Replace with the platform translation
 * service (the canonical Event.summary is LocalizedText, so both keys are expected).
 */
export function translateCommentary(originalUk: string): { en: string; uk: string } {
  const trimmed = originalUk.trim();
  const uk = trimmed.length > 280 ? `${trimmed.slice(0, 277)}…` : trimmed;
  return {
    uk,
    // Marked so downstream knows this needs a real translation pass (YMYL-safe).
    en: `[auto-summary, verify translation] ${uk}`,
  };
}

function messageUrl(channel: string, messageId: number): string {
  return `https://t.me/${channel}/${messageId}`;
}

function toCommentary(channel: string, msg: TelegramMessage): FrontlineCommentary | null {
  const text = msg.text ?? msg.caption;
  if (!text) return null;
  return {
    messageId: msg.message_id,
    postedAt: new Date(msg.date * 1000).toISOString(),
    originalText: text,
    summary: translateCommentary(text),
    url: messageUrl(channel, msg.message_id),
  };
}

export class DeepStateTelegramContext {
  private readonly client?: TelegramBotApiClient;
  private readonly channel: string;
  private offset?: number;

  constructor(config: TelegramContextConfig = {}) {
    const token = config.botToken ?? process.env.TELEGRAM_BOT_TOKEN;
    this.channel = config.channel ?? DEEPSTATE_CHANNEL;
    if (token) {
      this.client = new TelegramBotApiClient({ botToken: token, timeoutMs: config.timeoutMs });
    }
  }

  get isLive(): boolean {
    return Boolean(this.client);
  }

  /** Poll new channel_post updates and return normalized commentary. */
  async pollCommentary(): Promise<FrontlineCommentary[]> {
    if (!this.client) return DEMO_COMMENTARY;
    const updates = await this.client.getUpdates(this.offset);
    const out: FrontlineCommentary[] = [];
    for (const u of updates) {
      if (u.update_id >= (this.offset ?? 0)) this.offset = u.update_id + 1;
      const post = u.channel_post;
      if (!post) continue;
      if (post.chat.username && post.chat.username !== this.channel) continue;
      const c = toCommentary(this.channel, post);
      if (c) out.push(c);
    }
    return out;
  }

  channelUrl(): string {
    return DEEPSTATE_TELEGRAM_URL;
  }
}

// ── DEMO fixture ──────────────────────────────────────────────────────────────
// Synthetic, illustrative commentary (NOT real DeepState posts).

export const DEMO_COMMENTARY: FrontlineCommentary[] = [
  {
    messageId: 1001,
    postedAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
    originalText:
      "Підсумок доби: противник намагався просунутися на Бахмутському напрямку, успіху не мав. Лінія фронту без суттєвих змін.",
    summary: {
      uk: "Підсумок доби: противник намагався просунутися на Бахмутському напрямку, успіху не мав. Лінія фронту без суттєвих змін.",
      en: "[auto-summary, verify translation] Daily recap: the enemy attempted to advance in the Bakhmut direction without success. The frontline is largely unchanged.",
    },
    url: "https://t.me/DeepStateUA/1001",
  },
  {
    messageId: 1002,
    postedAt: new Date(Date.now() - 30 * 3600_000).toISOString(),
    originalText:
      "Зафіксовано звільнення невеликої ділянки на північ від населеного пункту. Уточнюємо контроль.",
    summary: {
      uk: "Зафіксовано звільнення невеликої ділянки на північ від населеного пункту. Уточнюємо контроль.",
      en: "[auto-summary, verify translation] A small area north of the settlement was recorded as liberated; control is being clarified.",
    },
    url: "https://t.me/DeepStateUA/1002",
  },
];
