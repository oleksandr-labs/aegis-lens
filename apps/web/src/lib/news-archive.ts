import { listEvents } from "@/lib/events-seed";
import type { AegisEvent } from "@aegis/types";

/**
 * News archive helpers — group events by year and year/month for programmatic
 * archive pages. Generated from the same `listEvents()` source as /news.
 */

export function eventYears(): number[] {
  const set = new Set<number>();
  for (const e of listEvents()) {
    set.add(new Date(e.occurredAt).getUTCFullYear());
  }
  return [...set].sort((a, b) => b - a);
}

export function eventYearMonths(): { year: number; month: number }[] {
  const set = new Map<string, { year: number; month: number }>();
  for (const e of listEvents()) {
    const d = new Date(e.occurredAt);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const key = `${y}-${m}`;
    if (!set.has(key)) set.set(key, { year: y, month: m });
  }
  return [...set.values()].sort((a, b) =>
    a.year === b.year ? b.month - a.month : b.year - a.year,
  );
}

export function eventsInYear(year: number): AegisEvent[] {
  return listEvents()
    .filter((e) => new Date(e.occurredAt).getUTCFullYear() === year)
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
}

export function eventsInMonth(year: number, month: number): AegisEvent[] {
  return listEvents()
    .filter((e) => {
      const d = new Date(e.occurredAt);
      return d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month;
    })
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
}

export function eventYearMonthDays(): { year: number; month: number; day: number }[] {
  const set = new Map<string, { year: number; month: number; day: number }>();
  for (const e of listEvents()) {
    const d = new Date(e.occurredAt);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    const key = `${y}-${m}-${day}`;
    if (!set.has(key)) set.set(key, { year: y, month: m, day });
  }
  return [...set.values()].sort((a, b) =>
    a.year === b.year
      ? a.month === b.month
        ? b.day - a.day
        : b.month - a.month
      : b.year - a.year,
  );
}

export function eventsInDay(
  year: number,
  month: number,
  day: number,
): AegisEvent[] {
  return listEvents()
    .filter((e) => {
      const d = new Date(e.occurredAt);
      return (
        d.getUTCFullYear() === year &&
        d.getUTCMonth() + 1 === month &&
        d.getUTCDate() === day
      );
    })
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
}

export function parseDaySlug(s: string): number | null {
  const n = Number(s);
  if (!Number.isFinite(n) || n < 1 || n > 31) return null;
  return n;
}

export function daySlug(d: number): string {
  return String(d).padStart(2, "0");
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function monthName(m: number): string {
  return MONTH_NAMES[m - 1] ?? String(m);
}

export function monthSlug(m: number): string {
  return String(m).padStart(2, "0");
}

export function parseMonthSlug(s: string): number | null {
  const n = Number(s);
  if (!Number.isFinite(n) || n < 1 || n > 12) return null;
  return n;
}

export function parseYearSlug(s: string): number | null {
  const n = Number(s);
  if (!Number.isFinite(n) || n < 1900 || n > 2200) return null;
  return n;
}
