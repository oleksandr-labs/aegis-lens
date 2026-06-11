/**
 * Review queue keyboard shortcuts — vim-style, single-key review actions.
 * Клавіатурні скорочення черги перевірки — vim-стиль, одноклавішні дії.
 *
 * All review actions are accessible without the mouse so that analysts
 * can process large queues efficiently. Accessibility fallback: every
 * action also has a visible labelled button in the decision panel.
 *
 * Усі дії доступні без миші для ефективної обробки великих черг.
 * Резервний доступ: кожна дія також має видиму кнопку в панелі рішень.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type ReviewAction =
  | "accept"            // accept the AI output as correct
  | "reject"            // reject the AI output
  | "edit"              // open the edit form to correct the AI output
  | "skip"              // defer this item (stay at bottom of queue)
  | "escalate"          // escalate to senior reviewer / disagreement flow
  | "request_more_info"; // flag as needing additional sources or context

// ── Keyboard shortcut map ─────────────────────────────────────────────────────

/**
 * Maps KeyboardEvent.key values to ReviewAction.
 * Single ASCII letters match case-insensitively in the handler.
 *
 * Відображення значень KeyboardEvent.key на ReviewAction.
 */
export const KEYBOARD_SHORTCUTS: Map<string, ReviewAction> = new Map([
  ["a",       "accept"],
  ["r",       "reject"],
  ["e",       "edit"],
  ["s",       "skip"],
  ["Escape",  "escalate"],
  ["i",       "request_more_info"],
]);

// ── Handler ───────────────────────────────────────────────────────────────────

/**
 * ReviewShortcutHandler — attach to the document (or scoped container) keydown event.
 *
 * Usage:
 *   const handler = new ReviewShortcutHandler();
 *   document.addEventListener('keydown', (e) => handler.onKeyDown(e, (action) => dispatch(action)));
 *
 * ReviewShortcutHandler — прив'язати до події keydown документа або контейнера.
 */
export class ReviewShortcutHandler {
  /**
   * Process a keydown event and invoke `onAction` if the key maps to a review action.
   * Ignores events when focus is inside a text input to avoid conflicts with typing.
   *
   * Обробка події keydown та виклик `onAction`, якщо клавіша відповідає дії.
   * Ігнорує події при фокусі в текстовому полі.
   */
  onKeyDown(event: KeyboardEvent, onAction: (action: ReviewAction) => void): void {
    // Do not fire shortcuts when the user is typing in a form control
    if (this._isTextInputFocused()) return;

    // Ignore modified key combos (Ctrl/Cmd/Alt)
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    const action =
      KEYBOARD_SHORTCUTS.get(event.key) ??
      KEYBOARD_SHORTCUTS.get(event.key.toLowerCase());

    if (action) {
      event.preventDefault();
      onAction(action);
    }
  }

  private _isTextInputFocused(): boolean {
    if (typeof document === "undefined") return false;
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    return (
      tag === "input" ||
      tag === "textarea" ||
      tag === "select" ||
      (el as HTMLElement).isContentEditable
    );
  }
}

// ── Display helpers ───────────────────────────────────────────────────────────

/**
 * Human-readable label for each review action (EN + UK).
 *
 * Людиночитані мітки для кожної дії перевірки (EN + UK).
 */
export const REVIEW_ACTION_LABELS: Record<
  ReviewAction,
  { key: string; label_en: string; label_uk: string }
> = {
  accept:           { key: "A", label_en: "Accept",           label_uk: "Прийняти" },
  reject:           { key: "R", label_en: "Reject",           label_uk: "Відхилити" },
  edit:             { key: "E", label_en: "Edit",             label_uk: "Редагувати" },
  skip:             { key: "S", label_en: "Skip",             label_uk: "Пропустити" },
  escalate:         { key: "Esc", label_en: "Escalate",       label_uk: "Передати" },
  request_more_info:{ key: "I", label_en: "Request info",     label_uk: "Запросити дані" },
};

// ── Policy notes ──────────────────────────────────────────────────────────────

/**
 * [1] Vim-style single-key shortcuts:
 * All primary review actions are bound to single lowercase ASCII keys (a/r/e/s/i)
 * familiar to vim users and common in triage UIs (e.g. Gmail).
 * 'Escape' for escalate follows modal-close convention but repurposed in review context.
 *
 * [1] Vim-стиль одноклавішних скорочень:
 * Усі основні дії прив'язані до одиночних ASCII-клавіш (a/r/e/s/i),
 * знайомих користувачам vim та поширених у UI сортування (наприклад, Gmail).
 */
export const NOTE_VIM_STYLE_EN =
  "Vim-style shortcuts: a=accept, r=reject, e=edit, s=skip, Esc=escalate, i=request_info. " +
  "Single-key bindings match muscle memory from vim, GitHub PR review, and triage UIs.";

export const NOTE_VIM_STYLE_UK =
  "Vim-стиль скорочень: a=прийняти, r=відхилити, e=редагувати, s=пропустити, " +
  "Esc=передати, i=запросити_дані. Одноклавішні прив'язки відповідають м'язовій пам'яті " +
  "vim, GitHub PR-перегляду та інтерфейсів сортування.";

/**
 * [2] Accessible fallback buttons:
 * Every keyboard action must have a corresponding labelled button in the decision panel.
 * Button labels include the shortcut key hint in brackets: "Accept [A]".
 * This ensures the UI is fully operable for users who cannot use a keyboard.
 *
 * [2] Доступні кнопки-резервні:
 * Кожне клавіатурне скорочення повинно мати відповідну кнопку з міткою в панелі рішень.
 * Мітки кнопок включають підказку клавіші у дужках: "Прийняти [A]".
 */
export const NOTE_ACCESSIBLE_FALLBACK_EN =
  "Accessible fallback buttons: every keyboard shortcut must have a matching visible " +
  "button with label + key hint (e.g. 'Accept [A]'). " +
  "Keyboard handler must not be the only access path — WCAG 2.1 AA compliance.";

export const NOTE_ACCESSIBLE_FALLBACK_UK =
  "Доступні кнопки-резервні: кожне скорочення повинно мати видиму кнопку з міткою та " +
  "підказкою клавіші (наприклад, 'Прийняти [A]'). " +
  "Клавіатурний обробник не може бути єдиним шляхом — відповідність WCAG 2.1 AA.";
