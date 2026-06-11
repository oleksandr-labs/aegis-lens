/**
 * End-to-end latency budget < 5s (task 6): source → user push.
 *
 * This is the highest-stakes SLO in the platform: an air-raid alert must reach a
 * civilian's device within 5 seconds of the source emitting it. This module
 * encodes that budget as a chain of stage budgets, and a breach detector that
 * timestamps each hop so the host can alarm + attribute a breach to a stage.
 */

/** The pipeline hops an alert traverses, source → device. */
export type LatencyStage =
  | "source_emit"     // alerts.in.ua / Telegram timestamp on the alert
  | "ingest"          // our client received it
  | "quorum"          // cross-validation decided status
  | "fanout_enqueue"  // queued for push delivery
  | "push_sent"       // handed to the push service
  | "device_received"; // (optional) client ack

/** Per-stage budget (ms). Sum of the hard hops must be <= TOTAL_BUDGET_MS. */
export const STAGE_BUDGET_MS: Record<Exclude<LatencyStage, "source_emit">, number> = {
  ingest: 1_500,
  quorum: 500,
  fanout_enqueue: 500,
  push_sent: 2_000,
  device_received: 500,
};

/** Hard end-to-end budget. */
export const TOTAL_BUDGET_MS = 5_000;

export interface LatencyTrace {
  /** epoch ms when the source emitted the alert. */
  sourceEmitMs: number;
  /** epoch ms for each stage we observed. */
  stamps: Partial<Record<LatencyStage, number>>;
}

export interface LatencyReport {
  totalMs: number;
  withinBudget: boolean;
  /** Per-stage elapsed (from previous stamped stage). */
  perStageMs: Partial<Record<LatencyStage, number>>;
  /** Stages that individually blew their budget. */
  breachedStages: LatencyStage[];
  /** The single stage that contributed the most latency. */
  worstStage?: LatencyStage;
}

const ORDER: LatencyStage[] = [
  "source_emit", "ingest", "quorum", "fanout_enqueue", "push_sent", "device_received",
];

export function startTrace(sourceEmitMs: number): LatencyTrace {
  return { sourceEmitMs, stamps: { source_emit: sourceEmitMs } };
}

export function stamp(trace: LatencyTrace, stage: LatencyStage, atMs = Date.now()): LatencyTrace {
  trace.stamps[stage] = atMs;
  return trace;
}

/** Evaluate a trace against the budget. */
export function evaluateLatency(trace: LatencyTrace): LatencyReport {
  const perStageMs: LatencyReport["perStageMs"] = {};
  const breachedStages: LatencyStage[] = [];
  let prevMs = trace.sourceEmitMs;
  let worstStage: LatencyStage | undefined;
  let worstMs = -1;

  for (const stage of ORDER.slice(1)) {
    const at = trace.stamps[stage];
    if (at === undefined) continue;
    const elapsed = at - prevMs;
    perStageMs[stage] = elapsed;
    const budget = STAGE_BUDGET_MS[stage as Exclude<LatencyStage, "source_emit">];
    if (budget !== undefined && elapsed > budget) breachedStages.push(stage);
    if (elapsed > worstMs) { worstMs = elapsed; worstStage = stage; }
    prevMs = at;
  }

  const last = trace.stamps[prevStageOf(trace)] ?? prevMs;
  const totalMs = last - trace.sourceEmitMs;

  return {
    totalMs,
    withinBudget: totalMs <= TOTAL_BUDGET_MS,
    perStageMs,
    breachedStages,
    worstStage,
  };
}

function prevStageOf(trace: LatencyTrace): LatencyStage {
  for (let i = ORDER.length - 1; i >= 0; i--) {
    if (trace.stamps[ORDER[i]] !== undefined) return ORDER[i];
  }
  return "source_emit";
}

/** Lightweight breach detector for a stream of completed traces. */
export class LatencyBreachDetector {
  private breaches = 0;
  private total = 0;

  record(trace: LatencyTrace): LatencyReport {
    const report = evaluateLatency(trace);
    this.total++;
    if (!report.withinBudget) this.breaches++;
    return report;
  }

  /** Fraction of traces that breached the 5s budget. */
  get breachRate(): number {
    return this.total === 0 ? 0 : this.breaches / this.total;
  }

  get sampleSize(): number {
    return this.total;
  }
}
