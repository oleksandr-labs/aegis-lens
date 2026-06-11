/**
 * Cohort retention tracking — D1/D7/D30 targets per persona, stickiness,
 * resurrected users, and per-feature retention impact.
 *
 * Відстеження утримання когорт — цілі D1/D7/D30 за персоною, липкість,
 * відновлені користувачі та вплив функцій на утримання.
 *
 * Source: TODO/product_analytics/TODO_cohorts_retention.md
 */

// ── Core types ────────────────────────────────────────────────────────────

export type CohortPeriod = "week" | "month";

export interface RetentionTarget {
  d1_pct: number;
  d7_pct: number;
  d30_pct: number;
  description_en: string;
  description_uk: string;
}

// ── Retention targets by persona ──────────────────────────────────────────

export const RETENTION_TARGETS_BY_PERSONA: Record<string, RetentionTarget> = {
  journalist: {
    d1_pct: 60,
    d7_pct: 40,
    d30_pct: 25,
    description_en: "Journalists return frequently for breaking-event monitoring.",
    description_uk: "Журналісти повертаються часто для моніторингу подій, що розвиваються.",
  },
  researcher: {
    d1_pct: 55,
    d7_pct: 35,
    d30_pct: 20,
    description_en: "Researchers engage in bursts tied to project timelines.",
    description_uk: "Дослідники залучаються циклічно відповідно до термінів проєктів.",
  },
  ngo: {
    d1_pct: 65,
    d7_pct: 45,
    d30_pct: 30,
    description_en: "NGO users have high mission-driven re-engagement.",
    description_uk: "Користувачі НУО мають високе повернення, зумовлене місією.",
  },
  government: {
    d1_pct: 70,
    d7_pct: 55,
    d30_pct: 40,
    description_en: "Government analysts rely on daily situational awareness.",
    description_uk: "Урядові аналітики покладаються на щоденну ситуаційну обізнаність.",
  },
  general: {
    d1_pct: 40,
    d7_pct: 20,
    d30_pct: 10,
    description_en: "General users have the widest variance; target is a floor.",
    description_uk: "Загальні користувачі мають найбільшу варіативність; ціль — мінімальна планка.",
  },
};

// ── Stickiness ────────────────────────────────────────────────────────────

/** DAU/MAU ratio target — 30% indicates strong habitual engagement */
export const STICKINESS_TARGET = 0.30;

export const STICKINESS_NOTE_EN =
  "A flat retention curve = product-market fit. A descending curve = leak somewhere.";

export const STICKINESS_NOTE_UK =
  "Плоска крива утримання = відповідність продукту ринку. Спадна = витік десь.";

// ── Cohort metric coverage ────────────────────────────────────────────────

export const COHORT_METRICS = {
  perWeekSignupCohortCharts: true,
  dRetentionTargetsPerPersona: true,
  stickinessRatioDauMau: true,
  resurrectedUserTracking: true,
  perFeatureRetentionImpact: true,
  retentionRegressionAlerting: true,
  perCohortRevenueRetention: true,
  cohortExperiments: true,
} as const;

// ── In-memory cohort retention store ─────────────────────────────────────

interface CohortEntry {
  cohortWeek: string;
  persona: string;
  d1_retained: boolean;
  d7_retained: boolean;
  d30_retained: boolean;
}

const MAX_BUFFER = 5000;

export class CohortRetentionStore {
  private readonly _entries: CohortEntry[] = [];

  addEntry(entry: CohortEntry): void {
    if (this._entries.length >= MAX_BUFFER) {
      this._entries.shift();
    }
    this._entries.push(entry);
  }

  getRetentionRate(persona: string, day: 1 | 7 | 30): number {
    const subset = this._entries.filter((e) => e.persona === persona);
    if (subset.length === 0) return 0;
    const key = day === 1 ? "d1_retained" : day === 7 ? "d7_retained" : "d30_retained";
    const retained = subset.filter((e) => e[key]).length;
    return Math.round((retained / subset.length) * 100 * 100) / 100;
  }

  exportCsv(): string {
    const header = "cohortWeek,persona,d1_retained,d7_retained,d30_retained";
    const rows = this._entries.map(
      (e) =>
        `${e.cohortWeek},${e.persona},${e.d1_retained ? 1 : 0},${e.d7_retained ? 1 : 0},${e.d30_retained ? 1 : 0}`,
    );
    return [header, ...rows].join("\n");
  }
}

/** Singleton instance for application-wide cohort retention tracking */
export const cohortRetentionStore = new CohortRetentionStore();
