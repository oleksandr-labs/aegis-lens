/**
 * Schedule parsing: rotation groups (queues / черги / lines) → time-blocks.
 *
 * Ukrainian rotating-blackout schedules express, per numbered group, the hours
 * power is OFF. The various providers encode this differently:
 *   - Yasno:    group → ["HH:MM-HH:MM", ...]  (OFF windows)
 *   - oblenergo HTML tables: a row per group, cells per hour marked on/off
 *   - Telegram prose: "1 черга: 08:00-12:00, 16:00-20:00 — без світла"
 *
 * This module provides pure parsers from each of those shapes into the
 * canonical ScheduleGroup { group, date, blocks: TimeBlock[] }.
 */

import type { ScheduleGroup, TimeBlock } from "./types";

const HHMM = /^(\d{1,2}):(\d{2})$/;

/** Parse "HH:MM" into minutes since midnight. "24:00" → 1440. */
export function parseHHMM(s: string): number | null {
  const m = HHMM.exec(s.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 24 || min < 0 || min > 59) return null;
  if (h === 24 && min !== 0) return null;
  return h * 60 + min;
}

/** Normalise minutes-since-midnight back to "HH:MM" (1440 → "24:00"). */
export function minutesToHHMM(mins: number): string {
  const clamped = Math.max(0, Math.min(1440, mins));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Parse a list of OFF windows ("HH:MM-HH:MM") into a full-day block list,
 * filling the gaps with ON blocks so the day (00:00–24:00) is fully covered.
 */
export function offWindowsToBlocks(windows: string[]): TimeBlock[] {
  const offRanges: Array<[number, number]> = [];
  for (const w of windows) {
    const parts = w.split("-").map((x) => x.trim());
    if (parts.length !== 2) continue;
    const a = parseHHMM(parts[0]);
    let b = parseHHMM(parts[1]);
    if (a == null || b == null) continue;
    // Wrap past midnight (e.g. "22:00-02:00") → split into two ranges.
    if (b <= a) {
      offRanges.push([a, 1440]);
      if (b > 0) offRanges.push([0, b]);
    } else {
      offRanges.push([a, b]);
    }
  }
  // Merge overlapping OFF ranges.
  offRanges.sort((x, y) => x[0] - y[0]);
  const merged: Array<[number, number]> = [];
  for (const r of offRanges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([r[0], r[1]]);
  }
  // Build full-day blocks (ON gaps + OFF ranges).
  const blocks: TimeBlock[] = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    if (start > cursor) blocks.push({ from: minutesToHHMM(cursor), to: minutesToHHMM(start), off: false });
    blocks.push({ from: minutesToHHMM(start), to: minutesToHHMM(end), off: true });
    cursor = end;
  }
  if (cursor < 1440) blocks.push({ from: minutesToHHMM(cursor), to: "24:00", off: false });
  if (blocks.length === 0) blocks.push({ from: "00:00", to: "24:00", off: false });
  return blocks;
}

/** Parse a Yasno-style group map into ScheduleGroups. */
export function parseYasnoGroups(
  groups: Record<string, string[]>,
  date: string,
): ScheduleGroup[] {
  return Object.entries(groups).map(([group, windows]) => ({
    group,
    date,
    blocks: offWindowsToBlocks(windows),
  }));
}

/**
 * Parse an HTML-table-style hour grid: per group, an array of 24 (or 48 for
 * half-hour) cells where a truthy/marked cell means OFF.
 */
export function parseHourGrid(
  rows: Array<{ group: string; cells: Array<boolean | string | number> }>,
  date: string,
): ScheduleGroup[] {
  return rows.map(({ group, cells }) => {
    const slots = cells.length;
    const slotMinutes = slots > 0 ? 1440 / slots : 60;
    const windows: string[] = [];
    let runStart: number | null = null;
    const isOff = (c: boolean | string | number): boolean => {
      if (typeof c === "boolean") return c;
      if (typeof c === "number") return c !== 0;
      const t = c.trim().toLowerCase();
      return t === "off" || t === "x" || t === "1" || t === "так" || t === "відкл";
    };
    for (let i = 0; i <= slots; i++) {
      const off = i < slots && isOff(cells[i]);
      if (off && runStart == null) runStart = i;
      else if (!off && runStart != null) {
        windows.push(`${minutesToHHMM(runStart * slotMinutes)}-${minutesToHHMM(i * slotMinutes)}`);
        runStart = null;
      }
    }
    return { group, date, blocks: offWindowsToBlocks(windows) };
  });
}

const GROUP_LINE =
  /(?:(\d+(?:\.\d+)?)\s*(?:черга|группа|група|group|line))[^\d]*((?:\d{1,2}:\d{2}\s*[-–—]\s*\d{1,2}:\d{2}[,;\s]*)+)/giu;
const RANGE = /(\d{1,2}:\d{2})\s*[-–—]\s*(\d{1,2}:\d{2})/g;

/**
 * Heuristically parse Telegram/prose schedules like:
 *   "1 черга: 08:00-12:00, 16:00-20:00; 2 черга: 10:00–14:00"
 * Returns ScheduleGroups; OFF windows are the ranges named per group.
 */
export function parseProseSchedule(text: string, date: string): ScheduleGroup[] {
  const out: ScheduleGroup[] = [];
  let gm: RegExpExecArray | null;
  GROUP_LINE.lastIndex = 0;
  while ((gm = GROUP_LINE.exec(text)) !== null) {
    const group = gm[1];
    const windows: string[] = [];
    let rm: RegExpExecArray | null;
    RANGE.lastIndex = 0;
    while ((rm = RANGE.exec(gm[2])) !== null) windows.push(`${rm[1]}-${rm[2]}`);
    if (windows.length) out.push({ group, date, blocks: offWindowsToBlocks(windows) });
  }
  return out;
}

/**
 * Is a group currently OFF at the given local minutes-since-midnight?
 * Returns the matching block or null.
 */
export function blockAt(group: ScheduleGroup, localMinutes: number): TimeBlock | null {
  for (const b of group.blocks) {
    const from = parseHHMM(b.from) ?? 0;
    const to = parseHHMM(b.to) ?? 1440;
    if (localMinutes >= from && localMinutes < to) return b;
  }
  return null;
}
