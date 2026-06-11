/**
 * Bounded, resumable historical backfill for newly-added channels.
 *
 * When a channel is added to `registry.ts`, the live poller only sees NEW posts.
 * To populate recent history we walk backwards through `IMTProtoClient.getHistory`
 * (Bot API cannot expose full history). The walk is **bounded** on two axes —
 * `maxMessages` and `maxAgeDays` — and **resumable** via an opaque `BackfillCursor`
 * (the lowest message id seen so far), so a crash/flood-wait pause resumes mid-run
 * instead of restarting. All reads go through the rate-limited MTProto client, so
 * flood-wait discipline is inherited (see `mtproto-client.ts` / `COMPLIANCE.md`).
 */

import type { IMTProtoClient, HistoryQuery } from "./mtproto-client";
import type { TelegramMessage } from "./bot-api-client";

export interface BackfillBounds {
  /** Hard cap on total messages fetched across the whole run. */
  maxMessages: number;
  /** Do not fetch posts older than this many days. */
  maxAgeDays: number;
  /** Page size per getHistory call (server-capped to 100 by the client). */
  pageSize?: number;
}

export const DEFAULT_BACKFILL_BOUNDS: BackfillBounds = {
  maxMessages: 500,
  maxAgeDays: 7,
  pageSize: 100,
};

/** Opaque, serialisable resume point. Persist this between runs. */
export interface BackfillCursor {
  channel: string;
  /** Lowest (oldest) message id fetched so far; next page is `offsetId = this`. */
  lowestId: number;
  /** Running total fetched — counts against `maxMessages`. */
  fetched: number;
  /** True once a bound was hit and there is nothing more to do. */
  done: boolean;
}

export interface BackfillPage {
  messages: TelegramMessage[];
  cursor: BackfillCursor;
  /** Why we stopped, when the run completed this page. */
  stopReason?: "max_messages" | "max_age" | "channel_exhausted";
}

export class Backfiller {
  constructor(private readonly client: IMTProtoClient) {}

  /** Fresh cursor for a channel that has never been backfilled. */
  static start(channel: string): BackfillCursor {
    return { channel: channel.replace(/^@/, ""), lowestId: 0, fetched: 0, done: false };
  }

  /**
   * Fetch ONE bounded page and advance the cursor. Callers loop on this until
   * `cursor.done`, persisting the cursor after each page (resumable). Pulling a
   * single page per call keeps backpressure and persistence in the caller's hands.
   */
  async step(cursor: BackfillCursor, bounds: BackfillBounds = DEFAULT_BACKFILL_BOUNDS): Promise<BackfillPage> {
    if (cursor.done) return { messages: [], cursor, stopReason: "channel_exhausted" };

    const remaining = bounds.maxMessages - cursor.fetched;
    if (remaining <= 0) {
      return { messages: [], cursor: { ...cursor, done: true }, stopReason: "max_messages" };
    }

    const ageFloorSec = Math.floor(Date.now() / 1000) - bounds.maxAgeDays * 86_400;
    const limit = Math.min(bounds.pageSize ?? 100, 100, remaining);

    const query: HistoryQuery = {
      channel: cursor.channel,
      limit,
      offsetId: cursor.lowestId || undefined, // backwards paging; 0 → newest
    };
    const page = await this.client.getHistory(query);

    if (page.length === 0) {
      return { messages: [], cursor: { ...cursor, done: true }, stopReason: "channel_exhausted" };
    }

    // getHistory returns newest-first; keep only posts within the age window.
    const kept: TelegramMessage[] = [];
    let hitAge = false;
    let lowestId = cursor.lowestId || Number.MAX_SAFE_INTEGER;
    for (const m of page) {
      if (m.date < ageFloorSec) {
        hitAge = true;
        continue; // too old — and everything beyond it is older still
      }
      kept.push(m);
      if (m.message_id < lowestId) lowestId = m.message_id;
    }

    const fetched = cursor.fetched + kept.length;
    const exhausted = page.length < limit;
    const hitMax = fetched >= bounds.maxMessages;
    const done = hitAge || exhausted || hitMax;

    const next: BackfillCursor = {
      channel: cursor.channel,
      lowestId: lowestId === Number.MAX_SAFE_INTEGER ? cursor.lowestId : lowestId,
      fetched,
      done,
    };

    const stopReason = done
      ? hitAge
        ? "max_age"
        : hitMax
          ? "max_messages"
          : "channel_exhausted"
      : undefined;

    return { messages: kept, cursor: next, stopReason };
  }

  /**
   * Convenience driver: run the whole bounded backfill, yielding each page.
   * Persist `page.cursor` on every iteration so an interruption is resumable.
   */
  async *run(channel: string, bounds: BackfillBounds = DEFAULT_BACKFILL_BOUNDS, resume?: BackfillCursor): AsyncGenerator<BackfillPage> {
    let cursor = resume ?? Backfiller.start(channel);
    while (!cursor.done) {
      const page = await this.step(cursor, bounds);
      cursor = page.cursor;
      if (page.messages.length > 0 || page.stopReason) yield page;
      if (page.stopReason) break;
    }
  }
}
