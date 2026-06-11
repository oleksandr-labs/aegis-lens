/**
 * Side-by-side review panel — original source + AI output + decision panel.
 * Панель перегляду поряд — оригінальне джерело + вихід ШІ + панель рішень.
 *
 * Provides the data shape and default configuration for the three-pane
 * review interface used in the HITL queue.
 *
 * Визначає форму даних та конфігурацію за замовчуванням для триколонкового
 * інтерфейсу перевірки в черзі HITL.
 */

import type { ReviewTask } from "../review-store";

// ── Config ────────────────────────────────────────────────────────────────────

export interface ReviewPanelConfig {
  /** Pane arrangement: two columns side by side, or stacked vertically. */
  layout: "side-by-side" | "stacked";
  /** Show the original source URL / screenshot embed. */
  showOriginalSource: boolean;
  /** Show the AI classification / geolocation output panel. */
  showAIOutput: boolean;
  /** Show the reviewer decision panel (verdict + confidence + notes). */
  showDecisionPanel: boolean;
  /** Show associated media (images/video) in the panel. */
  showMedia: boolean;
}

/**
 * Default configuration: all panels visible, side-by-side layout.
 *
 * Конфігурація за замовчуванням: всі панелі увімкнено, розташування поряд.
 */
export const DEFAULT_REVIEW_PANEL_CONFIG: ReviewPanelConfig = {
  layout: "side-by-side",
  showOriginalSource: true,
  showAIOutput: true,
  showDecisionPanel: true,
  showMedia: true,
};

// ── Data ──────────────────────────────────────────────────────────────────────

export interface AIOutputSummary {
  /** Event classification label (e.g. 'airstrike', 'troop_movement') */
  classification?: string;
  /** AI-proposed geolocation */
  geolocation?: { lat: number; lng: number };
  /** Model confidence in its output (0–1) */
  confidence: number;
  /** Human-readable reasoning steps / evidence chains */
  reasoning: string[];
}

export interface ReviewPanelData {
  /** The review queue item being evaluated */
  reviewItem: ReviewTask;
  /** URL of the original source article / Telegram post / tweet */
  originalSourceUrl?: string;
  /** Structured AI output for this event */
  aiOutput: AIOutputSummary;
  /** Direct URLs to media assets (images, video thumbnails) associated with the event */
  mediaUrls?: string[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Merge a partial config override with the defaults.
 *
 * Злиття часткового перевизначення конфігурації з налаштуваннями за замовчуванням.
 */
export function mergeReviewPanelConfig(
  override: Partial<ReviewPanelConfig>,
): ReviewPanelConfig {
  return { ...DEFAULT_REVIEW_PANEL_CONFIG, ...override };
}

/**
 * Return true if the panel data has enough content to display without degrading
 * the reviewer experience. A panel needs at least the reviewItem and aiOutput.
 *
 * Повертає true, якщо є достатньо даних для відображення без погіршення UX.
 */
export function isPanelDataComplete(data: Partial<ReviewPanelData>): data is ReviewPanelData {
  return !!data.reviewItem && !!data.aiOutput;
}

// ── Policy notes ──────────────────────────────────────────────────────────────

/**
 * [1] Keyboard shortcuts:
 * All review actions (accept, reject, edit, skip, escalate) must be accessible
 * via keyboard shortcuts defined in keyboard-shortcuts.ts.
 * The decision panel should display shortcut hints inline (e.g. "[A] Accept").
 *
 * [1] Клавіатурні скорочення:
 * Усі дії перевірки (прийняти, відхилити, редагувати, пропустити, передати) мають
 * бути доступні через скорочення, визначені в keyboard-shortcuts.ts.
 */
export const NOTE_KEYBOARD_SHORTCUTS_EN =
  "Keyboard shortcuts: all decision panel actions must show inline shortcut hints. " +
  "Import REVIEW_KEYBOARD_SHORTCUTS from keyboard-shortcuts.ts and render them " +
  "as '[A] Accept', '[R] Reject', etc. beside each button.";

export const NOTE_KEYBOARD_SHORTCUTS_UK =
  "Клавіатурні скорочення: всі дії панелі рішень мають відображати підказки клавіш. " +
  "Імпортувати REVIEW_KEYBOARD_SHORTCUTS з keyboard-shortcuts.ts та відображати " +
  "підказки '[A] Прийняти', '[R] Відхилити' тощо поруч із кнопками.";

/**
 * [2] Undo grace period:
 * Reviewer decisions should have a 10-second undo window before being persisted.
 * Display an undo toast immediately after the action; auto-commit after timeout.
 *
 * [2] Пауза для скасування:
 * Рішення рецензентів мають мати 10-секундне вікно скасування до збереження.
 * Відображати підтвердження з можливістю скасування; авто-збереження після таймауту.
 */
export const NOTE_UNDO_GRACE_EN =
  "Undo grace period: 10-second undo window after any review decision. " +
  "Show a dismissible toast with a countdown. Auto-commit on timeout or navigation.";

export const NOTE_UNDO_GRACE_UK =
  "Пауза для скасування: 10 секунд для скасування рішення. " +
  "Відображати спливне повідомлення з відліком. Авто-збереження після таймауту або навігації.";

/**
 * [3] Citation required:
 * For 'verify' verdicts, the decision panel requires at least one source citation
 * or a reviewer note before submission. Submitting without citation is blocked.
 *
 * [3] Обов'язкове посилання:
 * Для вердиктів 'verify' панель рішень вимагає принаймні одного посилання на джерело
 * або нотатки рецензента перед поданням. Подання без посилання заблоковано.
 */
export const NOTE_CITATION_REQUIRED_EN =
  "Citation required: 'verify' verdicts must include at least one source URL or " +
  "reviewer note. Block form submission and show an inline validation error if missing.";

export const NOTE_CITATION_REQUIRED_UK =
  "Обов'язкове посилання: вердикт 'verify' повинен містити принаймні одне URL-посилання " +
  "або нотатку рецензента. Блокувати подання форми та відображати помилку при відсутності.";
