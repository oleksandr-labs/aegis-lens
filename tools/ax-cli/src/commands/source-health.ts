/**
 * `ax source health <name>` — last seen, latency, error rate for one source.
 *
 * `ax source health <name>` — останній сигнал, затримка, частота помилок джерела.
 *
 * Mirrors the SLO thresholds enforced by services/alerts/source-health-alerts:
 * a source silent past the warning/critical silence window, or with an elevated
 * error rate, is the usual root cause of a "stale map" page.
 */

import type { CommandHandler, CommandResult, HealthStatus, SourceHealthSnapshot } from "../types";
import { worstStatus } from "../types";
import { ago, pct, statusGlyph, table } from "../format";

/** Silence thresholds (min) — kept in sync with services/alerts. */
const SILENCE_WARN_MIN = 60;
const SILENCE_CRIT_MIN = 240;
/** Error-rate SLO. */
const ERROR_RATE_WARN = 0.02;
const ERROR_RATE_CRIT = 0.05;

export interface SourceHealthArgs {
  name: string;
}

export interface SourceHealthData {
  snapshot: SourceHealthSnapshot;
  silenceMin: number;
  silenceStatus: HealthStatus;
  errorRateStatus: HealthStatus;
}

export function parseSourceHealthArgs(argv: string[]): SourceHealthArgs {
  const name = argv.find((a) => !a.startsWith("-"));
  if (!name) throw new Error("usage: ax source health <name>");
  return { name };
}

function silenceStatus(min: number): HealthStatus {
  if (min >= SILENCE_CRIT_MIN) return "fail";
  if (min >= SILENCE_WARN_MIN) return "warn";
  return "ok";
}

function errorStatus(rate: number): HealthStatus {
  if (rate >= ERROR_RATE_CRIT) return "fail";
  if (rate >= ERROR_RATE_WARN) return "warn";
  return "ok";
}

export const sourceHealthCommand: CommandHandler<SourceHealthArgs, SourceHealthData> = async (args, ctx) => {
  const started = ctx.now.getTime();
  const snapshot = await ctx.sources.getSourceHealth(args.name);

  if (!snapshot) {
    const headline = `Source '${args.name}' not found`;
    return {
      status: "unknown",
      headline,
      human: `ax source health — ${headline}\n(try: ax doctor, or check the source registry)`,
      data: undefined as unknown as SourceHealthData,
      elapsedMs: Date.now() - started,
    };
  }

  const silenceMin = Math.floor((ctx.now.getTime() - new Date(snapshot.lastSeenAt).getTime()) / 60_000);
  const sStat = silenceStatus(silenceMin);
  const eStat = errorStatus(snapshot.errorRate);
  const overall = worstStatus([sStat, eStat]);

  const rows = [
    [statusGlyph(sStat), "last seen", `${ago(snapshot.lastSeenAt, ctx.now)} (${silenceMin}m silent)`],
    [statusGlyph("ok"), "latency p50", `${snapshot.ingestLatencyP50Ms}ms`],
    [statusGlyph("ok"), "latency p95", `${snapshot.ingestLatencyP95Ms}ms`],
    [statusGlyph(eStat), "error rate", `${pct(snapshot.errorRate)} over ${snapshot.windowMin}m`],
  ];

  const headline = `${snapshot.sourceName}: ${overall.toUpperCase()} (silent ${silenceMin}m, err ${pct(snapshot.errorRate)})`;
  const human = [
    `ax source health ${args.name} — env=${ctx.env}`,
    "",
    table(["status", "metric", "value"], rows),
    "",
    headline,
  ].join("\n");

  const result: CommandResult<SourceHealthData> = {
    status: overall,
    headline,
    human,
    data: { snapshot, silenceMin, silenceStatus: sStat, errorRateStatus: eStat },
    elapsedMs: Date.now() - started,
  };
  return result;
};
