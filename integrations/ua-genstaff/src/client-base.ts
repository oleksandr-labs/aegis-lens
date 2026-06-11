/**
 * Shared base for the official-source clients.
 *
 * All four source clients (General Staff, MoD, Air Force, Navy) share the same
 * ToS-respecting discipline (see COMPLIANCE.md):
 *   - Polite per-host rate limit (default 5s) + per-channel cache TTL (5 min).
 *   - Descriptive User-Agent so the authority can identify the reader.
 *   - Telegram access is Bot API only, public channels, read-only.
 *   - Facebook / site access reads PUBLIC press output only; no login scraping.
 *   - Secrets come from process.env, never hardcoded.
 *   - Any network/parse error falls back to the demo fixture; never throws.
 */

import type { RawOfficialPost, SourceChannel } from "./types";

export const DEFAULT_UA =
  "AegisLens-OfficialMil-Reader/1.0 (+https://aegis-lens.example; OSINT mapping of official UA military comms; respectful crawler)";

export interface BaseClientConfig {
  /** Telegram bot token (read from process.env if absent). */
  telegramBotToken?: string;
  /** Minimum ms between live requests to the same host. Default 5000. */
  minIntervalMs?: number;
  /** Per-channel cache TTL in ms. Default 300_000 (5 min). */
  cacheTtlMs?: number;
  /** Request timeout. Default 15_000. */
  timeoutMs?: number;
  userAgent?: string;
  /** Force demo mode (no network). Default: auto when no token/network. */
  demo?: boolean;
}

/** Per-host polite scheduler (one live request per minIntervalMs per host). */
export class HostThrottle {
  private lastAt = new Map<string, number>();
  constructor(private readonly minIntervalMs: number) {}
  async wait(host: string): Promise<void> {
    const now = Date.now();
    const last = this.lastAt.get(host) ?? 0;
    const wait = Math.max(0, last + this.minIntervalMs - now);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    this.lastAt.set(host, Date.now());
  }
}

interface CacheEntry {
  at: number;
  posts: RawOfficialPost[];
}

/**
 * Abstract base client: caching, throttling, demo fallback, and a Telegram
 * Bot-API fetch path shared by all sources. Subclasses provide their demo
 * fixture and any non-Telegram fetch (site/Facebook).
 */
export abstract class BaseOfficialClient {
  protected readonly token?: string;
  protected readonly minIntervalMs: number;
  protected readonly cacheTtlMs: number;
  protected readonly timeoutMs: number;
  protected readonly userAgent: string;
  protected readonly demo: boolean;
  protected readonly throttle: HostThrottle;
  private readonly cache = new Map<string, CacheEntry>();

  /** Bot token env var name (subclass passes its dedicated var via super()). */
  protected readonly tokenEnvVar: string;

  /**
   * @param tokenEnvVar Per-branch token env var name. Passed by the subclass
   *   constructor so it is available HERE (subclass field initialisers run
   *   AFTER super(), so a field default would not be set in time).
   */
  constructor(config: BaseClientConfig = {}, tokenEnvVar = "UA_MIL_TG_BOT_TOKEN") {
    this.tokenEnvVar = tokenEnvVar;
    this.token = config.telegramBotToken ?? process.env[tokenEnvVar] ?? process.env.UA_MIL_TG_BOT_TOKEN;
    this.minIntervalMs = config.minIntervalMs ?? 5_000;
    this.cacheTtlMs = config.cacheTtlMs ?? 300_000;
    this.timeoutMs = config.timeoutMs ?? 15_000;
    this.userAgent = config.userAgent ?? DEFAULT_UA;
    this.demo = config.demo ?? !this.token;
    this.throttle = new HostThrottle(this.minIntervalMs);
  }

  get isDemo(): boolean {
    return this.demo;
  }

  /** Subclass: demo fixture for a given channel. */
  protected abstract demoFor(channel: SourceChannel): RawOfficialPost[];

  /** Subclass: fetch a non-Telegram channel (site / Facebook). Default: []. */
  protected async fetchNonTelegram(_channel: SourceChannel): Promise<RawOfficialPost[]> {
    return [];
  }

  protected hostFor(ch: SourceChannel): string {
    if (ch.kind === "telegram_channel") return "api.telegram.org";
    if (ch.kind === "facebook_page") return "www.facebook.com";
    try {
      return new URL(ch.url ?? "https://example.gov.ua").host;
    } catch {
      return "example.gov.ua";
    }
  }

  /** Fetch the latest posts for one channel (cached, demo-safe, never throws). */
  async fetchChannel(channel: SourceChannel): Promise<RawOfficialPost[]> {
    const cached = this.cache.get(channel.id);
    if (cached && Date.now() - cached.at < this.cacheTtlMs) return cached.posts;

    let posts: RawOfficialPost[];
    if (this.demo) {
      posts = this.demoFor(channel);
    } else {
      try {
        await this.throttle.wait(this.hostFor(channel));
        posts =
          channel.kind === "telegram_channel"
            ? await this.fetchTelegram(channel)
            : await this.fetchNonTelegram(channel);
      } catch {
        posts = this.demoFor(channel);
      }
    }

    this.cache.set(channel.id, { at: Date.now(), posts });
    return posts;
  }

  /** Telegram Bot API (read-only, public channels). */
  protected async fetchTelegram(channel: SourceChannel): Promise<RawOfficialPost[]> {
    if (!this.token || !channel.telegramUsername) return [];
    const base = `https://api.telegram.org/bot${this.token}`;
    const res = await fetch(`${base}/getUpdates?limit=50`, {
      headers: { "User-Agent": this.userAgent },
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    if (!res.ok) throw new Error(`Telegram API ${res.status}`);
    const data = (await res.json()) as {
      ok: boolean;
      result: Array<{
        channel_post?: {
          message_id: number;
          date: number;
          text?: string;
          caption?: string;
          chat?: { username?: string };
        };
      }>;
    };
    if (!data.ok) throw new Error("Telegram getUpdates ok=false");

    return data.result
      .map((u) => u.channel_post)
      .filter(
        (p): p is NonNullable<typeof p> =>
          !!p && p.chat?.username === channel.telegramUsername && !!(p.text || p.caption),
      )
      .map((p) => this.mapTelegramPost(channel, p.message_id, p.date, (p.text ?? p.caption)!));
  }

  /** Subclass decides commKind from channel/branch; default heuristic here. */
  protected abstract mapTelegramPost(
    channel: SourceChannel,
    messageId: number,
    unixDate: number,
    text: string,
  ): RawOfficialPost;
}

// ── Minimal RSS / HTML item extractor (shared, no XML dependency) ──────────────

export function parseRssItems(
  xml: string,
  channel: SourceChannel,
  commKind: RawOfficialPost["commKind"],
): RawOfficialPost[] {
  const items: RawOfficialPost[] = [];
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
      branch: channel.branch,
      commKind,
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

export function stripHtml(s: string): string {
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
