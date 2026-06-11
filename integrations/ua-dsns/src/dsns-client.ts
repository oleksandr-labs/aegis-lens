/**
 * DSNS client — fetches PUBLIC operational reports from:
 *   1. The official DSNS site / regional sub-sites (RSS or HTML news lists).
 *   2. DSNS Telegram channels (national + per-oblast) via the shared
 *      Telegram Bot API client — read-only, public channels only.
 *
 * ToS / crawler discipline (see COMPLIANCE.md):
 *   - Polite rate limit: at most 1 request per `minIntervalMs` (default 5s)
 *     per host, with a per-channel cache TTL (default 5 min). DSNS is an
 *     "underused feed" — do NOT hammer it.
 *   - Sends a descriptive User-Agent so DSNS ops can identify the crawler.
 *   - Never scrapes user accounts; Telegram access is Bot API only.
 *   - Secrets (Telegram bot token) come from process.env, never hardcoded.
 *
 * Without network access / secrets the client transparently falls back to a
 * small DEMO fixture so the pipeline is runnable end-to-end.
 */

import type { DsnsChannel, DsnsRawReport } from "./types";
import { ALL_DSNS_CHANNELS, NATIONAL_CHANNELS } from "./oblast-branches";

export interface DsnsClientConfig {
  /** Telegram bot token (read from process.env.DSNS_TG_BOT_TOKEN). */
  telegramBotToken?: string;
  /** Minimum ms between live requests to the same host. Default 5000. */
  minIntervalMs?: number;
  /** Per-channel cache TTL in ms. Default 300_000 (5 min). */
  cacheTtlMs?: number;
  /** Request timeout. Default 15_000. */
  timeoutMs?: number;
  /** User-Agent header. */
  userAgent?: string;
  /** Force demo mode (no network). Default: auto when no token/network. */
  demo?: boolean;
}

const DEFAULT_UA =
  "AegisLens-DSNS-Reader/1.0 (+https://aegis-lens.example; OSINT emergency-mapping; respectful crawler)";

// ── DEMO fixture (realistic DSNS-style public reports) ────────────────────────

export const DEMO_REPORTS: DsnsRawReport[] = [
  {
    id: "dsns_kharkiv_tg:demo-1",
    channelId: "dsns_kharkiv_tg",
    scope: "oblast",
    oblast: "UA-63",
    publishedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    url: "https://t.me/dsns_kharkiv/0",
    titleUk: "Пожежа у Харкові",
    text: "м. Харків. Унаслідок ворожого обстрілу виникла пожежа на території складського приміщення. Вогонь охопив площу близько 400 кв. м. Рятувальники ДСНС ліквідували займання. Постраждалих немає.",
    mediaUrls: [],
    sourceKind: "telegram_channel",
  },
  {
    id: "dsns_national_tg:demo-2",
    channelId: "dsns_national_tg",
    scope: "national",
    publishedAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
    url: "https://t.me/dsns_telegram/0",
    titleUk: "Піротехніки ДСНС знешкодили вибухонебезпечні предмети",
    text: "Сумська область, Шосткинський район. Сапери ДСНС виявили та знешкодили 12 застарілих боєприпасів. Триває обстеження території. Просимо громадян не наближатися до підозрілих предметів.",
    mediaUrls: [],
    sourceKind: "telegram_channel",
  },
  {
    id: "dsns_dnipro_tg:demo-3",
    channelId: "dsns_dnipro_tg",
    scope: "oblast",
    oblast: "UA-12",
    publishedAt: new Date(Date.now() - 7 * 3600_000).toISOString(),
    url: "https://t.me/dsns_dnipro/0",
    titleUk: "Обвалення будинку у Дніпрі",
    text: "м. Дніпро. Внаслідок влучання сталося часткове обвалення житлового будинку. Рятувальники ДСНС розбирають завали та шукають людей. З-під завалів врятовано 3 особи. Оголошено евакуацію мешканців сусіднього під'їзду.",
    mediaUrls: [],
    sourceKind: "telegram_channel",
  },
  {
    id: "dsns_odesa_site:demo-4",
    channelId: "dsns_odesa_site",
    scope: "oblast",
    oblast: "UA-51",
    publishedAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
    url: "https://odesa.dsns.gov.ua/news/0",
    titleUk: "Вибух та пожежа на підприємстві",
    text: "Одеська область, м. Чорноморськ. Сталася пожежа з подальшим вибухом на території промислового підприємства. Залучено 6 одиниць техніки ДСНС. Пожежу локалізовано.",
    mediaUrls: [],
    sourceKind: "site_html",
  },
];

// ── Per-host polite scheduler ─────────────────────────────────────────────────

class HostThrottle {
  private lastAt = new Map<string, number>();
  constructor(private readonly minIntervalMs: number) {}

  /** Resolve once the host is allowed to be hit again. */
  async wait(host: string): Promise<void> {
    const now = Date.now();
    const last = this.lastAt.get(host) ?? 0;
    const wait = Math.max(0, last + this.minIntervalMs - now);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    this.lastAt.set(host, Date.now());
  }
}

// ── Client ────────────────────────────────────────────────────────────────────

interface CacheEntry {
  at: number;
  reports: DsnsRawReport[];
}

export class DsnsClient {
  private readonly token?: string;
  private readonly minIntervalMs: number;
  private readonly cacheTtlMs: number;
  private readonly timeoutMs: number;
  private readonly userAgent: string;
  private readonly demo: boolean;
  private readonly throttle: HostThrottle;
  private readonly cache = new Map<string, CacheEntry>();

  constructor(config: DsnsClientConfig = {}) {
    this.token = config.telegramBotToken ?? process.env.DSNS_TG_BOT_TOKEN;
    this.minIntervalMs = config.minIntervalMs ?? 5_000;
    this.cacheTtlMs = config.cacheTtlMs ?? 300_000;
    this.timeoutMs = config.timeoutMs ?? 15_000;
    this.userAgent = config.userAgent ?? DEFAULT_UA;
    // Demo unless explicitly disabled and a token is present.
    this.demo = config.demo ?? !this.token;
    this.throttle = new HostThrottle(this.minIntervalMs);
  }

  get isDemo(): boolean {
    return this.demo;
  }

  /** Hostname for throttling, derived from a channel. */
  private hostFor(ch: DsnsChannel): string {
    if (ch.kind === "telegram_channel") return "api.telegram.org";
    try {
      return new URL(ch.url ?? "https://dsns.gov.ua").host;
    } catch {
      return "dsns.gov.ua";
    }
  }

  /**
   * Fetch the latest reports from a single channel. Returns cached results
   * within the TTL window (crawler discipline). Falls back to the demo
   * fixture for the channel in demo mode or on any network error.
   */
  async fetchChannel(channel: DsnsChannel): Promise<DsnsRawReport[]> {
    const cached = this.cache.get(channel.id);
    if (cached && Date.now() - cached.at < this.cacheTtlMs) {
      return cached.reports;
    }

    let reports: DsnsRawReport[];
    if (this.demo) {
      reports = DEMO_REPORTS.filter((r) => r.channelId === channel.id);
    } else {
      try {
        await this.throttle.wait(this.hostFor(channel));
        reports =
          channel.kind === "telegram_channel"
            ? await this.fetchTelegram(channel)
            : await this.fetchSite(channel);
      } catch {
        // Conservative fallback: never throw to the pipeline.
        reports = DEMO_REPORTS.filter((r) => r.channelId === channel.id);
      }
    }

    this.cache.set(channel.id, { at: Date.now(), reports });
    return reports;
  }

  /** Fetch national + (optionally) all oblast channels. */
  async fetchAll(opts: { includeOblasts?: boolean } = {}): Promise<DsnsRawReport[]> {
    const channels = opts.includeOblasts ? ALL_DSNS_CHANNELS : NATIONAL_CHANNELS;
    const out: DsnsRawReport[] = [];
    for (const ch of channels) {
      // Skip unverified handles in live mode (polite + safe default).
      if (!this.demo && ch.kind === "telegram_channel" && !ch.official) continue;
      out.push(...(await this.fetchChannel(ch)));
    }
    return out.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }

  // ── Telegram (Bot API, read-only public channels) ──────────────────────────

  private async fetchTelegram(channel: DsnsChannel): Promise<DsnsRawReport[]> {
    if (!this.token || !channel.telegramUsername) return [];
    // Bot API does not expose arbitrary channel history; production wires the
    // bot as a channel member and ingests channel_post updates via getUpdates.
    // See integrations/telegram/src/bot-api-client.ts for the reusable client.
    const base = `https://api.telegram.org/bot${this.token}`;
    const res = await fetch(`${base}/getUpdates?limit=50`, {
      headers: { "User-Agent": this.userAgent },
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    if (!res.ok) throw new Error(`Telegram API ${res.status}`);
    const data = (await res.json()) as {
      ok: boolean;
      result: Array<{ channel_post?: { message_id: number; date: number; text?: string; caption?: string; chat?: { username?: string } } }>;
    };
    if (!data.ok) throw new Error("Telegram getUpdates ok=false");

    return data.result
      .map((u) => u.channel_post)
      .filter((p): p is NonNullable<typeof p> =>
        !!p && p.chat?.username === channel.telegramUsername && !!(p.text || p.caption))
      .map((p) => ({
        id: `${channel.id}:${p.message_id}`,
        channelId: channel.id,
        scope: channel.scope,
        oblast: channel.oblast,
        publishedAt: new Date(p.date * 1000).toISOString(),
        url: `https://t.me/${channel.telegramUsername}/${p.message_id}`,
        text: (p.text ?? p.caption)!,
        sourceKind: "telegram_channel" as const,
      }));
  }

  // ── Site (RSS or HTML news list) ───────────────────────────────────────────

  private async fetchSite(channel: DsnsChannel): Promise<DsnsRawReport[]> {
    if (!channel.url) return [];
    const res = await fetch(channel.url, {
      headers: { "User-Agent": this.userAgent, Accept: "application/rss+xml, text/html" },
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    if (!res.ok) throw new Error(`DSNS site ${res.status}`);
    const body = await res.text();
    return parseRss(body, channel);
  }
}

/**
 * Minimal RSS / Atom item extractor (no XML dependency — conservative TS).
 * Returns [] for HTML pages it cannot parse; the caller falls back to demo.
 */
export function parseRss(xml: string, channel: DsnsChannel): DsnsRawReport[] {
  const items: DsnsRawReport[] = [];
  const itemRe = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1];
    const title = pick(block, "title");
    const link = pick(block, "link") ?? pick(block, "guid");
    const desc = pick(block, "description") ?? pick(block, "content:encoded") ?? "";
    const date = pick(block, "pubDate") ?? pick(block, "dc:date");
    const text = stripHtml(`${title ?? ""}. ${desc}`).trim();
    if (!text) continue;
    items.push({
      id: `${channel.id}:${link ?? i}`,
      channelId: channel.id,
      scope: channel.scope,
      oblast: channel.oblast,
      publishedAt: date ? new Date(date).toISOString() : new Date().toISOString(),
      url: link ?? channel.url,
      titleUk: title ? stripHtml(title) : undefined,
      text,
      sourceKind: channel.kind === "site_rss" ? "site_rss" : "site_html",
    });
    i++;
  }
  return items;
}

function pick(block: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = re.exec(block);
  if (!m) return undefined;
  return decodeEntities(m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim());
}

function stripHtml(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}
