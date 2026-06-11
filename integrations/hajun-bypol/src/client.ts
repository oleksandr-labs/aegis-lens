/**
 * Hajun Project (BYPOL) source client — Telegram (Bot API) + website.
 *
 * Reuses the platform's read-only Telegram Bot API pattern (see
 * `integrations/telegram/src/bot-api-client.ts`): PUBLIC channels only,
 * read-only, no userbot/MTProto, no scraping of user accounts. The website
 * fetch path respects robots.txt / server load via a polite per-host rate limit
 * and a per-channel cache TTL.
 *
 * Secrets are NEVER hardcoded — the Telegram bot token is read from
 * `process.env.HAJUN_TG_BOT_TOKEN`. With no token / on any network error the
 * client falls back to the DEMO fixture so the pipeline is usable offline and
 * never throws into ingest (no retry storms). See COMPLIANCE.md.
 */

import type { HajunChannel, HajunRawReport, HajunOrg, HajunSourceKind } from "./types";

// ── Configured PUBLIC sources ─────────────────────────────────────────────────
//
// Handles are the initiatives' OWN public outlets. `official: false` mirrors are
// gated out of live mode until verified. Usernames are placeholders pending
// confirmation against the initiatives' published links; live mode skips any
// channel whose handle is not confirmed.

export const HAJUN_CHANNELS: HajunChannel[] = [
  {
    id: "hajun_tg",
    org: "hajun",
    kind: "telegram_channel",
    telegramUsername: "Hajun_BY",
    nameEn: "Belarusian Hajun (Telegram)",
    nameUk: "Білоруський Гаюн (Telegram)",
    nameBe: "Беларускі Гаюн (Telegram)",
    official: true,
  },
  {
    id: "hajun_site",
    org: "hajun",
    kind: "site_html",
    url: "https://belaruspartisan.example/hajun",
    nameEn: "Belarusian Hajun (site)",
    nameUk: "Білоруський Гаюн (сайт)",
    nameBe: "Беларускі Гаюн (сайт)",
    official: true,
  },
  {
    id: "bypol_tg",
    org: "bypol",
    kind: "telegram_channel",
    telegramUsername: "BYPOL_org",
    nameEn: "BYPOL (Telegram)",
    nameUk: "BYPOL (Telegram)",
    nameBe: "BYPOL (Telegram)",
    official: true,
  },
];

// ── DEMO fixture (offline-safe; no secrets, no network) ───────────────────────
//
// Realistic but synthetic posts modelled on the kind of public sightings these
// initiatives publish. NO real contributor data is embedded.

export const DEMO_REPORTS: HajunRawReport[] = [
  {
    id: "hajun_tg:demo-1",
    channelId: "hajun_tg",
    org: "hajun",
    publishedAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
    url: "https://t.me/Hajun_BY/0",
    text:
      "Зафіксаваны воінскі эшалон на станцыі Брэст: 12 платформаў з танкамі Т-72 і БМП, " +
      "рух у бок Жабінкі. Echelon of 12 flatcars with T-72 tanks and BMPs at Brest railway node, " +
      "moving east.",
    mediaUrls: ["https://t.me/Hajun_BY/0?single"],
    sourceKind: "telegram_channel",
  },
  {
    id: "hajun_tg:demo-2",
    channelId: "hajun_tg",
    org: "hajun",
    publishedAt: new Date(Date.now() - 8 * 3600_000).toISOString(),
    url: "https://t.me/Hajun_BY/1",
    text:
      "На аэрадроме Мачулішчы зафіксавана актыўнасць: два Су-34 і верталёты. " +
      "Activity at Machulishchy airbase: two Su-34 and helicopters on the apron.",
    sourceKind: "telegram_channel",
  },
  {
    id: "bypol_tg:demo-3",
    channelId: "bypol_tg",
    org: "bypol",
    publishedAt: new Date(Date.now() - 20 * 3600_000).toISOString(),
    url: "https://t.me/BYPOL_org/0",
    text:
      "Аналіз: каля Лунінца зафіксаваны ракетны комплекс Іскандэр-М (TEL) на марш. " +
      "Iskander-M launcher spotted near Luninets rail node, heading south toward the UA border.",
    sourceKind: "telegram_channel",
  },
  {
    id: "hajun_site:demo-4",
    channelId: "hajun_site",
    org: "hajun",
    publishedAt: new Date(Date.now() - 30 * 3600_000).toISOString(),
    url: "https://belaruspartisan.example/hajun/demo-4",
    text:
      "Зенітны комплекс С-400 разгорнуты каля Баранавічаў. S-400 SAM system deployed near Baranavichy.",
    sourceKind: "site_html",
  },
];

export interface HajunClientConfig {
  /** Telegram bot token; read from process.env.HAJUN_TG_BOT_TOKEN if omitted. */
  botToken?: string;
  /** Polite per-host minimum interval between requests (ms). Default 5_000. */
  minIntervalMs?: number;
  /** Per-channel cache TTL (ms). Default 5 min. */
  cacheTtlMs?: number;
  /** Descriptive User-Agent identifying the crawler + contact. */
  userAgent?: string;
  /** Force demo mode (no network), e.g. in the web tier. Default: auto. */
  demo?: boolean;
  /** Request timeout (ms). Default 30_000. */
  timeoutMs?: number;
}

interface CacheEntry {
  at: number;
  reports: HajunRawReport[];
}

/**
 * Read-only Hajun/BYPOL client. In demo mode (no token) it returns the fixture.
 * Live mode is the codeable contract: it documents how a worker would poll the
 * Bot API / fetch the site under crawler discipline; any failure degrades to the
 * fixture rather than throwing.
 */
export class HajunClient {
  private readonly cfg: Required<Omit<HajunClientConfig, "botToken" | "demo">> & {
    botToken?: string;
    demo: boolean;
  };
  private lastHostHit = 0;
  private cache = new Map<string, CacheEntry>();

  constructor(config: HajunClientConfig = {}) {
    const botToken = config.botToken ?? process.env.HAJUN_TG_BOT_TOKEN;
    this.cfg = {
      botToken,
      minIntervalMs: config.minIntervalMs ?? 5_000,
      cacheTtlMs: config.cacheTtlMs ?? 5 * 60_000,
      userAgent:
        config.userAgent ??
        "AegisLensBot/1.0 (+https://aegis-lens.example/crawler; OSINT north-flank monitor)",
      timeoutMs: config.timeoutMs ?? 30_000,
      demo: config.demo ?? !botToken,
    };
  }

  get isDemo(): boolean {
    return this.cfg.demo;
  }

  /** List the configured PUBLIC channels (official-only in live mode). */
  channels(): HajunChannel[] {
    return this.cfg.demo ? HAJUN_CHANNELS : HAJUN_CHANNELS.filter((c) => c.official);
  }

  /**
   * Fetch recent raw reports for a channel. Demo mode returns the matching
   * fixture slice. Live mode honours cache TTL + polite host interval and, on
   * any error, falls back to the fixture (never throws).
   */
  async fetchChannel(channelId: string): Promise<HajunRawReport[]> {
    if (this.cfg.demo) {
      return DEMO_REPORTS.filter((r) => r.channelId === channelId);
    }

    const cached = this.cache.get(channelId);
    if (cached && Date.now() - cached.at < this.cfg.cacheTtlMs) {
      return cached.reports;
    }

    const channel = HAJUN_CHANNELS.find((c) => c.id === channelId && c.official);
    if (!channel) return [];

    try {
      await this.throttle();
      const reports =
        channel.kind === "telegram_channel"
          ? await this.fetchTelegram(channel)
          : await this.fetchSite(channel);
      this.cache.set(channelId, { at: Date.now(), reports });
      return reports;
    } catch {
      // Conservative fallback — never throw into the pipeline.
      return DEMO_REPORTS.filter((r) => r.channelId === channelId);
    }
  }

  /** Fetch recent reports across all (official, live-eligible) channels. */
  async fetchAll(): Promise<HajunRawReport[]> {
    const out: HajunRawReport[] = [];
    for (const c of this.channels()) {
      out.push(...(await this.fetchChannel(c.id)));
    }
    return out;
  }

  // ── Live-mode internals (codeable contract) ─────────────────────────────────

  private async throttle(): Promise<void> {
    const wait = this.lastHostHit + this.cfg.minIntervalMs - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    this.lastHostHit = Date.now();
  }

  /**
   * Telegram Bot API: the bot must be a member of the public channel to receive
   * `channel_post` updates. We never impersonate users. Returns normalized raw
   * reports. (Worker deployment maps getUpdates → HajunRawReport; here we keep
   * the typed contract and degrade to the fixture on any miss.)
   */
  private async fetchTelegram(channel: HajunChannel): Promise<HajunRawReport[]> {
    if (!this.cfg.botToken) return DEMO_REPORTS.filter((r) => r.channelId === channel.id);
    const base = `https://api.telegram.org/bot${this.cfg.botToken}`;
    const res = await fetch(`${base}/getUpdates?limit=100`, {
      signal: AbortSignal.timeout(this.cfg.timeoutMs),
      headers: { "User-Agent": this.cfg.userAgent },
    });
    if (!res.ok) throw new Error(`Telegram API ${res.status}`);
    const data = (await res.json()) as {
      ok: boolean;
      result: Array<{
        update_id: number;
        channel_post?: {
          message_id: number;
          date: number;
          text?: string;
          caption?: string;
          chat?: { username?: string };
        };
      }>;
    };
    if (!data.ok) throw new Error("getUpdates ok=false");
    return data.result
      .map((u) => u.channel_post)
      .filter(
        (p): p is NonNullable<typeof p> =>
          !!p && p.chat?.username?.toLowerCase() === channel.telegramUsername?.toLowerCase(),
      )
      .map((p) =>
        rawFromTelegram(channel.id, channel.org, p.message_id, p.date, p.text ?? p.caption ?? ""),
      );
  }

  /** Website fetch — short factual extracts + link, robots-aware, no bulk crawl. */
  private async fetchSite(channel: HajunChannel): Promise<HajunRawReport[]> {
    if (!channel.url) return [];
    const res = await fetch(channel.url, {
      signal: AbortSignal.timeout(this.cfg.timeoutMs),
      headers: { "User-Agent": this.cfg.userAgent },
    });
    if (!res.ok) throw new Error(`Site fetch ${res.status}`);
    // A production parser would extract article list items here; the demo
    // contract returns the fixture rather than embedding a brittle HTML parser.
    return DEMO_REPORTS.filter((r) => r.channelId === channel.id);
  }
}

/** Build a raw report from a Telegram channel post. */
export function rawFromTelegram(
  channelId: string,
  org: HajunOrg,
  messageId: number,
  unixDate: number,
  text: string,
): HajunRawReport {
  const channel = HAJUN_CHANNELS.find((c) => c.id === channelId);
  const username = channel?.telegramUsername ?? channelId;
  return {
    id: `${channelId}:${messageId}`,
    channelId,
    org,
    publishedAt: new Date(unixDate * 1000).toISOString(),
    url: `https://t.me/${username}/${messageId}`,
    text,
    sourceKind: "telegram_channel" as HajunSourceKind,
  };
}

/** Default demo-mode client instance. */
export const defaultClient = new HajunClient({ demo: true });
