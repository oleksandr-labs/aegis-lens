/**
 * Task 5 — Per-channel cadence + reputation.
 *
 * Each OVA channel has its own rhythm: front-line oblasts (Kharkiv, Zaporizhzhia,
 * Kherson) post many times an hour; quieter western oblasts a few times a day.
 * We track:
 *
 *   - cadence: rolling posting interval → expected next-post window. Drives the
 *     stale detection used by backup-detection.ts and a polite, per-channel poll
 *     interval (don't hammer a channel that posts twice a day).
 *   - reputation: a 0–1 quality multiplier from corroboration history. OVA feeds
 *     start HIGH (official-of-record) and are only nudged down by repeated
 *     contradiction with independent sources (rare) or retractions.
 */

import type { OvaPost } from "./types";

export interface CadenceStats {
  username: string;
  observedPosts: number;
  /** Median seconds between consecutive posts. */
  medianIntervalSec?: number;
  /** ISO of the most recent post seen. */
  lastPostAt?: string;
  /** Recommended polite poll interval (ms) derived from cadence. */
  pollIntervalMs: number;
}

/** OVA official-of-record baseline reputation (high trust tier). */
export const BASE_REPUTATION = 0.9;

const MIN_POLL_MS = 15_000; // never faster than 15s, even for hot channels
const MAX_POLL_MS = 10 * 60_000; // never slower than 10 min for safety feeds

function median(nums: number[]): number | undefined {
  if (nums.length === 0) return undefined;
  const s = [...nums].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/** Compute cadence stats for one channel from its recent posts (any order). */
export function computeCadence(username: string, posts: OvaPost[]): CadenceStats {
  const mine = posts
    .filter((p) => p.username === username)
    .map((p) => Date.parse(p.postedAt))
    .filter((t) => Number.isFinite(t))
    .sort((a, b) => a - b);

  const intervals: number[] = [];
  for (let i = 1; i < mine.length; i++) intervals.push((mine[i] - mine[i - 1]) / 1000);

  const medSec = median(intervals);
  const lastPostAt = mine.length ? new Date(mine[mine.length - 1]).toISOString() : undefined;

  // Poll at ~half the median cadence, clamped to polite bounds.
  let pollIntervalMs = MAX_POLL_MS;
  if (medSec !== undefined && medSec > 0) {
    pollIntervalMs = Math.min(MAX_POLL_MS, Math.max(MIN_POLL_MS, (medSec * 1000) / 2));
  }

  return {
    username,
    observedPosts: mine.length,
    medianIntervalSec: medSec,
    lastPostAt,
    pollIntervalMs,
  };
}

/** Seconds since the last post (for stale detection), or undefined. */
export function silenceSec(stats: CadenceStats, now = Date.now()): number | undefined {
  if (!stats.lastPostAt) return undefined;
  return Math.max(0, (now - Date.parse(stats.lastPostAt)) / 1000);
}

export interface ReputationInput {
  /** Times this channel was corroborated by an independent source. */
  corroborations?: number;
  /** Times it was contradicted by independent, higher-trust evidence. */
  contradictions?: number;
  /** Retracted posts attributed to this channel. */
  retractions?: number;
}

/**
 * Reputation multiplier (0–1). Starts at the official baseline and is adjusted
 * by history. Contradictions/retractions weigh heavier than corroborations
 * (trust is hard to rebuild). Floors at 0.4 — an official channel never drops to
 * "untrusted" purely on heuristics; that requires a human verification flip.
 */
export function computeReputation(input: ReputationInput = {}): number {
  const corr = input.corroborations ?? 0;
  const contra = input.contradictions ?? 0;
  const retr = input.retractions ?? 0;

  let rep = BASE_REPUTATION;
  rep += Math.min(0.1, corr * 0.01); // small positive cap
  rep -= contra * 0.05;
  rep -= retr * 0.08;

  return Math.max(0.4, Math.min(1, Number(rep.toFixed(3))));
}
