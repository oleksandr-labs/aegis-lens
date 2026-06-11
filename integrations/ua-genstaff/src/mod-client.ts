/**
 * MoD client (task 2) — ingests press releases from the Ministry of Defence of
 * Ukraine (mod.gov.ua / mil.gov.ua) site + its Telegram channel.
 *
 * Reads PUBLIC press output only (no login). Site via RSS/HTML, Telegram via Bot
 * API. Falls back to the DEMO fixture below.
 */

import { BaseOfficialClient, parseRssItems } from "./client-base";
import type { RawOfficialPost, SourceChannel } from "./types";
import { SOURCE_CHANNELS } from "./sources";

const DEMO_PRESS: Record<string, RawOfficialPost[]> = {
  mod_site: [
    {
      id: "mod_site:demo-1",
      channelId: "mod_site",
      branch: "mod",
      commKind: "press_release",
      publishedAt: new Date(Date.now() - 4 * 3600_000).toISOString(),
      url: "https://www.mil.gov.ua/news/0",
      titleUk: "Міноборони передало підрозділам нову партію БпЛА вітчизняного виробництва",
      text:
        "Міністерство оборони України повідомляє про передачу до Сил оборони нової партії безпілотних літальних апаратів вітчизняного виробництва. " +
        "Заступник Міністра оборони зазначив, що постачання здійснюється в межах програми посилення угруповань на Покровському та Лиманському напрямках. " +
        "Техніку отримали підрозділи 47-ї окремої механізованої бригади.",
      sourceKind: "site_html",
    },
  ],
  mod_tg: [
    {
      id: "mod_tg:demo-2",
      channelId: "mod_tg",
      branch: "mod",
      commKind: "press_release",
      publishedAt: new Date(Date.now() - 9 * 3600_000).toISOString(),
      url: "https://t.me/modofukraine/0",
      titleUk: "Заява Міністерства оборони щодо міжнародної підтримки",
      text:
        "Міністр оборони України провів зустріч із партнерами щодо нового пакета військової допомоги. " +
        "Йдеться про засоби протиповітряної оборони та боєприпаси для Харківської та Запорізької областей.",
      sourceKind: "telegram_channel",
    },
  ],
};

export class ModClient extends BaseOfficialClient {
  constructor(config: import("./client-base").BaseClientConfig = {}) {
    super(config, "MOD_TG_BOT_TOKEN");
  }

  protected demoFor(channel: SourceChannel): RawOfficialPost[] {
    return DEMO_PRESS[channel.id] ?? [];
  }

  protected async fetchNonTelegram(channel: SourceChannel): Promise<RawOfficialPost[]> {
    if (!channel.url) return [];
    const res = await fetch(channel.url, {
      headers: { "User-Agent": this.userAgent, Accept: "application/rss+xml, text/html" },
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    if (!res.ok) throw new Error(`MoD site ${res.status}`);
    return parseRssItems(await res.text(), channel, "press_release");
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
      branch: "mod",
      commKind: "press_release",
      publishedAt: new Date(unixDate * 1000).toISOString(),
      url: `https://t.me/${channel.telegramUsername}/${messageId}`,
      text,
      sourceKind: "telegram_channel",
    };
  }

  async fetchLatest(): Promise<RawOfficialPost[]> {
    const channels = SOURCE_CHANNELS.filter((c) => c.branch === "mod");
    const out: RawOfficialPost[] = [];
    for (const ch of channels) {
      if (!this.demo && ch.kind === "telegram_channel" && !ch.official) continue;
      out.push(...(await this.fetchChannel(ch)));
    }
    return out.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }
}
