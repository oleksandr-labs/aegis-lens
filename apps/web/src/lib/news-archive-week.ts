import { listEvents } from "@/lib/events-seed";
import type { AegisEvent } from "@aegis/types";

/**
 * ISO-8601 week helpers for /archive/<year>/week/<NN> weekly recap pages.
 * Weeks are Monday-start; week 1 is the week containing the first Thursday of
 * the year (ISO-8601). The (isoYear, isoWeek) pair can differ from the
 * calendar year at year boundaries — we group strictly by ISO week-year so a
 * recap never double-counts or drops boundary events.
 */

/** ISO week-year + week number for a date. */
export function isoWeek(date: Date): { year: number; week: number } {
  // Copy to a UTC midnight to avoid TZ drift.
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  // ISO weekday: Mon=1..Sun=7. Shift to the Thursday of this week.
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const year = d.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year, week };
}

/** Number of ISO weeks (52 or 53) in an ISO week-year. */
export function isoWeeksInYear(year: number): number {
  // A year has 53 weeks iff Jan 1 is Thursday, or it is a leap year and Jan 1
  // is Wednesday.
  const jan1 = new Date(Date.UTC(year, 0, 1)).getUTCDay();
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  if (jan1 === 4 || (isLeap && jan1 === 3)) return 53;
  return 52;
}

/** Monday (UTC) that starts the given ISO week. */
export function isoWeekStart(year: number, week: number): Date {
  // Jan 4 is always in ISO week 1.
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));
  const start = new Date(week1Monday);
  start.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);
  return start;
}

/** Sunday (UTC, end of day) that closes the given ISO week. */
export function isoWeekEnd(year: number, week: number): Date {
  const start = isoWeekStart(year, week);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);
  return end;
}

/** Zero-padded week slug, e.g. 7 -> "07". */
export function weekSlug(week: number): string {
  return String(week).padStart(2, "0");
}

/** Parse a "NN" week slug, returning null if out of the 1..53 range. */
export function parseWeekSlug(s: string): number | null {
  const n = Number(s);
  if (!Number.isInteger(n) || n < 1 || n > 53) return null;
  return n;
}

/** All (isoYear, isoWeek) buckets present in the event corpus, newest first. */
export function eventIsoWeeks(): { year: number; week: number }[] {
  const set = new Map<string, { year: number; week: number }>();
  for (const e of listEvents()) {
    const { year, week } = isoWeek(new Date(e.occurredAt));
    const key = `${year}-${week}`;
    if (!set.has(key)) set.set(key, { year, week });
  }
  return [...set.values()].sort((a, b) =>
    a.year === b.year ? b.week - a.week : b.year - a.year,
  );
}

/** Events occurring inside the given ISO week, newest first. */
export function eventsInIsoWeek(year: number, week: number): AegisEvent[] {
  const start = isoWeekStart(year, week).getTime();
  const end = isoWeekEnd(year, week).getTime();
  return listEvents()
    .filter((e) => {
      const t = Date.parse(e.occurredAt);
      return t >= start && t <= end;
    })
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
}
