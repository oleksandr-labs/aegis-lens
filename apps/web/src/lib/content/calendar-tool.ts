/**
 * Calendar Tool — Notion-backed editorial calendar integration.
 *
 * Maps ContentScheduleItems to Notion database entries with standard
 * properties. Provides buildCalendarEntry() for normalised views.
 *
 * Інтеграція редакційного календаря з Notion. buildCalendarEntry нормалізує елементи.
 */

import type { ContentScheduleItem, ContentScheduleType } from "./content-schedule";

// ── Constants ─────────────────────────────────────────────────────────────────

/** Primary calendar tooling platform. / Основна платформа календаря. */
export const CALENDAR_TOOL = "notion" as const;

/** Calendar tool usage note (English). */
export const CALENDAR_NOTE_EN =
  "The editorial calendar is managed in Notion. Each content item has a status " +
  "(Draft / Review / Scheduled / Published), due date, assignee, and reviewer fields. " +
  "Sync runs automatically via the /api/v1/content/calendar/sync endpoint.";

/** Calendar tool usage note (Ukrainian). / Примітка до інструменту календаря (Українська). */
export const CALENDAR_NOTE_UK =
  "Редакційний календар ведеться в Notion. Кожен елемент контенту має статус " +
  "(Чернетка / Рецензування / Заплановано / Опубліковано), дату, автора та рецензента. " +
  "Синхронізація запускається автоматично через /api/v1/content/calendar/sync.";

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface ContentCalendarView {
  /** Notion-compatible page title. / Заголовок сторінки Notion. */
  title: string;
  /** Content type. / Тип контенту. */
  type: ContentScheduleType;
  /** ISO-8601 due / publish date. / Дата публікації. */
  dueDate: string;
  /** Assignee display name. / Ім'я виконавця. */
  assignee?: string;
  /** Current editorial status. / Редакційний статус. */
  status: "draft" | "review" | "scheduled" | "published";
  /** Audience segment tag. / Тег сегмента аудиторії. */
  segment: string;
  /** Notion database page ID (set after creation). / ID сторінки Notion (після створення). */
  notionPageId?: string;
  /** Notes or description. / Нотатки. */
  notes?: string;
}

// ── Builder ───────────────────────────────────────────────────────────────────

/**
 * Build a ContentCalendarView from a ContentScheduleItem and target publish date.
 *
 * Будує ContentCalendarView з ContentScheduleItem та цільової дати публікації.
 */
export function buildCalendarEntry(
  item: ContentScheduleItem,
  dueDate: string,
  options?: { assignee?: string; notes?: string },
): ContentCalendarView {
  return {
    title: `${item.label} — ${dueDate}`,
    type: item.type,
    dueDate,
    assignee: options?.assignee,
    status: "draft",
    segment: item.segment,
    notes: options?.notes,
  };
}
