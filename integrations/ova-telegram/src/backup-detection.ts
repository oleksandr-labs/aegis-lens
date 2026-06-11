/**
 * Task 3 — Backup channel detection (if a primary is banned / lost).
 *
 * OVA channels are periodically targeted: Telegram may remove a channel,
 * adversaries may report it, or it may be hijacked/renamed. When a primary goes
 * dark we must fail over to an authoritative backup WITHOUT silently trusting a
 * random clone. Strategy:
 *
 *   1. Detect outage: primary returns banned/410 OR is silent far beyond its
 *      expected cadence (stale) while neighbouring oblasts are posting.
 *   2. Prefer a PRE-REGISTERED backup (`KNOWN_BACKUPS`) — already vetted.
 *   3. Otherwise, surface candidate mirrors discovered in the channel's own
 *      pinned/forwarded posts, but mark them `unverified` until verification.ts
 *      clears them. We NEVER auto-promote an unverified mirror to official.
 */

import type { OblastCode, OvaChannel, ChannelStatus } from "./types";
import { oblastGroup } from "./registry";
import { verifyChannel, isAuthentic, type AuthenticitySignals } from "./verification";

export interface ChannelLiveness {
  username: string;
  status: ChannelStatus;
  /** Seconds since last post (undefined = never seen). */
  silenceSec?: number;
}

export interface FailoverDecision {
  oblastCode: OblastCode;
  /** True when the primary is unusable (banned or stale). */
  primaryDown: boolean;
  primary: string;
  /** Chosen replacement channel, if any was eligible. */
  failoverTo?: OvaChannel;
  /** Whether the chosen replacement is a verified, registered backup. */
  failoverVerified: boolean;
  /** Unverified mirror candidates surfaced for human review. */
  candidates: OvaChannel[];
  reason: string;
}

/** Stale threshold: OVAs post often; >6h silence during war is suspicious. */
export const STALE_SILENCE_SEC = 6 * 60 * 60;

/** Classify a primary's liveness into down/up. */
export function isPrimaryDown(live: ChannelLiveness): boolean {
  if (live.status === "banned") return true;
  if (live.status === "stale") return true;
  if (live.silenceSec !== undefined && live.silenceSec > STALE_SILENCE_SEC) return true;
  return false;
}

/**
 * Decide failover for one oblast given the primary's liveness and any mirror
 * candidates discovered live (e.g. from forwarded/pinned posts).
 *
 * @param verifySignals optional per-candidate out-of-band signals (gov.ua etc.)
 */
export function decideFailover(
  oblastCode: OblastCode,
  primaryLive: ChannelLiveness,
  discoveredMirrors: OvaChannel[] = [],
  verifySignals: (c: OvaChannel) => Partial<AuthenticitySignals> = () => ({}),
): FailoverDecision {
  const group = oblastGroup(oblastCode);
  const down = isPrimaryDown(primaryLive);

  if (!down) {
    return {
      oblastCode,
      primaryDown: false,
      primary: group.primary.username,
      failoverVerified: false,
      candidates: [],
      reason: "primary healthy",
    };
  }

  // 1. Prefer a pre-registered, verifiable backup.
  for (const backup of group.backups) {
    const v = verifyChannel(backup, verifySignals(backup));
    if (isAuthentic(v)) {
      return {
        oblastCode,
        primaryDown: true,
        primary: group.primary.username,
        failoverTo: backup,
        failoverVerified: true,
        candidates: [],
        reason: `failed over to registered backup @${backup.username} (authenticity ${v.authenticity})`,
      };
    }
  }

  // 2. Surface discovered mirrors as UNVERIFIED candidates (no auto-promotion).
  const candidates = discoveredMirrors
    .filter((m) => m.oblastCode === oblastCode)
    .map((m): OvaChannel => ({ ...m, role: "mirror" }));

  return {
    oblastCode,
    primaryDown: true,
    primary: group.primary.username,
    failoverVerified: false,
    candidates,
    reason: candidates.length
      ? `primary down; ${candidates.length} unverified mirror(s) pending verification`
      : "primary down; no backup or mirror available",
  };
}
