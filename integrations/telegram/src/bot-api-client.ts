/**
 * Telegram Bot API client for read-only public channel ingestion.
 * Uses getUpdates / forwardMessage polling pattern.
 *
 * For channels that require userbot access (MTProto), see userbot.ts.
 * This module stays within Telegram ToS: public channels only, read-only.
 */

export interface TelegramConfig {
  botToken: string;
  /** Request timeout in ms. Default: 30_000 */
  timeoutMs?: number;
}

export interface TelegramMessage {
  message_id: number;
  chat: { id: number; type: string; username?: string; title?: string };
  date: number;
  text?: string;
  caption?: string;
  photo?: TelegramPhotoSize[];
  video?: TelegramVideo;
  document?: TelegramDocument;
  forward_from_chat?: { id: number; username?: string };
  forward_date?: number;
}

export interface TelegramPhotoSize {
  file_id: string;
  width: number;
  height: number;
  file_size?: number;
}

export interface TelegramVideo {
  file_id: string;
  width: number;
  height: number;
  duration: number;
  file_size?: number;
  mime_type?: string;
}

export interface TelegramDocument {
  file_id: string;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

export interface TelegramUpdate {
  update_id: number;
  channel_post?: TelegramMessage;
  message?: TelegramMessage;
}

export class TelegramBotApiClient {
  private readonly base: string;
  private readonly timeout: number;

  constructor(private readonly config: TelegramConfig) {
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
    const data = await res.json() as { ok: boolean; result: TelegramUpdate[] };
    if (!data.ok) throw new Error("Telegram getUpdates returned ok=false");
    return data.result;
  }

  async getChannelHistory(channelUsername: string, limit = 100): Promise<TelegramMessage[]> {
    // Bot API does not expose full channel history; use getChatHistory via userbot.
    // This method provides the forwarding channel approach as a fallback.
    const params = new URLSearchParams({
      chat_id: `@${channelUsername}`,
      limit: String(limit),
    });
    const res = await fetch(`${this.base}/getChatHistory?${params}`, {
      signal: AbortSignal.timeout(this.timeout),
    });
    if (!res.ok) return []; // Not all bots have this privilege
    const data = await res.json() as { ok: boolean; result?: TelegramMessage[] };
    return data.result ?? [];
  }

  async getFileUrl(fileId: string): Promise<string | null> {
    const res = await fetch(`${this.base}/getFile?file_id=${fileId}`);
    if (!res.ok) return null;
    const data = await res.json() as { ok: boolean; result?: { file_path: string } };
    if (!data.ok || !data.result) return null;
    return `https://api.telegram.org/file/bot${this.config.botToken}/${data.result.file_path}`;
  }
}
