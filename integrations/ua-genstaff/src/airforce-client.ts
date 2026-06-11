/**
 * Air Force Command client (task 3) — ingests missile/drone THREAT posts from
 * the Повітряні Сили ЗСУ Telegram channel ("Увага! Ракетна небезпека…",
 * "БпЛА курсом на…"). These short operational alerts feed the air-alert
 * correlation module (task 8).
 *
 * Telegram Bot API only, public channel, read-only. DEMO fixture below mirrors
 * the standardized threat-post wording.
 */

import { BaseOfficialClient } from "./client-base";
import type { RawOfficialPost, SourceChannel } from "./types";
import { SOURCE_CHANNELS } from "./sources";

const DEMO_THREATS: RawOfficialPost[] = [
  {
    id: "air_force_tg:demo-1",
    channelId: "air_force_tg",
    branch: "air_force",
    commKind: "threat_alert",
    publishedAt: new Date(Date.now() - 25 * 60_000).toISOString(),
    url: "https://t.me/kpszsu/0",
    titleUk: "Загроза балістики",
    text:
      "Увага! Ракетна небезпека для Харківської області. " +
      "Зафіксовано пуск балістичних ракет. Негайно прямуйте до укриттів!",
    sourceKind: "telegram_channel",
  },
  {
    id: "air_force_tg:demo-2",
    channelId: "air_force_tg",
    branch: "air_force",
    commKind: "threat_alert",
    publishedAt: new Date(Date.now() - 12 * 60_000).toISOString(),
    url: "https://t.me/kpszsu/1",
    titleUk: "Загроза ударних БпЛА",
    text:
      "Групи ударних БпЛА типу Shahed курсом на Дніпропетровську та Запорізьку області. " +
      "Перебувайте в укриттях до відбою тривоги.",
    sourceKind: "telegram_channel",
  },
  {
    id: "air_force_tg:demo-3",
    channelId: "air_force_tg",
    branch: "air_force",
    commKind: "threat_alert",
    publishedAt: new Date(Date.now() - 6 * 60_000).toISOString(),
    url: "https://t.me/kpszsu/2",
    titleUk: "Загроза крилатих ракет",
    text:
      "Зліт стратегічної авіації противника. Існує загроза застосування крилатих ракет " +
      "по території Львівської та Хмельницької областей.",
    sourceKind: "telegram_channel",
  },
];

export class AirForceClient extends BaseOfficialClient {
  constructor(config: import("./client-base").BaseClientConfig = {}) {
    super(config, "AIRFORCE_TG_BOT_TOKEN");
  }

  protected demoFor(channel: SourceChannel): RawOfficialPost[] {
    return channel.id === "air_force_tg" ? DEMO_THREATS : [];
  }

  protected mapTelegramPost(
    channel: SourceChannel,
    messageId: number,
    unixDate: number,
    text: string,
  ): RawOfficialPost {
    return {
      id: `${channel.id}:${messageId}`,
      channelId: channel.id,
      branch: "air_force",
      commKind: "threat_alert",
      publishedAt: new Date(unixDate * 1000).toISOString(),
      url: `https://t.me/${channel.telegramUsername}/${messageId}`,
      text,
      sourceKind: "telegram_channel",
    };
  }

  async fetchLatest(): Promise<RawOfficialPost[]> {
    const channels = SOURCE_CHANNELS.filter((c) => c.branch === "air_force");
    const out: RawOfficialPost[] = [];
    for (const ch of channels) {
      if (!this.demo && ch.kind === "telegram_channel" && !ch.official) continue;
      out.push(...(await this.fetchChannel(ch)));
    }
    return out.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }
}

export { DEMO_THREATS };
