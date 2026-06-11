/**
 * Navy Command client (task 4) — ingests statements from the Військово-Морські
 * Сили ЗСУ Telegram channel: Black Sea situation, naval threat, strikes on
 * enemy vessels. Telegram Bot API only, public channel, read-only. DEMO
 * fixture below.
 */

import { BaseOfficialClient } from "./client-base";
import type { RawOfficialPost, SourceChannel } from "./types";
import { SOURCE_CHANNELS } from "./sources";

const DEMO_NAVY: RawOfficialPost[] = [
  {
    id: "navy_tg:demo-1",
    channelId: "navy_tg",
    branch: "navy",
    commKind: "statement",
    publishedAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
    url: "https://t.me/UkrainianNavy/0",
    titleUk: "Обстановка в акваторії Чорного моря",
    text:
      "Військово-Морські Сили ЗСУ повідомляють: у Чорному морі на бойовому чергуванні відсутні носії крилатих ракет противника. " +
      "Загроза ракетних ударів з морського напрямку наразі низька.",
    sourceKind: "telegram_channel",
  },
  {
    id: "navy_tg:demo-2",
    channelId: "navy_tg",
    branch: "navy",
    commKind: "threat_alert",
    publishedAt: new Date(Date.now() - 40 * 60_000).toISOString(),
    url: "https://t.me/UkrainianNavy/1",
    titleUk: "Вихід носіїв крилатих ракет",
    text:
      "Зафіксовано вихід у море одного носія крилатих ракет типу «Калібр». " +
      "Загальний залп може становити до 8 ракет. Існує загроза для Одеської та Миколаївської областей.",
    sourceKind: "telegram_channel",
  },
];

export class NavyClient extends BaseOfficialClient {
  constructor(config: import("./client-base").BaseClientConfig = {}) {
    super(config, "NAVY_TG_BOT_TOKEN");
  }

  protected demoFor(channel: SourceChannel): RawOfficialPost[] {
    return channel.id === "navy_tg" ? DEMO_NAVY : [];
  }

  protected mapTelegramPost(
    channel: SourceChannel,
    messageId: number,
    unixDate: number,
    text: string,
  ): RawOfficialPost {
    // Heuristic: naval threat posts mention "загроза"/"носі"/"Калібр".
    const isThreat = /загроз|носі|калібр|пуск|ракет/i.test(text);
    return {
      id: `${channel.id}:${messageId}`,
      channelId: channel.id,
      branch: "navy",
      commKind: isThreat ? "threat_alert" : "statement",
      publishedAt: new Date(unixDate * 1000).toISOString(),
      url: `https://t.me/${channel.telegramUsername}/${messageId}`,
      text,
      sourceKind: "telegram_channel",
    };
  }

  async fetchLatest(): Promise<RawOfficialPost[]> {
    const channels = SOURCE_CHANNELS.filter((c) => c.branch === "navy");
    const out: RawOfficialPost[] = [];
    for (const ch of channels) {
      if (!this.demo && ch.kind === "telegram_channel" && !ch.official) continue;
      out.push(...(await this.fetchChannel(ch)));
    }
    return out.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }
}

export { DEMO_NAVY };
