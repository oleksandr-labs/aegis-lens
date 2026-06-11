/**
 * Family / watchlist scoping — per-user region & family watchlist model.
 *
 * Task: "Family / watchlist scoping" (TODO_civilian_alerts.md).
 *
 * Lets a user track the oblasts where their family members are, so alerts and
 * push notifications are scoped to what matters to them rather than the whole
 * country. Pure model + selection helpers; no storage layer (host persists).
 */

import type { AlertFeedSnapshot, AlertType, CivilianAlert, OblastCode } from "./types";
import { OBLASTS } from "./types";

/** One tracked person/place inside a watchlist. */
export interface WatchlistMember {
  memberId: string;
  /** Display label, e.g. "Мама (Харків)" — free text, user supplied. */
  label: string;
  oblastCode: OblastCode;
  /** Optional relation tag for UI grouping. */
  relation?: "self" | "family" | "friend" | "home" | "other";
  /** Mute push for this member without deleting them. */
  muted?: boolean;
}

/** A user's full watchlist. */
export interface Watchlist {
  userId: string;
  members: WatchlistMember[];
  updatedAt: string;
}

/** Distinct, un-muted oblasts a user is watching. */
export function watchedOblasts(list: Watchlist): OblastCode[] {
  const set = new Set<OblastCode>();
  for (const m of list.members) {
    if (!m.muted) set.add(m.oblastCode);
  }
  return Array.from(set);
}

export interface ScopedAlert {
  /** The members affected by this alert (so UI can say "Мама — тривога"). */
  members: WatchlistMember[];
  oblastCode: OblastCode;
  oblastNameUk: string;
  oblastNameEn: string;
  type: AlertType;
  startedAt: string;
  alert: CivilianAlert;
}

/**
 * Filter a live snapshot down to only the alerts that hit a user's watched
 * oblasts, annotating each with the affected family members.
 */
export function scopeSnapshotToWatchlist(
  snapshot: AlertFeedSnapshot,
  list: Watchlist,
): ScopedAlert[] {
  // oblast -> members (un-muted) watching it
  const membersByOblast = new Map<OblastCode, WatchlistMember[]>();
  for (const m of list.members) {
    if (m.muted) continue;
    const arr = membersByOblast.get(m.oblastCode);
    if (arr) arr.push(m);
    else membersByOblast.set(m.oblastCode, [m]);
  }

  const out: ScopedAlert[] = [];
  for (const alert of snapshot.activeAlerts) {
    const members = membersByOblast.get(alert.oblastCode);
    if (!members || members.length === 0) continue;
    const info = OBLASTS[alert.oblastCode];
    out.push({
      members,
      oblastCode: alert.oblastCode,
      oblastNameUk: info?.nameUk ?? alert.oblastCode,
      oblastNameEn: info?.nameEn ?? alert.oblastCode,
      type: alert.type,
      startedAt: alert.startedAt,
      alert,
    });
  }
  return out;
}

/** True when ANY watched member is currently under an active alert. */
export function hasActiveWatchedAlert(
  snapshot: AlertFeedSnapshot,
  list: Watchlist,
): boolean {
  const watched = new Set(watchedOblasts(list));
  return snapshot.activeOblastCodes.some((code) => watched.has(code));
}

/** Add or update a member (dedupe by memberId). Returns a new Watchlist. */
export function upsertMember(list: Watchlist, member: WatchlistMember): Watchlist {
  const members = list.members.filter((m) => m.memberId !== member.memberId);
  members.push(member);
  return { ...list, members, updatedAt: new Date().toISOString() };
}

/** Remove a member by id. Returns a new Watchlist. */
export function removeMember(list: Watchlist, memberId: string): Watchlist {
  return {
    ...list,
    members: list.members.filter((m) => m.memberId !== memberId),
    updatedAt: new Date().toISOString(),
  };
}
