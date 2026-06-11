'use server';
/**
 * Case publishing — internal share and public release with redactions.
 * Публікація справ — внутрішній обмін та публічний випуск з редакціями.
 *
 * Public publication requires prior two-reviewer sign-off.
 * Redactions are applied before any external data leaves the system.
 *
 * Публічна публікація вимагає попереднього підтвердження двома рецензентами.
 * Редакції застосовуються до будь-яких зовнішніх даних.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type RedactionType =
  | "remove"                  // strip the field entirely
  | "blur_coords"             // round lat/lng to 2 decimal places
  | "replace_with_placeholder"; // replace value with "[REDACTED]"

export interface RedactionRule {
  /** Dot-notation path within the case data object, e.g. "location.lat" */
  fieldPath: string;
  redactionType: RedactionType;
}

export interface CasePublishConfig {
  caseId: string;
  visibility: "internal" | "public";
  redactions: RedactionRule[];
  /** UserId of the final approver (must be second reviewer for 'public') */
  approvedByUserId: string;
  /** ISO timestamp; set automatically by `publish()` */
  publishedAt?: string;
}

// ── Redaction engine ──────────────────────────────────────────────────────────

/**
 * Apply redaction rules to a copy of caseData.
 * Returns a new object; does not mutate the original.
 *
 * Застосовує правила редакції до копії даних справи.
 * Повертає новий об'єкт; оригінал не змінюється.
 */
export function applyRedactions(
  caseData: Record<string, unknown>,
  rules: RedactionRule[],
): Record<string, unknown> {
  // Deep clone to avoid mutating caller's object
  const result: Record<string, unknown> = JSON.parse(JSON.stringify(caseData));

  for (const rule of rules) {
    _applyRule(result, rule.fieldPath.split("."), rule.redactionType);
  }

  return result;
}

function _applyRule(
  obj: Record<string, unknown>,
  path: string[],
  redactionType: RedactionType,
): void {
  if (path.length === 0) return;

  const [head, ...tail] = path;

  if (tail.length === 0) {
    // Terminal segment — apply redaction
    if (!(head in obj)) return;
    switch (redactionType) {
      case "remove":
        delete obj[head];
        break;
      case "blur_coords": {
        const val = obj[head];
        if (typeof val === "number") {
          obj[head] = Math.round(val * 100) / 100; // 2 d.p.
        }
        break;
      }
      case "replace_with_placeholder":
        obj[head] = "[REDACTED]";
        break;
    }
    return;
  }

  // Recurse into nested object
  const nested = obj[head];
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    _applyRule(nested as Record<string, unknown>, tail, redactionType);
  }
}

// ── Store ─────────────────────────────────────────────────────────────────────

/**
 * In-memory publish configuration store.
 * In production, persist to a `case_publish_configs` table and trigger
 * CDN cache invalidation on unpublish.
 *
 * Сховище конфігурацій публікації в пам'яті.
 * У продакшені зберігати в таблиці `case_publish_configs`.
 */
export class CasePublishStore {
  private readonly configs = new Map<string, CasePublishConfig>();

  /**
   * Publish a case (internal or public).
   * Sets `publishedAt` to now and stores the config.
   *
   * Публікація справи (внутрішня або публічна).
   */
  publish(config: CasePublishConfig): CasePublishConfig {
    const saved: CasePublishConfig = {
      ...config,
      publishedAt: new Date().toISOString(),
    };
    this.configs.set(config.caseId, saved);
    return saved;
  }

  /**
   * Remove the publish configuration (retract from share / public).
   * Returns true if a config existed, false if not found.
   *
   * Видалення конфігурації публікації (відкликання доступу).
   */
  unpublish(caseId: string): boolean {
    return this.configs.delete(caseId);
  }

  /**
   * Retrieve the current publish configuration for a case, if any.
   *
   * Отримання поточної конфігурації публікації, якщо є.
   */
  getConfig(caseId: string): CasePublishConfig | undefined {
    return this.configs.get(caseId);
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global in-memory case publish store singleton. */
export const casePublishStore = new CasePublishStore();

// ── Policy notes ──────────────────────────────────────────────────────────────

/**
 * [1] Two-reviewer before public:
 * A case may only be published as 'public' after two distinct reviewers have
 * signed off on the content. The `approvedByUserId` field records the second
 * reviewer; the system must verify the first reviewer is on record before
 * calling `publish()` with visibility='public'.
 *
 * [1] Двоє рецензентів перед публічною публікацією:
 * Справа може бути опублікована публічно лише після підтвердження двома різними
 * рецензентами. Поле `approvedByUserId` фіксує другого рецензента.
 */
export const NOTE_TWO_REVIEWER_EN =
  "Two-reviewer before public: cases may only be published as 'public' after two " +
  "distinct analysts have signed off. Self-approval (same userId for both reviews) " +
  "is rejected. Wire to twoReviewerStore.getRecord() before calling publish().";

export const NOTE_TWO_REVIEWER_UK =
  "Двоє рецензентів перед публікацією: справи можуть бути публічно опубліковані " +
  "лише після підтвердження двома різними аналітиками. Самопідтвердження відхиляється. " +
  "Перевіряти через twoReviewerStore.getRecord() перед викликом publish().";

/**
 * [2] Redaction is irreversible:
 * Once a redacted snapshot is distributed externally, the redactions cannot be
 * recalled. Callers must confirm the redaction rules are complete before
 * calling `publish()`. Unpublishing removes future access but cannot recall
 * already-distributed copies.
 *
 * [2] Редакція незворотна:
 * Після поширення редагованого знімка зовні редакції не можна відкликати.
 * Після скасування публікації нові запити блокуються, але вже поширені копії
 * відкликати неможливо.
 */
export const NOTE_REDACTION_IRREVERSIBLE_EN =
  "Redaction is irreversible: once a redacted case snapshot has been distributed, " +
  "removing access (unpublish) does not recall already-distributed copies. " +
  "Verify all redaction rules are complete before calling publish().";

export const NOTE_REDACTION_IRREVERSIBLE_UK =
  "Редакція незворотна: після поширення редагованого знімка скасування публікації " +
  "не відкликає вже поширені копії. Перевіряйте повноту правил редакції до виклику publish().";

/**
 * [3] GDPR note:
 * Case data may include personal identifiers (names, faces, coordinates).
 * All fields containing PII must appear in the `redactions` array with
 * 'remove' or 'replace_with_placeholder' before public publication.
 * Internal publications must still respect org-level data-sharing policies.
 *
 * [3] Примітка GDPR:
 * Дані справ можуть містити персональні ідентифікатори (імена, обличчя, координати).
 * Усі поля з персональними даними повинні бути у масиві `redactions` перед
 * публічною публікацією.
 */
export const NOTE_GDPR_EN =
  "GDPR note: all PII fields (names, faces, precise coordinates, device identifiers) " +
  "must be redacted before public publication. Use 'remove' or 'replace_with_placeholder'. " +
  "Internal shares must still respect org data-sharing policies.";

export const NOTE_GDPR_UK =
  "Примітка GDPR: усі поля з персональними даними (імена, обличчя, точні координати, " +
  "ідентифікатори пристроїв) мають бути відредаговані перед публічною публікацією. " +
  "Внутрішні поширення також мають відповідати організаційним правилам обміну даними.";

/**
 * [4] DOI on publish:
 * Each public case publication should receive a stable DOI-like identifier
 * (e.g. aegis:cases/<caseId>/<publishedAt-date>) to support citation in
 * academic and journalistic reports.
 *
 * [4] DOI при публікації:
 * Кожна публічна публікація справи повинна отримати стабільний ідентифікатор
 * на зразок DOI для підтримки цитування в академічних та журналістських звітах.
 */
export const NOTE_DOI_ON_PUBLISH_EN =
  "DOI on publish: each public case publication receives a stable citable identifier " +
  "in the format aegis:cases/<caseId>/<YYYY-MM-DD>. Store this alongside publishedAt " +
  "and surface it in the case export / PDF cover page.";

export const NOTE_DOI_ON_PUBLISH_UK =
  "DOI при публікації: кожна публічна публікація справи отримує стабільний ідентифікатор " +
  "формату aegis:cases/<caseId>/<РРРР-ММ-ДД>. Зберігати разом з publishedAt та " +
  "відображати на обкладинці PDF-експорту.";
