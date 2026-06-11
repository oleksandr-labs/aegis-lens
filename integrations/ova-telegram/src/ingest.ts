/**
 * Task 4 — Ingest OVA channel posts via the Telegram Bot API (within ToS).
 *
 * Reuses `@ua-map/telegram → TelegramBotApiClient` (read-only Bot API, public
 * channels only — NO userbot / MTProto scraping of user accounts). The bot token
 * is read ONLY from `process.env.OVA_TELEGRAM_BOT_TOKEN`; with no token the
 * source serves a small DEMO fixture so the pipeline is exercisable offline.
 *
 * Output is a list of normalized `OvaPost`s with the UA original preserved
 * verbatim and a permanent `t.me/<channel>/<id>` evidence URL on every record.
 */

import type { OblastCode, OvaPost, OvaChannel } from "./types";
import { allChannels } from "./registry";
import {
  TelegramBotApiClient,
  type TelegramMessage,
} from "../../telegram/src/bot-api-client";

export interface OvaIngestConfig {
  botToken?: string;
  /** Restrict to a subset of oblasts (default: all registered channels). */
  oblasts?: OblastCode[];
  /** Posts to pull per channel per poll. Default 10 (polite). */
  perChannel?: number;
}

/** Demo posts (no secrets) — shape-valid sample for offline pipeline runs. */
const DEMO_POSTS: OvaPost[] = [
  {
    postId: "synegubov:90001",
    username: "synegubov",
    oblastCode: "UA-63",
    kind: "oblast_ova",
    textUk: "Унаслідок ворожого обстрілу Холодногірського району Харкова виникла пожежа. Рятувальники працюють на місці. Бережіть себе.",
    postedAt: new Date(Date.now() - 8 * 60_000).toISOString(),
    evidenceUrl: "https://t.me/synegubov/90001",
  },
  {
    postId: "zoda_gov_ua:90002",
    username: "zoda_gov_ua",
    oblastCode: "UA-23",
    kind: "oblast_ova",
    textUk: "Загроза застосування балістичного озброєння. Перебувайте в укриттях до відбою тривоги.",
    postedAt: new Date(Date.now() - 3 * 60_000).toISOString(),
    evidenceUrl: "https://t.me/zoda_gov_ua/90002",
  },
];

export class OvaTelegramSource {
  private readonly client?: TelegramBotApiClient;
  private readonly channels: OvaChannel[];
  private readonly perChannel: number;

  constructor(config: OvaIngestConfig = {}) {
    const token = config.botToken ?? process.env.OVA_TELEGRAM_BOT_TOKEN;
    if (token) this.client = new TelegramBotApiClient({ botToken: token });
    this.perChannel = config.perChannel ?? 10;

    let chans = allChannels();
    if (config.oblasts) {
      const set = new Set(config.oblasts);
      chans = chans.filter((c) => set.has(c.oblastCode));
    }
    this.channels = chans;
  }

  get enabled(): boolean {
    return !!this.client;
  }

  /** Channels this source will poll. */
  targets(): OvaChannel[] {
    return this.channels;
  }

  /** Map one raw Telegram message → normalized OvaPost (UA original preserved). */
  private toPost(channel: OvaChannel, msg: TelegramMessage): OvaPost | null {
    const body = msg.text ?? msg.caption;
    if (!body) return null;
    const postedAt = new Date((msg.date ?? Date.now() / 1000) * 1000).toISOString();
    return {
      postId: `${channel.username}:${msg.message_id}`,
      username: channel.username,
      oblastCode: channel.oblastCode,
      kind: channel.kind,
      textUk: body, // verbatim original — never mutated/translated here
      postedAt,
      evidenceUrl: `https://t.me/${channel.username}/${msg.message_id}`,
      mediaUrls: msg.photo?.length || msg.video ? [] : undefined,
    };
  }

  /** Poll every target channel. Single-channel failures never abort the run. */
  async poll(): Promise<OvaPost[]> {
    if (!this.client) {
      // Offline/demo mode — return fixtures filtered to selected channels.
      const want = new Set(this.channels.map((c) => c.username));
      return DEMO_POSTS.filter((p) => want.has(p.username));
    }

    const out: OvaPost[] = [];
    for (const channel of this.channels) {
      let msgs: TelegramMessage[] = [];
      try {
        msgs = await this.client.getChannelHistory(channel.username, this.perChannel);
      } catch {
        continue; // resilient: one outage must not break the fleet poll
      }
      for (const msg of msgs) {
        const post = this.toPost(channel, msg);
        if (post) out.push(post);
      }
    }
    return out;
  }
}
