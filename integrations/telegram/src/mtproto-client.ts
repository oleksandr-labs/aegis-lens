/**
 * MTProto client contract for Telegram userbot-tier ingestion.
 *
 * The Bot API (`bot-api-client.ts`) cannot read full public-channel history,
 * member counts, or large media for channels the bot has not been added to.
 * For those gaps we use an MTProto **userbot** session (gramjs in Node, or a
 * telethon sidecar in Python). MTProto userbot use is permitted by Telegram ToS
 * ONLY for *public* channels, read-only, with a real account and conservative
 * rate limits — see `COMPLIANCE.md`.
 *
 * This file is a **codeable contract**: a typed interface that wraps a
 * gramjs/telethon-style API plus a strict rate-limit / flood-wait discipline
 * (`RateLimiter`) and an in-memory `DemoMTProtoClient` baseline so the pipeline
 * is exercisable offline. We deliberately take NO dependency on `gramjs`/
 * `telegram` here — the real adapter (`MTProtoClient`) is injected at runtime
 * and must satisfy `IMTProtoClient`.
 *
 * NEVER hardcode the API id/hash or session string — read them from:
 *   process.env.TELEGRAM_API_ID
 *   process.env.TELEGRAM_API_HASH
 *   process.env.TELEGRAM_SESSION   (StringSession; encrypted at rest)
 */

import type { TelegramMessage } from "./bot-api-client";

/** Credentials for an MTProto session. Read from env; never hardcode. */
export interface MTProtoCredentials {
  apiId: number;
  apiHash: string;
  /** Serialised StringSession for an authorised account. */
  session: string;
}

export interface HistoryQuery {
  /** Channel @username (without @) or numeric peer id. */
  channel: string;
  /** Max messages to return this call. Hard-capped to `limit ≤ 100`. */
  limit?: number;
  /** Return messages with id < offsetId (paging backwards through history). */
  offsetId?: number;
  /** Return messages with id > minId (stop boundary for bounded backfill). */
  minId?: number;
}

export interface ChannelInfo {
  id: number;
  username?: string;
  title: string;
  participantsCount?: number;
  /** True only for public broadcast channels we are allowed to read. */
  isPublic: boolean;
}

/**
 * The minimal MTProto surface Aegis needs. A real implementation wraps
 * gramjs `TelegramClient` (or a telethon sidecar) and maps its message objects
 * onto the Bot-API-shaped `TelegramMessage` used everywhere else in this
 * package, so downstream adapters need no second message type.
 */
export interface IMTProtoClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  resolveChannel(usernameOrId: string): Promise<ChannelInfo>;
  /** Read a page of public-channel history (read-only). */
  getHistory(query: HistoryQuery): Promise<TelegramMessage[]>;
}

/**
 * FloodWaitError is what gramjs/telethon raise when the server demands a pause.
 * The discipline below treats `seconds` as authoritative — we never retry sooner.
 */
export class FloodWaitError extends Error {
  constructor(public readonly seconds: number) {
    super(`FLOOD_WAIT_${seconds}`);
    this.name = "FloodWaitError";
  }
}

export interface RateLimiterOptions {
  /** Minimum spacing between any two requests (ms). Telegram-polite default 1 s. */
  minIntervalMs?: number;
  /** Max requests inside the rolling window. */
  maxPerWindow?: number;
  /** Rolling window length (ms). Default 60 s. */
  windowMs?: number;
  /** Absolute ceiling on a single observed flood-wait we will honour (ms). */
  maxFloodWaitMs?: number;
  /** Injected sleeper (testability). */
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
}

/**
 * Token-bucket + flood-wait discipline. Every MTProto call MUST pass through
 * `schedule()`. On a server-side FLOOD_WAIT the limiter parks ALL traffic for
 * the demanded interval (`honourFloodWait`) — we never race the server.
 */
export class RateLimiter {
  private readonly minIntervalMs: number;
  private readonly maxPerWindow: number;
  private readonly windowMs: number;
  private readonly maxFloodWaitMs: number;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly now: () => number;

  private lastCallAt = 0;
  private windowStart = 0;
  private windowCount = 0;
  /** Wall-clock until which all traffic is parked by a flood-wait. */
  private parkedUntil = 0;
  /** Serialises schedule() so spacing/flood-wait apply across concurrency. */
  private chain: Promise<unknown> = Promise.resolve();

  constructor(opts: RateLimiterOptions = {}) {
    this.minIntervalMs = opts.minIntervalMs ?? 1_000;
    this.maxPerWindow = opts.maxPerWindow ?? 20;
    this.windowMs = opts.windowMs ?? 60_000;
    this.maxFloodWaitMs = opts.maxFloodWaitMs ?? 5 * 60_000;
    this.sleep = opts.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
    this.now = opts.now ?? Date.now;
  }

  /**
   * Run `fn` under the limiter. Honours min-spacing + rolling window before the
   * call, and on FloodWaitError parks and retries once (bounded by maxFloodWaitMs).
   */
  schedule<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.chain.then(() => this.runGuarded(fn));
    // Keep the chain alive regardless of this call's outcome.
    this.chain = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  private async runGuarded<T>(fn: () => Promise<T>): Promise<T> {
    await this.gate();
    try {
      return await fn();
    } catch (err) {
      if (err instanceof FloodWaitError) {
        await this.honourFloodWait(err.seconds);
        await this.gate();
        return await fn();
      }
      throw err;
    }
  }

  /** Apply parking, min-interval spacing, and the rolling-window cap. */
  private async gate(): Promise<void> {
    const parkRemaining = this.parkedUntil - this.now();
    if (parkRemaining > 0) await this.sleep(parkRemaining);

    const sinceLast = this.now() - this.lastCallAt;
    if (this.lastCallAt && sinceLast < this.minIntervalMs) {
      await this.sleep(this.minIntervalMs - sinceLast);
    }

    if (this.now() - this.windowStart >= this.windowMs) {
      this.windowStart = this.now();
      this.windowCount = 0;
    }
    if (this.windowCount >= this.maxPerWindow) {
      const wait = this.windowStart + this.windowMs - this.now();
      if (wait > 0) await this.sleep(wait);
      this.windowStart = this.now();
      this.windowCount = 0;
    }

    this.windowCount += 1;
    this.lastCallAt = this.now();
  }

  /** Park the whole limiter for the server-demanded interval. */
  private async honourFloodWait(seconds: number): Promise<void> {
    const ms = Math.min(seconds * 1_000, this.maxFloodWaitMs);
    this.parkedUntil = this.now() + ms;
    await this.sleep(ms);
  }
}

/**
 * Rate-limited decorator: wraps any `IMTProtoClient` so every network call is
 * scheduled through one `RateLimiter`. This is the object the rest of Aegis
 * should hold — never the raw gramjs client.
 */
export class RateLimitedMTProtoClient implements IMTProtoClient {
  constructor(
    private readonly inner: IMTProtoClient,
    private readonly limiter: RateLimiter = new RateLimiter(),
  ) {}

  connect(): Promise<void> {
    return this.limiter.schedule(() => this.inner.connect());
  }
  disconnect(): Promise<void> {
    return this.inner.disconnect();
  }
  resolveChannel(usernameOrId: string): Promise<ChannelInfo> {
    return this.limiter.schedule(() => this.inner.resolveChannel(usernameOrId));
  }
  getHistory(query: HistoryQuery): Promise<TelegramMessage[]> {
    const limit = Math.min(query.limit ?? 100, 100);
    return this.limiter.schedule(() => this.inner.getHistory({ ...query, limit }));
  }
}

/**
 * Offline baseline used in tests / demo mode. Serves messages from an in-memory
 * fixture and honours `offsetId`/`minId`/`limit` paging exactly like the real
 * server, so backfill logic can be exercised without credentials or network.
 */
export class DemoMTProtoClient implements IMTProtoClient {
  constructor(
    private readonly fixtures: Record<string, TelegramMessage[]> = {},
  ) {}

  async connect(): Promise<void> {}
  async disconnect(): Promise<void> {}

  async resolveChannel(usernameOrId: string): Promise<ChannelInfo> {
    const username = usernameOrId.replace(/^@/, "");
    return { id: hashId(username), username, title: username, isPublic: true };
  }

  async getHistory(query: HistoryQuery): Promise<TelegramMessage[]> {
    const username = query.channel.replace(/^@/, "");
    const all = [...(this.fixtures[username] ?? [])].sort((a, b) => b.message_id - a.message_id);
    const limit = Math.min(query.limit ?? 100, 100);
    return all
      .filter((m) => (query.offsetId ? m.message_id < query.offsetId : true))
      .filter((m) => (query.minId ? m.message_id > query.minId : true))
      .slice(0, limit);
  }
}

function hashId(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Construct the production client from env, with a `RateLimiter` wrapper.
 * The actual gramjs adapter is injected (`makeInner`) to keep the hard
 * dependency out of this package; absent credentials we fall back to demo mode.
 */
export function createMTProtoClient(opts?: {
  makeInner?: (creds: MTProtoCredentials) => IMTProtoClient;
  limiter?: RateLimiter;
  env?: NodeJS.ProcessEnv;
}): IMTProtoClient {
  const env = opts?.env ?? process.env;
  const apiId = Number(env.TELEGRAM_API_ID);
  const apiHash = env.TELEGRAM_API_HASH;
  const session = env.TELEGRAM_SESSION;

  if (opts?.makeInner && apiId && apiHash && session) {
    const inner = opts.makeInner({ apiId, apiHash, session });
    return new RateLimitedMTProtoClient(inner, opts.limiter);
  }
  // No creds (or no real adapter wired) → offline-safe demo client.
  return new RateLimitedMTProtoClient(new DemoMTProtoClient(), opts?.limiter);
}
