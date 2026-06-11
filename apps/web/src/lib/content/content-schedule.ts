/**
 * Content Schedule — canonical publishing cadence for all content types.
 *
 * Defines the structured schedule for briefs (Mon), methodology posts (bi-weekly Wed),
 * monthly deep-dives, quarterly reports, year-in-review, and 24h reaction posts.
 *
 * Графік публікацій: брифінги, методологія, глибокі дайджести, квартальні звіти.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type ContentScheduleType =
  | "brief"
  | "methodology"
  | "deep-dive"
  | "quarterly-report"
  | "year-in-review"
  | "reaction";

export type ScheduleFrequency =
  | "weekly"
  | "biweekly"
  | "monthly-first"
  | "quarterly"
  | "annual"
  | "event-triggered";

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface ContentScheduleItem {
  /** Content type. / Тип контенту. */
  type: ContentScheduleType;
  /** Publishing frequency. / Частота публікації. */
  frequency: ScheduleFrequency;
  /** Day-of-week (0=Sun … 6=Sat) or null for non-weekly. / День тижня або null. */
  dayOfWeek: number | null;
  /** Target publish time in UTC (HH:MM). / Час публікації UTC. */
  publishTimeUtc: string;
  /** Maximum hours after trigger (for reaction posts only). / Ліміт годин для реакцій. */
  maxHoursAfterTrigger?: number;
  /** Audience segment. / Сегмент аудиторії. */
  segment: "general" | "analyst" | "journalist" | "all";
  /** Short label for calendar display. / Коротка мітка для календаря. */
  label: string;
}

// ── Schedule ──────────────────────────────────────────────────────────────────

/**
 * Canonical content publishing schedule.
 *
 * Канонічний графік публікацій контенту.
 */
export const CONTENT_SCHEDULE: ContentScheduleItem[] = [
  // Task 1: Weekly intelligence brief — Monday 07:00 UTC
  {
    type: "brief",
    frequency: "weekly",
    dayOfWeek: 1, // Monday
    publishTimeUtc: "07:00",
    segment: "all",
    label: "Weekly Intelligence Brief (Mon)",
  },
  // Task 2: Methodology post — bi-weekly Wednesday 09:00 UTC
  {
    type: "methodology",
    frequency: "biweekly",
    dayOfWeek: 3, // Wednesday
    publishTimeUtc: "09:00",
    segment: "analyst",
    label: "Methodology Post (bi-weekly Wed)",
  },
  // Task 3: Monthly deep-dive — 1st of each month 08:00 UTC
  {
    type: "deep-dive",
    frequency: "monthly-first",
    dayOfWeek: null,
    publishTimeUtc: "08:00",
    segment: "all",
    label: "Monthly Deep-Dive (1st of month)",
  },
  // Task 4: Quarterly "State of the conflict" report
  {
    type: "quarterly-report",
    frequency: "quarterly",
    dayOfWeek: null,
    publishTimeUtc: "06:00",
    segment: "all",
    label: "Quarterly State of the Conflict Report",
  },
  // Task 5: Year-in-review (December)
  {
    type: "year-in-review",
    frequency: "annual",
    dayOfWeek: null,
    publishTimeUtc: "06:00",
    segment: "all",
    label: "Year-in-Review (December)",
  },
  // Task 6: Reaction posts — within 24h of major events
  {
    type: "reaction",
    frequency: "event-triggered",
    dayOfWeek: null,
    publishTimeUtc: "00:00", // ASAP after trigger
    maxHoursAfterTrigger: 24,
    segment: "all",
    label: "Reaction Post (24h deadline)",
  },
];

// ── buildNextPublishDate ──────────────────────────────────────────────────────

/**
 * Calculate the next publish date for a schedule type from a given reference date.
 *
 * Обчислює наступну дату публікації для заданого типу контенту.
 */
export function buildNextPublishDate(
  type: ContentScheduleType,
  from: string,
): string {
  const item = CONTENT_SCHEDULE.find((s) => s.type === type);
  if (!item) return from;

  const base = new Date(from);

  switch (item.frequency) {
    case "weekly": {
      const target = item.dayOfWeek ?? 1;
      const current = base.getUTCDay();
      const diff = (target - current + 7) % 7 || 7;
      base.setUTCDate(base.getUTCDate() + diff);
      break;
    }
    case "biweekly": {
      const target = item.dayOfWeek ?? 3;
      const current = base.getUTCDay();
      const diff = (target - current + 7) % 7 || 7;
      base.setUTCDate(base.getUTCDate() + diff + 7); // next occurrence + 1 week
      break;
    }
    case "monthly-first": {
      base.setUTCDate(1);
      base.setUTCMonth(base.getUTCMonth() + 1);
      break;
    }
    case "quarterly": {
      // Next quarter start month: Jan=1, Apr=4, Jul=7, Oct=10
      const quarterStarts = [1, 4, 7, 10];
      const currentMonth = base.getUTCMonth() + 1;
      const next = quarterStarts.find((m) => m > currentMonth) ?? 1;
      const yearOffset = next === 1 ? 1 : 0;
      base.setUTCFullYear(base.getUTCFullYear() + yearOffset, next - 1, 1);
      break;
    }
    case "annual": {
      // December 1st of current or next year
      const isDecember = base.getUTCMonth() === 11;
      base.setUTCFullYear(
        base.getUTCFullYear() + (isDecember ? 1 : 0),
        11,
        1,
      );
      break;
    }
    case "event-triggered":
    default:
      break;
  }

  return base.toISOString().slice(0, 10);
}
