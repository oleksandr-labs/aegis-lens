/**
 * General Staff client (task 1) — ingests the standardized DAILY SUMMARY
 * ("оперативна інформація" / "Загальні бойові втрати противника") published by
 * the Генеральний штаб ЗСУ on Facebook (primary) and mirrored to Telegram.
 *
 * Facebook Graph access requires a page token and is gated; without it the
 * client reads the Telegram mirror via Bot API or falls back to the DEMO
 * fixture below — a realistic, standardized General Staff daily report so the
 * summary parser is exercisable end-to-end.
 *
 * NEUTRALITY: the demo figures are illustrative of the official report FORMAT;
 * they are carried as officially-reported claims, never asserted as verified.
 */

import { BaseOfficialClient, parseRssItems, stripHtml } from "./client-base";
import type { RawOfficialPost, SourceChannel } from "./types";
import { channelsForBranch } from "./sources";

/** A standardized General Staff daily-report body (illustrative format). */
const DEMO_DAILY_BODY = [
  "Оперативна інформація станом на 08.00 щодо російського вторгнення.",
  "",
  "Загальні бойові втрати противника з 24.02.2022 по орієнтовно становлять:",
  "особового складу — близько 720940 (+1180) осіб,",
  "танків — 8124 (+9),",
  "бойових броньованих машин — 15890 (+21),",
  "артилерійських систем — 18230 (+38),",
  "РСЗВ — 1242 (+1),",
  "засобів ППО — 1015 (+2),",
  "літаків — 369,",
  "гелікоптерів — 331,",
  "БПЛА оперативно-тактичного рівня — 12480 (+74),",
  "крилатих ракет — 2810 (+0),",
  "кораблів / катерів — 28,",
  "підводних човнів — 1,",
  "автомобільної техніки та автоцистерн — 28150 (+96),",
  "спеціальної техніки — 3640 (+4).",
  "",
  "Загалом за добу відбулося 152 бойових зіткнення.",
  "На Покровському напрямку противник здійснив 41 атаку, сили оборони відбили ворожі штурми.",
  "На Лиманському напрямку зафіксовано 18 спроб наступу в районі населених пунктів Донецької області.",
  "На Купʼянському напрямку (Харківська область) тривають бойові дії, відбито 12 атак.",
  "На Запорізькому напрямку противник завдав авіаударів; сили оборони утримують позиції.",
].join("\n");

export class GenStaffClient extends BaseOfficialClient {
  constructor(config: import("./client-base").BaseClientConfig = {}) {
    super(config, "GENSTAFF_TG_BOT_TOKEN");
  }

  protected demoFor(channel: SourceChannel): RawOfficialPost[] {
    if (channel.branch !== "general_staff") return [];
    return [
      {
        id: `${channel.id}:demo-daily`,
        channelId: channel.id,
        branch: "general_staff",
        commKind: "daily_summary",
        publishedAt: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
        url:
          channel.kind === "facebook_page"
            ? "https://www.facebook.com/GeneralStaff.ua/posts/0"
            : "https://t.me/GeneralStaffZSU/0",
        titleUk: "Оперативна інформація станом на 08.00",
        text: DEMO_DAILY_BODY,
        sourceKind: channel.kind,
      },
    ];
  }

  /** Facebook Graph page feed (gated): requires FB_PAGE_TOKEN; else demo. */
  protected async fetchNonTelegram(channel: SourceChannel): Promise<RawOfficialPost[]> {
    if (channel.kind === "facebook_page") {
      const fbToken = process.env.FB_PAGE_TOKEN;
      if (!fbToken || !channel.facebookSlug) return [];
      const url =
        `https://graph.facebook.com/v19.0/${channel.facebookSlug}/posts` +
        `?fields=message,created_time,permalink_url&limit=10&access_token=${fbToken}`;
      const res = await fetch(url, {
        headers: { "User-Agent": this.userAgent },
        signal: AbortSignal.timeout(this.timeoutMs),
      });
      if (!res.ok) throw new Error(`Facebook Graph ${res.status}`);
      const data = (await res.json()) as {
        data?: Array<{ id: string; message?: string; created_time?: string; permalink_url?: string }>;
      };
      return (data.data ?? [])
        .filter((p) => !!p.message)
        .map((p) => ({
          id: `${channel.id}:${p.id}`,
          channelId: channel.id,
          branch: "general_staff" as const,
          commKind: "daily_summary" as const,
          publishedAt: p.created_time ? new Date(p.created_time).toISOString() : new Date().toISOString(),
          url: p.permalink_url,
          text: stripHtml(p.message!),
          sourceKind: "facebook_page" as const,
        }));
    }
    if (channel.url) {
      const res = await fetch(channel.url, {
        headers: { "User-Agent": this.userAgent, Accept: "application/rss+xml, text/html" },
        signal: AbortSignal.timeout(this.timeoutMs),
      });
      if (!res.ok) throw new Error(`GenStaff site ${res.status}`);
      return parseRssItems(await res.text(), channel, "daily_summary");
    }
    return [];
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
      branch: "general_staff",
      commKind: "daily_summary",
      publishedAt: new Date(unixDate * 1000).toISOString(),
      url: `https://t.me/${channel.telegramUsername}/${messageId}`,
      text,
      sourceKind: "telegram_channel",
    };
  }

  /** Fetch the latest General Staff posts (Facebook + Telegram mirror). */
  async fetchLatest(): Promise<RawOfficialPost[]> {
    const channels = channelsForBranch("general_staff");
    const out: RawOfficialPost[] = [];
    for (const ch of channels) {
      if (!this.demo && ch.kind === "telegram_channel" && !ch.official) continue;
      out.push(...(await this.fetchChannel(ch)));
    }
    return out.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }
}

export { DEMO_DAILY_BODY };
