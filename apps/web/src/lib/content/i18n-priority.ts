/**
 * i18n Content Priority — locale-specific content publishing priority.
 *
 * EN is produced weekly (primary). UK follows in Phase 2 with weekly cadence.
 * PL and DE are event-driven only (translated on relevance).
 *
 * Пріоритети контенту за локалями: EN щотижня, UK у Фазі 2, PL/DE за подіями.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Publishing priority level per locale.
 *
 * Рівень пріоритету публікації для кожної локалі.
 */
export const CONTENT_LOCALE_PRIORITY: Record<string, string> = {
  // Task 12: EN — weekly priority (primary locale)
  en: "weekly",
  // Task 13: UK — weekly priority once locale is live (Phase 2)
  uk: "weekly-phase2",
  // Task 14: PL — event-driven translation only
  pl: "event-driven",
  // Task 14: DE — event-driven translation only
  de: "event-driven",
} as const;

/** i18n priority note (English). */
export const I18N_PRIORITY_NOTE_EN =
  "EN content publishes on the weekly cadence immediately. " +
  "UK-language content follows the same weekly schedule but launches in Phase 2 " +
  "once the locale pipeline is verified live. " +
  "PL and DE receive translated articles only when an event has direct " +
  "relevance to those audiences.";

/** i18n priority note (Ukrainian). / Примітка щодо пріоритету локалізації (Українська). */
export const I18N_PRIORITY_NOTE_UK =
  "Контент EN виходить за щотижневим графіком одразу. " +
  "Контент UA виходить за таким же щотижневим розкладом, але запускається у Фазі 2 " +
  "після перевірки мовного конвеєра. " +
  "PL та DE отримують перекладені матеріали лише тоді, коли подія " +
  "безпосередньо стосується відповідної аудиторії.";
