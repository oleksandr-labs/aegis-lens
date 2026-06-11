/**
 * Editorial calendar — recurring schedule rules and calendar builder
 * Ukrainian MAP / Aegis Lens — Content Strategy
 */

import type { ContentLocale, ContentType, EditorialCalendarItem } from "./types";

export interface RecurringScheduleRule {
  /** Identifies the rule uniquely */
  id: string;
  type: ContentType;
  /** 0 = Sunday … 6 = Saturday; omit for non-weekly rules */
  dayOfWeek?: number;
  /** Publish on this day of the month (1-based); omit for non-monthly rules */
  dayOfMonth?: number;
  /** Repeat every N days; 0 = event-triggered (no fixed cadence) */
  intervalDays?: number;
  /** Human-readable description in supported locales */
  description: { en: string; uk: string };
  /** Default locale for content produced by this rule */
  defaultLocale: ContentLocale;
}

/** 5 schedule rules aligned with TODO_content_strategy.md */
export const EDITORIAL_SCHEDULE: RecurringScheduleRule[] = [
  {
    id: "weekly-intel-brief",
    type: "brief",
    dayOfWeek: 1, // Monday
    description: {
      en: "Weekly intelligence brief — published every Monday, summarising key open-source findings from the prior week.",
      uk: "Щотижневий розвідувальний дайджест — публікується щопонеділка, підсумовує ключові відкриті дані за попередній тиждень.",
    },
    defaultLocale: "en",
  },
  {
    id: "monthly-deep-dive",
    type: "pillar",
    dayOfMonth: 1, // 1st of each month
    description: {
      en: "Monthly deep-dive — long-form pillar or cluster article published on the 1st of each month.",
      uk: "Щомісячний поглиблений матеріал — лонгрід (стовпна стаття або пост кластера) публікується 1-го числа кожного місяця.",
    },
    defaultLocale: "en",
  },
  {
    id: "methodology-biweekly",
    type: "methodology",
    intervalDays: 14, // every 14 days
    description: {
      en: "Bi-weekly methodology post — published every two weeks, covering OSINT tradecraft, tools, and analytical frameworks.",
      uk: "Дворазовий на місяць пост з методології — виходить раз на два тижні, охоплює практику OSINT, інструменти та аналітичні фреймворки.",
    },
    defaultLocale: "en",
  },
  {
    id: "reaction-post",
    type: "reaction",
    intervalDays: 0, // event-triggered, target within 24 h
    description: {
      en: "Reaction post — event-triggered; published within 24 hours of a major incident or breaking development.",
      uk: "Реакційний пост — запускається подією; публікується протягом 24 годин після значного інциденту або нової події.",
    },
    defaultLocale: "en",
  },
  {
    id: "year-in-review",
    type: "yearinreview",
    dayOfMonth: 15, // mid-December
    description: {
      en: "Year-in-review — published in December, synthesising the year's key intelligence findings, methodology advances, and platform growth.",
      uk: "Річний огляд — публікується в грудні, синтезує ключові розвідувальні знахідки року, прогрес методології та розвиток платформи.",
    },
    defaultLocale: "en",
  },
];

/**
 * Returns the next publish date for a recurring rule, starting from `from`
 * (defaults to today).  For event-triggered rules (intervalDays === 0) returns
 * the same `from` date, since scheduling is manual.
 */
export function getNextPublishDate(
  rule: RecurringScheduleRule,
  from: Date = new Date()
): Date {
  const base = new Date(from);
  base.setHours(0, 0, 0, 0);

  // Event-triggered — no fixed future date
  if (rule.intervalDays === 0) {
    return new Date(base);
  }

  // Weekly: find next occurrence of dayOfWeek
  if (rule.dayOfWeek !== undefined) {
    const current = base.getDay(); // 0=Sun … 6=Sat
    let daysUntil = (rule.dayOfWeek - current + 7) % 7;
    if (daysUntil === 0) {
      daysUntil = 7; // next week, not today
    }
    const next = new Date(base);
    next.setDate(base.getDate() + daysUntil);
    return next;
  }

  // Monthly: find next occurrence of dayOfMonth
  if (rule.dayOfMonth !== undefined) {
    const candidate = new Date(base);
    candidate.setDate(rule.dayOfMonth);
    if (candidate <= base) {
      // already passed this month → next month
      candidate.setMonth(candidate.getMonth() + 1);
      candidate.setDate(rule.dayOfMonth);
    }
    return candidate;
  }

  // Fixed interval
  if (rule.intervalDays !== undefined && rule.intervalDays > 0) {
    const next = new Date(base);
    next.setDate(base.getDate() + rule.intervalDays);
    return next;
  }

  return new Date(base);
}

/**
 * Builds a list of `EditorialCalendarItem` objects for every scheduled
 * publication within the given calendar month (1-based month).
 */
export function buildCalendarForMonth(
  year: number,
  month: number
): EditorialCalendarItem[] {
  const items: EditorialCalendarItem[] = [];
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0); // last day of month

  for (const rule of EDITORIAL_SCHEDULE) {
    // Skip event-triggered rules — they don't appear in pre-built calendars
    if (rule.intervalDays === 0) {
      continue;
    }

    // Year-in-review only appears in December
    if (rule.type === "yearinreview" && month !== 12) {
      continue;
    }

    let cursor = getNextPublishDate(rule, monthStart);

    // Collect all dates within the month
    while (cursor <= monthEnd) {
      items.push({
        id: `${rule.id}-${cursor.toISOString().slice(0, 10)}`,
        title: rule.description.en,
        type: rule.type,
        scheduledFor: cursor.toISOString().slice(0, 10),
        locale: rule.defaultLocale,
        status: "draft",
      });

      // Advance to next occurrence
      if (rule.dayOfWeek !== undefined) {
        cursor = new Date(cursor);
        cursor.setDate(cursor.getDate() + 7);
      } else if (rule.dayOfMonth !== undefined) {
        // Monthly rules produce at most one item per month
        break;
      } else if (rule.intervalDays !== undefined && rule.intervalDays > 0) {
        cursor = new Date(cursor);
        cursor.setDate(cursor.getDate() + rule.intervalDays);
      } else {
        break;
      }
    }
  }

  // Sort chronologically
  items.sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));
  return items;
}
