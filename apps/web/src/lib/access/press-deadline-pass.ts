/**
 * Press Deadline Pass — free 24-hour full access for verified journalists.
 *
 * Issued on big-story days to accredited press. Requires prior journalist
 * verification (see grants.ts journalist program). No payment required.
 *
 * Безкоштовний 24-годинний доступ для верифікованих журналістів у дні великих подій.
 */

// ── Constants ──────────────────────────────────────────────────────────────────

/**
 * Duration of a Press Deadline Pass in hours.
 * Тривалість прес-перепустки в годинах.
 */
export const PRESS_PASS_DURATION_HOURS = 24;

/**
 * Eligibility note — English.
 * Requires an active journalist grant on the account. One pass per calendar
 * month. Issued by platform staff or auto-triggered on declared "major event"
 * days (editorial decision).
 */
export const PRESS_PASS_ELIGIBILITY_NOTE_EN =
  "Eligible users must hold an active journalist grant (see Grants program). " +
  "One Press Deadline Pass per calendar month. " +
  "Auto-issued on platform-declared major-event days; " +
  "manual requests reviewed within 2 hours.";

/**
 * Eligibility note — Ukrainian.
 * Вимагає активного гранту журналіста на акаунті. Одна прес-перепустка на місяць.
 * Автоматично видається у дні оголошених «великих подій»;
 * ручні запити розглядаються протягом 2 годин.
 */
export const PRESS_PASS_ELIGIBILITY_NOTE_UK =
  "Право на прес-перепустку мають користувачі з активним грантом журналіста. " +
  "Одна перепустка на календарний місяць. " +
  "Автоматично видається у дні, оголошені «великою подією»; " +
  "ручні запити опрацьовуються протягом 2 годин.";

// ── PressDeadlinePassConfig ────────────────────────────────────────────────────

export interface PressDeadlinePassConfig {
  userId: string;
  /** ISO timestamp when the pass was issued */
  issuedAt: string;
  /** ISO timestamp when the pass expires (issuedAt + PRESS_PASS_DURATION_HOURS) */
  expiresAt: string;
  /** Optional editorial reason, e.g. "Kharkiv offensive Day-1 coverage" */
  eventLabel: string;
  /** Whether the pass was auto-issued (true) or manually requested (false) */
  autoIssued: boolean;
}

// ── PressPassStore ─────────────────────────────────────────────────────────────

export class PressPassStore {
  /** Map<userId, PressDeadlinePassConfig[]> — history of passes issued */
  private readonly passes = new Map<string, PressDeadlinePassConfig[]>();

  // ── issuePresPass ──────────────────────────────────────────────────────────

  /**
   * Issue a Press Deadline Pass for the given user.
   * Does not re-check journalist eligibility — caller must verify before invoking.
   *
   * Видає прес-перепустку. Перевірка прав — на боці калера.
   */
  issuePresPass(
    userId: string,
    options?: { eventLabel?: string; autoIssued?: boolean },
  ): PressDeadlinePassConfig {
    const issuedAt = new Date();
    const expiresAt = new Date(
      issuedAt.getTime() + PRESS_PASS_DURATION_HOURS * 60 * 60 * 1_000,
    );

    const pass: PressDeadlinePassConfig = {
      userId,
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      eventLabel: options?.eventLabel ?? "",
      autoIssued: options?.autoIssued ?? false,
    };

    if (!this.passes.has(userId)) {
      this.passes.set(userId, []);
    }
    this.passes.get(userId)!.push(pass);

    return pass;
  }

  // ── Read ───────────────────────────────────────────────────────────────────

  /**
   * Get the currently active pass for a user, or null if none.
   * Повертає активну перепустку користувача або null.
   */
  getActivePass(userId: string): PressDeadlinePassConfig | null {
    const now = new Date().toISOString();
    const userPasses = this.passes.get(userId) ?? [];
    return userPasses.find((p) => p.expiresAt > now) ?? null;
  }

  /**
   * Count passes issued to the user in the current calendar month.
   * Used to enforce the one-pass-per-month rule.
   *
   * Кількість перепусток, виданих користувачу у поточному місяці (ліміт: 1).
   */
  countThisMonth(userId: string): number {
    const monthPrefix = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    return (this.passes.get(userId) ?? []).filter((p) =>
      p.issuedAt.startsWith(monthPrefix),
    ).length;
  }
}

// ── Singleton ──────────────────────────────────────────────────────────────────

/** Global in-memory press pass store. */
export const pressPassStore = new PressPassStore();

// ── Convenience re-export for callers that only need the issue function ────────

/**
 * Issue a Press Deadline Pass (convenience wrapper around the singleton store).
 * Зручна функція-обгортка навколо pressPassStore.issuePresPass().
 */
export function issuePresPass(
  userId: string,
  options?: { eventLabel?: string; autoIssued?: boolean },
): PressDeadlinePassConfig {
  return pressPassStore.issuePresPass(userId, options);
}
