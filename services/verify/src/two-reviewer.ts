/**
 * Two-reviewer rule for "Verified" promotion.
 * Правило двох рецензентів для підтвердження статусу «Verified».
 *
 * An event may only be promoted to "verified" after two independent reviewers
 * both return a 'verify' verdict with confidence >= 0.7 (the confidence gate).
 * A single reviewer may not count twice (no self-review).
 *
 * Подія може бути переведена до «verified» лише після того, як двоє незалежних
 * рецензентів повернуть вердикт 'verify' з впевненістю >= 0.7.
 * Один рецензент не може бути зарахований двічі (заборона самоперевірки).
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/** Minimum confidence required for a 'verify' verdict to count toward consensus. */
export const CONFIDENCE_GATE = 0.7;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TwoReviewerDecision {
  reviewerId: string;
  verdict: "verify" | "dispute" | "retract";
  /** ISO timestamp */
  timestamp: string;
  /** Reviewer's confidence in their verdict (0–1) */
  confidence: number;
  notes?: string;
}

export interface TwoReviewerRecord {
  eventId: string;
  decisions: TwoReviewerDecision[];
  /**
   * Computed consensus:
   * - 'verified'    — both reviewers agree 'verify' with confidence >= CONFIDENCE_GATE
   * - 'disputed'    — reviewers disagree
   * - 'retracted'   — at least one reviewer voted 'retract'
   * - 'no_consensus'— fewer than 2 decisions, or mixed without retract
   */
  consensus?: "verified" | "disputed" | "retracted" | "no_consensus";
  /** ISO timestamp of when consensus was reached */
  resolvedAt?: string;
}

// ── Consensus logic ───────────────────────────────────────────────────────────

/**
 * Compute consensus from a set of decisions.
 *
 * Rules:
 * 1. Any 'retract' vote → 'retracted' (safety-first).
 * 2. Two distinct reviewers both vote 'verify' with confidence >= 0.7 → 'verified'.
 * 3. Two decisions that disagree → 'disputed'.
 * 4. Fewer than 2 decisions → 'no_consensus'.
 *
 * Обчислення консенсусу з набору рішень.
 */
export function computeConsensus(
  decisions: TwoReviewerDecision[],
): TwoReviewerRecord["consensus"] {
  if (decisions.length === 0) return "no_consensus";

  // Rule 1: any retract wins immediately
  if (decisions.some((d) => d.verdict === "retract")) return "retracted";

  // Need at least 2 decisions from distinct reviewers
  const unique = _uniqueByReviewer(decisions);
  if (unique.length < 2) return "no_consensus";

  // Rule 2: both verify + both above confidence gate
  const verifyVotes = unique.filter(
    (d) => d.verdict === "verify" && d.confidence >= CONFIDENCE_GATE,
  );
  if (verifyVotes.length >= 2) return "verified";

  // Rule 3: mixed verdicts
  const verdictSet = new Set(unique.map((d) => d.verdict));
  if (verdictSet.size > 1) return "disputed";

  // All same verdict but not 'verify' with gate (e.g. all 'dispute' but < 2)
  return "no_consensus";
}

/** Keep only the most recent decision per reviewer. */
function _uniqueByReviewer(decisions: TwoReviewerDecision[]): TwoReviewerDecision[] {
  const map = new Map<string, TwoReviewerDecision>();
  for (const d of decisions) {
    const existing = map.get(d.reviewerId);
    if (!existing || d.timestamp > existing.timestamp) {
      map.set(d.reviewerId, d);
    }
  }
  return [...map.values()];
}

// ── Store ─────────────────────────────────────────────────────────────────────

/**
 * In-memory store for two-reviewer records.
 * Replace with a DB table (`two_reviewer_records`) in production.
 *
 * Сховище записів двох рецензентів у пам'яті.
 * У продакшені замінити таблицею БД `two_reviewer_records`.
 */
export class TwoReviewerStore {
  private readonly records = new Map<string, TwoReviewerRecord>();

  /**
   * Add or update a reviewer's decision for an event.
   * Re-computes consensus after each addition.
   * Returns the updated record.
   *
   * Додавання або оновлення рішення рецензента для події.
   * Перераховує консенсус після кожного додавання.
   */
  addDecision(eventId: string, decision: TwoReviewerDecision): TwoReviewerRecord {
    let record = this.records.get(eventId) ?? {
      eventId,
      decisions: [],
    };

    // Remove any prior decision from this reviewer (supersede)
    record.decisions = record.decisions.filter(
      (d) => d.reviewerId !== decision.reviewerId,
    );
    record.decisions.push(decision);

    const consensus = computeConsensus(record.decisions);
    record.consensus = consensus;
    if (consensus && consensus !== "no_consensus") {
      record.resolvedAt = new Date().toISOString();
    } else {
      record.resolvedAt = undefined;
    }

    this.records.set(eventId, record);
    return record;
  }

  /**
   * Retrieve the two-reviewer record for an event.
   *
   * Отримання запису двох рецензентів для події.
   */
  getRecord(eventId: string): TwoReviewerRecord | undefined {
    return this.records.get(eventId);
  }

  /**
   * List all events that have at least one decision but no final consensus yet.
   *
   * Перелік усіх подій з принаймні одним рішенням, але без фінального консенсусу.
   */
  listPending(): TwoReviewerRecord[] {
    return [...this.records.values()].filter(
      (r) => !r.consensus || r.consensus === "no_consensus",
    );
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global in-memory two-reviewer store singleton. */
export const twoReviewerStore = new TwoReviewerStore();

// ── Policy notes ──────────────────────────────────────────────────────────────

/**
 * [1] Two-reviewer rule:
 * No single analyst may single-handedly promote an event to "Verified".
 * Two distinct human reviewers must independently submit a 'verify' verdict
 * before the state machine accepts the HITL approval.
 *
 * [1] Правило двох рецензентів:
 * Жоден аналітик не може самостійно перевести подію до «Verified».
 * Двоє різних людей-рецензентів повинні незалежно подати вердикт 'verify'.
 */
export const NOTE_TWO_REVIEWER_EN =
  "Two-reviewer rule: no single analyst may promote an event to 'Verified'. " +
  "Two distinct reviewers must both submit 'verify' verdicts before the state " +
  "machine allows the transition. Wire computeConsensus() into the HITL approval gate.";

export const NOTE_TWO_REVIEWER_UK =
  "Правило двох рецензентів: жоден аналітик не може самостійно перевести подію " +
  "до 'Verified'. Двоє різних рецензентів повинні подати вердикти 'verify'. " +
  "Підключити computeConsensus() до воріт підтвердження HITL.";

/**
 * [2] Confidence gate 0.7:
 * Even if two reviewers both vote 'verify', if either has confidence < 0.7
 * the consensus is 'no_consensus', not 'verified'.
 * This prevents low-certainty rubber-stamping.
 *
 * [2] Поріг впевненості 0.7:
 * Якщо хоча б один із рецензентів має впевненість < 0.7, консенсус не 'verified'.
 * Це запобігає формальному підтвердженню з низькою впевненістю.
 */
export const NOTE_CONFIDENCE_GATE_EN =
  "Confidence gate 0.7: both reviewers must submit confidence >= 0.7 for " +
  "'verified' consensus. Lower-confidence votes yield 'no_consensus' even if " +
  "the verdict string is 'verify'.";

export const NOTE_CONFIDENCE_GATE_UK =
  "Поріг впевненості 0.7: обидва рецензенти повинні вказати впевненість >= 0.7 " +
  "для консенсусу 'verified'. Менш впевнені голоси дають 'no_consensus', навіть " +
  "якщо рядок вердикту — 'verify'.";

/**
 * [3] No self-review:
 * The reviewer who originally classified / geolocated the event may not act
 * as one of the two human reviewers. Enforce at the API layer by comparing
 * `decision.reviewerId` against the event's original analyst userId.
 *
 * [3] Заборона самоперевірки:
 * Рецензент, який первісно класифікував або геолокував подію, не може бути
 * одним із двох рецензентів. Перевіряти на рівні API.
 */
export const NOTE_NO_SELF_REVIEW_EN =
  "No self-review: the original event analyst may not count as one of the two " +
  "human reviewers. Enforce at the API layer before calling addDecision().";

export const NOTE_NO_SELF_REVIEW_UK =
  "Заборона самоперевірки: первісний аналітик події не може бути одним із двох " +
  "рецензентів. Перевіряти на рівні API перед викликом addDecision().";
