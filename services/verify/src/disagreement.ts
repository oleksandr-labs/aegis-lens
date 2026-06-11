/**
 * Disagreement resolution flow for conflicting reviewer verdicts.
 * Процес вирішення розбіжностей при конфліктуючих вердиктах рецензентів.
 *
 * When two reviewers disagree, a DisagreementCase is opened and escalated
 * to a senior reviewer. Resolution must occur within a 7-day SLA.
 *
 * Коли двоє рецензентів не погоджуються, відкривається DisagreementCase і
 * передається старшому рецензенту. Вирішення має відбутись протягом 7 днів (SLA).
 */

import type { TwoReviewerDecision } from "./two-reviewer";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DisagreementCase {
  /** Unique disagreement case identifier */
  caseId: string;
  /** The event that triggered the disagreement */
  eventId: string;
  reviewer1: TwoReviewerDecision;
  reviewer2: TwoReviewerDecision;
  /** UserId of the senior reviewer this case is escalated to */
  escalatedTo?: string;
  /** Human-readable resolution text provided by the senior reviewer */
  resolution?: string;
  status: "open" | "escalated" | "resolved";
  /** ISO timestamp when the case was opened */
  openedAt: string;
  /** ISO timestamp when resolved (if resolved) */
  resolvedAt?: string;
}

// ── Flow ──────────────────────────────────────────────────────────────────────

/**
 * Disagreement resolution workflow singleton.
 *
 * Steps:
 * 1. `openCase`    — called when computeConsensus() returns 'disputed'
 * 2. `escalate`    — assign a senior reviewer
 * 3. `resolve`     — senior reviewer records a resolution text
 *
 * Кроки:
 * 1. `openCase`  — викликається, коли computeConsensus() повертає 'disputed'
 * 2. `escalate`  — призначення старшого рецензента
 * 3. `resolve`   — старший рецензент записує вирішення
 */
export class DisagreementResolutionFlow {
  private readonly cases = new Map<string, DisagreementCase>();
  private seq = 0;

  /**
   * Open a new disagreement case for two conflicting decisions.
   * Returns the newly created DisagreementCase.
   *
   * Відкриття нового випадку розбіжності для двох конфліктуючих рішень.
   */
  openCase(
    eventId: string,
    d1: TwoReviewerDecision,
    d2: TwoReviewerDecision,
  ): DisagreementCase {
    const caseId = `dis-${++this.seq}-${Date.now()}`;
    const dc: DisagreementCase = {
      caseId,
      eventId,
      reviewer1: d1,
      reviewer2: d2,
      status: "open",
      openedAt: new Date().toISOString(),
    };
    this.cases.set(caseId, dc);
    return dc;
  }

  /**
   * Escalate an open case to a senior reviewer.
   * No-op if the case is already resolved.
   *
   * Передача відкритого випадку старшому рецензенту.
   * Ігнорується, якщо випадок вже вирішено.
   */
  escalate(caseId: string, seniorReviewerId: string): DisagreementCase {
    const dc = this._require(caseId);
    if (dc.status === "resolved") return dc;
    dc.escalatedTo = seniorReviewerId;
    dc.status = "escalated";
    return dc;
  }

  /**
   * Record the senior reviewer's resolution text and close the case.
   *
   * Запис вирішення старшого рецензента та закриття випадку.
   */
  resolve(caseId: string, resolution: string): DisagreementCase {
    const dc = this._require(caseId);
    dc.resolution = resolution;
    dc.status = "resolved";
    dc.resolvedAt = new Date().toISOString();
    return dc;
  }

  /**
   * Retrieve a disagreement case by id.
   *
   * Отримання випадку розбіжності за ідентифікатором.
   */
  getCase(caseId: string): DisagreementCase | undefined {
    return this.cases.get(caseId);
  }

  /**
   * List all open or escalated disagreement cases (not yet resolved).
   *
   * Перелік усіх відкритих або переданих випадків розбіжності.
   */
  listOpen(): DisagreementCase[] {
    return [...this.cases.values()].filter((dc) => dc.status !== "resolved");
  }

  private _require(caseId: string): DisagreementCase {
    const dc = this.cases.get(caseId);
    if (!dc) throw new Error(`DisagreementCase not found: ${caseId}`);
    return dc;
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global disagreement resolution flow singleton. */
export const disagreementFlow = new DisagreementResolutionFlow();

// ── Policy notes ──────────────────────────────────────────────────────────────

/**
 * [1] Senior review:
 * Disagreements are escalated to a designated senior analyst or team lead.
 * The escalation should trigger a notification (email / in-app alert).
 * Senior reviewers must have `case:admin` or `review:senior` permission.
 *
 * [1] Перевірка старшим рецензентом:
 * Розбіжності передаються призначеному старшому аналітику або тімліду.
 * Передача повинна ініціювати сповіщення (email / внутрішнє оповіщення).
 */
export const NOTE_SENIOR_REVIEW_EN =
  "Senior review: escalated cases are assigned to a reviewer with review:senior " +
  "or case:admin permission. The escalation triggers an in-app and email notification. " +
  "Senior reviewers see a dedicated 'Escalated' queue filter.";

export const NOTE_SENIOR_REVIEW_UK =
  "Перевірка старшим рецензентом: передані випадки призначаються рецензенту з " +
  "дозволом review:senior або case:admin. Передача ініціює внутрішнє та email-сповіщення. " +
  "Старші рецензенти бачать окремий фільтр черги 'Передані'.";

/**
 * [2] Resolution logged:
 * All resolution text is stored immutably alongside both original decisions.
 * The audit log records: openedAt, escalatedTo, resolution text, resolvedAt.
 * Resolutions cannot be edited after the case is closed.
 *
 * [2] Вирішення фіксується:
 * Весь текст вирішення зберігається незмінно поряд з обома оригінальними рішеннями.
 * Журнал аудиту фіксує: openedAt, escalatedTo, текст вирішення, resolvedAt.
 */
export const NOTE_RESOLUTION_LOGGED_EN =
  "Resolution logged: all resolution text is stored immutably. " +
  "Write to audit log on open, escalate, and resolve events. " +
  "Closed cases are read-only — resolution text cannot be edited after closing.";

export const NOTE_RESOLUTION_LOGGED_UK =
  "Вирішення фіксується: текст вирішення зберігається незмінно. " +
  "Записувати до журналу аудиту при відкритті, передачі та вирішенні. " +
  "Закриті випадки лише для читання — текст вирішення не можна редагувати.";

/**
 * [3] Max 7-day SLA:
 * Open and escalated cases must be resolved within 7 calendar days of `openedAt`.
 * A daily background job should alert the escalation chain for cases approaching
 * or exceeding the SLA deadline.
 *
 * [3] Максимальний SLA 7 днів:
 * Відкриті та передані випадки повинні бути вирішені протягом 7 календарних днів.
 * Щоденне фонове завдання має сповіщати ланцюг передачі для випадків,
 * що наближаються до або перевищують SLA.
 */
export const NOTE_SLA_7D_EN =
  "Max 7-day SLA: all disagreement cases must be resolved within 7 calendar days. " +
  "A daily job should query listOpen() and alert for cases where " +
  "Date.now() - openedAt > 6 days (warning) or > 7 days (breach).";

export const NOTE_SLA_7D_UK =
  "Максимальний SLA 7 днів: усі випадки розбіжності мають бути вирішені протягом " +
  "7 календарних днів. Щоденне завдання має перевіряти listOpen() та сповіщати " +
  "про випадки, де Date.now() - openedAt > 6 днів (попередження) або > 7 (порушення).";
