/**
 * Task — Webhook / streaming for tracked accounts.
 *
 * X/Twitter API v2 offers a **filtered stream** (`/2/tweets/search/stream`) on
 * higher tiers, where rules select which tweets are pushed in real time. Lower
 * tiers have no streaming and must **poll** tracked accounts' timelines. This
 * module models BOTH:
 *   - a filtered-stream rule builder + consumer contract (for tiers that have it),
 *   - a poll-tracked-accounts scheduler that the existing `XApiClient` drives on
 *     Basic/Free tiers.
 *
 * The integration does not hold an open socket itself — the host runtime owns the
 * connection/worker; this module supplies the rules, the parse/normalise hook and
 * the polling plan so behaviour is identical across the two transports.
 */

import type { XApiClient, SearchOptions } from "./client";
import type { XTweet } from "./types";
import { ACCOUNT_REGISTRY } from "./registry";

// ── Filtered-stream rules (Pro/Enterprise tiers) ────────────────────────────

/** One filtered-stream rule (X v2 `value` + optional `tag`). */
export interface StreamRule {
  value: string;
  tag?: string;
}

/** X limits a single rule's length (512 chars on elevated tiers). */
export const MAX_RULE_LENGTH = 512;

/**
 * Build filtered-stream rules from the curated account registry. Tracked accounts
 * are OR'd into `from:` clauses, chunked to stay under the rule length limit.
 */
export function buildStreamRules(
  opts: { keywords?: string[]; usernames?: string[] } = {},
): StreamRule[] {
  const usernames = opts.usernames ?? ACCOUNT_REGISTRY.map((a) => a.username);
  const rules: StreamRule[] = [];

  // from:user OR from:user … chunks
  let clause: string[] = [];
  const flush = (tag: string) => {
    if (!clause.length) return;
    rules.push({ value: `(${clause.join(" OR ")}) -is:retweet`, tag });
    clause = [];
  };
  for (const u of usernames) {
    const next = `from:${u}`;
    const candidate = [...clause, next].join(" OR ");
    if (`(${candidate}) -is:retweet`.length > MAX_RULE_LENGTH) flush("tracked-accounts");
    clause.push(next);
  }
  flush("tracked-accounts");

  if (opts.keywords?.length) {
    const kw = opts.keywords.map((k) => `"${k}"`).join(" OR ");
    const value = `(${kw}) lang:uk OR lang:ru OR lang:en -is:retweet`;
    if (value.length <= MAX_RULE_LENGTH) rules.push({ value, tag: "keywords" });
  }

  return rules;
}

/** A parsed message off the filtered stream → canonical-ready payload. */
export interface StreamEvent {
  tweet: XTweet;
  matchingRules: string[];
  receivedAt: string;
}

/** Contract the host's stream worker implements (connect/disconnect owned there). */
export interface FilteredStreamConsumer {
  /** Replace the active rule set. */
  setRules(rules: StreamRule[]): Promise<void>;
  /** Async iterate stream events until the connection drops. */
  events(): AsyncGenerator<StreamEvent>;
}

// ── Poll fallback (Basic/Free tiers) ────────────────────────────────────────

export interface PollPlanItem {
  username: string;
  userId: string;
  /** Cursor: last seen tweet id for this account. */
  sinceId?: string;
}

/**
 * Poll-based "streaming": iterate tracked accounts, fetch new tweets since the
 * last cursor, and yield them. Cursors are owned by the caller (passed in/out)
 * so the scheduler stays stateless and testable.
 */
export class TrackedAccountPoller {
  constructor(
    private readonly client: XApiClient,
    private readonly maxResultsPerAccount = 10,
  ) {}

  /**
   * Fetch new tweets for one account; returns tweets + the new cursor.
   */
  async pollAccount(item: PollPlanItem): Promise<{ tweets: XTweet[]; newSinceId?: string }> {
    const { tweets, newestId } = await this.client.getUserTimeline({
      userId: item.userId,
      sinceId: item.sinceId,
      maxResults: this.maxResultsPerAccount,
    });
    return { tweets, newSinceId: newestId ?? item.sinceId };
  }

  /** Poll every account in the plan once; yields each new tweet with its account. */
  async *pollAll(plan: PollPlanItem[]): AsyncGenerator<{ item: PollPlanItem; tweet: XTweet; newSinceId?: string }> {
    for (const item of plan) {
      try {
        const { tweets, newSinceId } = await this.pollAccount(item);
        for (const tweet of tweets) {
          yield { item, tweet, newSinceId };
        }
      } catch {
        // rate-limit / network — skip this account this cycle
      }
    }
  }
}

/** Recommended poll cadence per tier (ms). Free is intentionally slow. */
export const POLL_INTERVAL_MS: Record<"free" | "basic" | "pro", number> = {
  free: 6 * 3600_000, // a few times/day — Free tier read caps are tiny
  basic: 30 * 60_000,
  pro: 5 * 60_000,
};

/** Build a search-based poll (recent search) for keyword tracking on Basic+. */
export function keywordSearchOptions(keywords: string[], sinceId?: string): SearchOptions {
  return { query: keywords.map((k) => `"${k}"`).join(" OR "), sinceId, maxResults: 50 };
}
