import type { SourceAdapter, RawPayload, NormaliseResult } from "@ua-map/ingest";
import { redactPII } from "@ua-map/ingest";
import type { TelegramMessage } from "./bot-api-client";
import type { ChannelRegistryService } from "./registry";
import { TelegramBotApiClient, type TelegramConfig } from "./bot-api-client";
import crypto from "node:crypto";
import { monotonicFactory } from "ulid";

const ulid = monotonicFactory();

export class TelegramChannelAdapter implements SourceAdapter {
  readonly source_id: string;
  readonly display_name: string;

  private readonly api: TelegramBotApiClient;
  private lastUpdateId?: number;

  constructor(
    private readonly channelUsername: string,
    config: TelegramConfig,
    private readonly registry: ChannelRegistryService,
  ) {
    this.source_id = `telegram:${channelUsername}`;
    const entry = registry.get(channelUsername);
    this.display_name = entry?.display_name?.en ?? `Telegram @${channelUsername}`;
    this.api = new TelegramBotApiClient(config);
  }

  async *fetchSince(_cursor: string | undefined): AsyncGenerator<RawPayload> {
    const updates = await this.api.getUpdates(this.lastUpdateId ? this.lastUpdateId + 1 : undefined);

    for (const update of updates) {
      const msg = update.channel_post ?? update.message;
      if (!msg) continue;

      // Only process posts from our target channel
      if (msg.chat.username !== this.channelUsername) continue;

      const text = msg.text ?? msg.caption ?? "";
      const { redacted } = redactPII(text);

      const payload = {
        message_id: msg.message_id,
        chat_username: msg.chat.username,
        date: msg.date,
        text: redacted,
        has_photo: !!msg.photo,
        has_video: !!msg.video,
        photo_file_ids: msg.photo?.map((p) => p.file_id) ?? [],
        video_file_id: msg.video?.file_id,
      };

      const content_hash = crypto
        .createHash("sha256")
        .update(JSON.stringify(payload))
        .digest("hex");

      yield {
        source_id: this.source_id,
        external_id: String(msg.message_id),
        fetched_at: new Date().toISOString(),
        payload,
        content_hash,
      };

      this.lastUpdateId = update.update_id;
    }
  }

  normalise(raw: RawPayload): NormaliseResult {
    const msg = raw.payload as {
      message_id: number;
      chat_username: string;
      date: number;
      text: string;
    };

    const sourceWeight = this.registry.getSourceWeight(this.channelUsername);

    return {
      raw,
      event: {
        event_id: ulid(),
        ingested_at: raw.fetched_at,
        occurred_at: new Date(msg.date * 1000).toISOString(),
        reported_at: new Date(msg.date * 1000).toISOString(),
        // class/subclass filled by NLP service downstream
        class: "military_action",
        severity: 0,
        danger_score: 0,
        confidence: sourceWeight,
        sources: [
          {
            source_id: this.source_id,
            url: `https://t.me/${msg.chat_username}/${msg.message_id}`,
            fetched_at: raw.fetched_at,
            language: "uk",
            original_text_hash: raw.content_hash,
            original_text: msg.text,
            source_weight: sourceWeight,
          },
        ],
        summary: { uk: msg.text.slice(0, 280) },
        verification_state: "ingested",
        schema_version: "1",
      },
    };
  }

  async healthCheck() {
    return {
      source_id: this.source_id,
      healthy: true,
    };
  }
}
