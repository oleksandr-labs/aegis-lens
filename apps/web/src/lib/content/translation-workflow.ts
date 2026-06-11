/**
 * Translation Workflow — tiered translation pipeline for PL/DE content.
 *
 * Three tiers: auto (MT only), human-assisted (MT + editor), full-native (native writer).
 * PL and DE receive selected pieces translated based on event relevance.
 *
 * Рівні перекладу: авто, за допомогою редактора, повний нейтивний.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Translation tier definitions.
 *
 * Визначення рівнів перекладу.
 */
export const TRANSLATION_TIERS = {
  /** Machine translation only — fast but requires editorial review before publish. */
  auto: {
    id: "auto" as const,
    label: "Automatic (MT only)",
    labelUk: "Автоматичний (лише MT)",
    maxTurnaroundHours: 1,
    requiredReviewers: 0,
    costPerWord: 0,
    notes: "Use for social posts and short alerts only. Not for analytical content.",
  },
  /** Machine translation + human editor pass. */
  "human-assisted": {
    id: "human-assisted" as const,
    label: "Human-assisted (MT + editor)",
    labelUk: "За допомогою редактора (MT + редактор)",
    maxTurnaroundHours: 24,
    requiredReviewers: 1,
    costPerWord: 0.03,
    notes: "Default for briefs and reaction posts in PL/DE.",
  },
  /** Full native-language writer with subject-matter expertise. */
  "full-native": {
    id: "full-native" as const,
    label: "Full native translation",
    labelUk: "Повний нейтивний переклад",
    maxTurnaroundHours: 72,
    requiredReviewers: 2,
    costPerWord: 0.12,
    notes:
      "Required for quarterly reports, methodology posts, and deep-dives in PL/DE.",
  },
} as const;

export type TranslationTierId = keyof typeof TRANSLATION_TIERS;

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface TranslationWorkflow {
  /** Source content slug. / Slug вихідного контенту. */
  sourceSlug: string;
  /** Source locale. / Вихідна локаль. */
  sourceLocale: "en";
  /** Target locale. / Цільова локаль. */
  targetLocale: "uk" | "pl" | "de";
  /** Translation tier to apply. / Рівень перекладу. */
  tier: TranslationTierId;
  /** ISO-8601 date workflow was initiated. / Дата початку процесу. */
  initiatedAt: string;
  /** ISO-8601 deadline for completion. / Дедлайн завершення. */
  deadline: string;
  /** Assigned translator ID. / ID перекладача. */
  translatorId?: string;
  /** Reviewer IDs (if required by tier). / ID рецензентів. */
  reviewerIds: string[];
  /** Workflow status. / Статус процесу. */
  status: "pending" | "in-translation" | "in-review" | "approved" | "published";
  /** Translated content slug (set after approval). / Slug перекладеного контенту. */
  translatedSlug?: string;
}

// ── TranslationStore ──────────────────────────────────────────────────────────

export class TranslationStore {
  private readonly workflows = new Map<string, TranslationWorkflow>();

  private key(sourceSlug: string, targetLocale: string): string {
    return `${sourceSlug}:${targetLocale}`;
  }

  /**
   * Initiate a translation workflow.
   *
   * Ініціює процес перекладу.
   */
  initiate(
    workflow: Omit<TranslationWorkflow, "deadline">,
  ): TranslationWorkflow {
    const tier = TRANSLATION_TIERS[workflow.tier];
    const deadline = new Date(workflow.initiatedAt);
    deadline.setUTCHours(
      deadline.getUTCHours() + tier.maxTurnaroundHours,
    );
    const full: TranslationWorkflow = {
      ...workflow,
      deadline: deadline.toISOString(),
    };
    this.workflows.set(this.key(full.sourceSlug, full.targetLocale), full);
    return full;
  }

  /**
   * Update workflow status.
   *
   * Оновлює статус процесу.
   */
  updateStatus(
    sourceSlug: string,
    targetLocale: string,
    status: TranslationWorkflow["status"],
    translatedSlug?: string,
  ): void {
    const k = this.key(sourceSlug, targetLocale);
    const w = this.workflows.get(k);
    if (w) {
      this.workflows.set(k, { ...w, status, translatedSlug });
    }
  }

  /**
   * Get a workflow by source slug and target locale.
   *
   * Повертає процес за slug і локаллю.
   */
  get(sourceSlug: string, targetLocale: string): TranslationWorkflow | undefined {
    return this.workflows.get(this.key(sourceSlug, targetLocale));
  }

  /**
   * List all workflows, optionally filtered by status or locale.
   *
   * Повертає всі процеси з опціональним фільтром.
   */
  list(
    filters?: Partial<Pick<TranslationWorkflow, "status" | "targetLocale">>,
  ): TranslationWorkflow[] {
    return Array.from(this.workflows.values()).filter((w) => {
      if (filters?.status && w.status !== filters.status) return false;
      if (filters?.targetLocale && w.targetLocale !== filters.targetLocale)
        return false;
      return true;
    });
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global translation workflow store. */
export const translationStore = new TranslationStore();
