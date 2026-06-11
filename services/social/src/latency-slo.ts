/**
 * Latency budget < 60s end-to-end.
 *
 * The social-activity layer is an early-warning signal — it is only useful if a
 * post becomes visible on the map well under a minute after it is published.
 * This module defines the end-to-end SLO, a per-pipeline-stage budget breakdown
 * that must sum within the SLO, and a breach detector that flags which stage
 * blew its budget given a measured run.
 */

export type PipelineStage =
  | "ingest" // pull/stream the post from the platform
  | "dedup" // drop duplicates / re-posts
  | "geocode" // resolve region from text/metadata
  | "classify" // topic detection + sentiment
  | "aggregate" // roll up into region/topic buckets
  | "index" // write to the serving store
  | "serve"; // API → client render

/** End-to-end SLO definition. */
export interface LatencySLO {
  name: string;
  /** Total end-to-end budget in milliseconds. */
  budgetMs: number;
  /** Objective: fraction of events that must meet the budget (e.g. 0.95 = p95). */
  objectivePercentile: number;
  descriptionEn: string;
  descriptionUk: string;
}

/** Per-stage budget allocation (all stages must sum ≤ SLO budget). */
export interface StageBudget {
  stage: PipelineStage;
  budgetMs: number;
  labelEn: string;
  labelUk: string;
}

/** The social-activity end-to-end SLO: < 60s. */
export const SOCIAL_ACTIVITY_SLO: LatencySLO = {
  name: "social_activity_e2e",
  budgetMs: 60_000,
  objectivePercentile: 0.95,
  descriptionEn: "A social post must appear on the activity heatmap within 60 seconds end-to-end (p95).",
  descriptionUk: "Допис у соцмережі має з'явитися на тепловій карті активності протягом 60 секунд наскрізно (p95).",
};

/**
 * Per-stage budget breakdown. Sums to 57.5s, leaving ~2.5s headroom under the
 * 60s SLO. Tune individual stages without exceeding the total.
 */
export const SOCIAL_ACTIVITY_STAGE_BUDGETS: StageBudget[] = [
  { stage: "ingest", budgetMs: 15_000, labelEn: "Ingest", labelUk: "Збір" },
  { stage: "dedup", budgetMs: 3_000, labelEn: "Deduplicate", labelUk: "Дедуплікація" },
  { stage: "geocode", budgetMs: 8_000, labelEn: "Geocode", labelUk: "Геокодування" },
  { stage: "classify", budgetMs: 12_000, labelEn: "Classify", labelUk: "Класифікація" },
  { stage: "aggregate", budgetMs: 7_000, labelEn: "Aggregate", labelUk: "Агрегація" },
  { stage: "index", budgetMs: 7_500, labelEn: "Index", labelUk: "Індексація" },
  { stage: "serve", budgetMs: 5_000, labelEn: "Serve", labelUk: "Видача" },
];

/** A measured latency for a single stage on one run. */
export interface StageMeasurement {
  stage: PipelineStage;
  observedMs: number;
}

export interface StageBreach {
  stage: PipelineStage;
  budgetMs: number;
  observedMs: number;
  overBy: number;
}

/** Result of evaluating one end-to-end run against the SLO + stage budgets. */
export interface LatencyBreachReport {
  sloName: string;
  budgetMs: number;
  totalObservedMs: number;
  /** Whether the end-to-end total exceeded the SLO budget. */
  sloBreached: boolean;
  /** Stages that individually exceeded their allocated budget. */
  stageBreaches: StageBreach[];
  /** Any stage with no budget defined (pipeline drift). */
  unbudgetedStages: PipelineStage[];
  evaluatedAt: string;
}

/** Total of all stage budgets (sanity-check against SLO). */
export function totalStageBudgetMs(stages: StageBudget[] = SOCIAL_ACTIVITY_STAGE_BUDGETS): number {
  return stages.reduce((sum, s) => sum + s.budgetMs, 0);
}

/**
 * Breach detector: compare a measured run to the SLO and per-stage budgets.
 * Flags the end-to-end breach plus exactly which stage(s) overran.
 */
export function detectLatencyBreaches(
  measurements: StageMeasurement[],
  slo: LatencySLO = SOCIAL_ACTIVITY_SLO,
  stageBudgets: StageBudget[] = SOCIAL_ACTIVITY_STAGE_BUDGETS,
): LatencyBreachReport {
  const budgetByStage = new Map<PipelineStage, number>(
    stageBudgets.map((s) => [s.stage, s.budgetMs]),
  );

  const totalObservedMs = measurements.reduce((sum, m) => sum + m.observedMs, 0);

  const stageBreaches: StageBreach[] = [];
  const unbudgetedStages: PipelineStage[] = [];

  for (const m of measurements) {
    const budget = budgetByStage.get(m.stage);
    if (budget === undefined) {
      unbudgetedStages.push(m.stage);
      continue;
    }
    if (m.observedMs > budget) {
      stageBreaches.push({
        stage: m.stage,
        budgetMs: budget,
        observedMs: m.observedMs,
        overBy: m.observedMs - budget,
      });
    }
  }

  return {
    sloName: slo.name,
    budgetMs: slo.budgetMs,
    totalObservedMs,
    sloBreached: totalObservedMs > slo.budgetMs,
    stageBreaches,
    unbudgetedStages,
    evaluatedAt: new Date().toISOString(),
  };
}
