/**
 * `ax alert dry-run <rule>` — preview rule matches over the last 30 days.
 *
 * `ax alert dry-run <rule>` — попередній перегляд збігів правила за 30 днів.
 *
 * Replays a rule's condition against the 30-day historical event sample to
 * answer "if I ship this rule, how loud is it?" — match count, match rate, and
 * the most recent matches — before it pages anyone. The match logic mirrors
 * services/alerts/matcher (event_class / min_danger_score / keyword).
 */

import type {
  AlertRuleDef,
  CommandHandler,
  CommandResult,
  HistoricalEvent,
} from "../types";
import { pct, table } from "../format";

const WINDOW_DAYS = 30;

export interface AlertDryRunArgs {
  rule: string;
}

export interface AlertDryRunData {
  rule: AlertRuleDef;
  windowDays: number;
  evaluated: number;
  matched: number;
  matchRate: number;
  /** Estimated pages/day if this rule were live. */
  estPerDay: number;
  recentMatches: HistoricalEvent[];
}

export function parseAlertDryRunArgs(argv: string[]): AlertDryRunArgs {
  const rule = argv.find((a) => !a.startsWith("-"));
  if (!rule) throw new Error("usage: ax alert dry-run <rule>");
  return { rule };
}

/** Mirror of services/alerts/matcher.matchesCondition (subset). */
function matches(event: HistoricalEvent, rule: AlertRuleDef): boolean {
  const c = rule.condition;
  if (c.eventClass && event.eventClass !== c.eventClass) return false;
  if (c.minDangerScore !== undefined && event.dangerScore < c.minDangerScore) return false;
  if (c.minConfidence !== undefined && event.confidence < c.minConfidence) return false;
  if (c.keyword && !event.summary.toLowerCase().includes(c.keyword.toLowerCase())) return false;
  return true;
}

export const alertDryRunCommand: CommandHandler<AlertDryRunArgs, AlertDryRunData> = async (args, ctx) => {
  const started = ctx.now.getTime();
  const rule = await ctx.sources.getAlertRule(args.rule);

  if (!rule) {
    const headline = `Rule '${args.rule}' not found`;
    return {
      status: "unknown",
      headline,
      human: `ax alert dry-run — ${headline}`,
      data: undefined as unknown as AlertDryRunData,
      elapsedMs: Date.now() - started,
    };
  }

  const events = await ctx.sources.getHistoricalEvents(WINDOW_DAYS);
  const hits = events.filter((e) => matches(e, rule));
  const matchRate = events.length ? hits.length / events.length : 0;
  const estPerDay = Math.round((hits.length / WINDOW_DAYS) * 10) / 10;

  // Warn if the rule would be noisy (pages > ~5/day is fatigue territory).
  const status = estPerDay > 5 ? "warn" : "ok";

  const recent = [...hits].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5);
  const rows = recent.map((e) => [
    e.at,
    e.eventClass,
    e.dangerScore.toFixed(2),
    e.confidence.toFixed(2),
    e.summary,
  ]);

  const condStr = JSON.stringify(rule.condition);
  const headline = `Rule '${rule.name}': ${hits.length}/${events.length} match (${pct(matchRate)}), ~${estPerDay}/day`;
  const human = [
    `ax alert dry-run ${args.rule} — env=${ctx.env}`,
    `rule=${rule.ruleId} org=${rule.orgId}`,
    `condition=${condStr}`,
    `window=${WINDOW_DAYS}d  evaluated=${events.length}  matched=${hits.length}  est=${estPerDay}/day`,
    "",
    "Most recent matches:",
    table(["at", "class", "danger", "conf", "summary"], rows),
    "",
    headline,
    status === "warn" ? "WARNING: estimated > 5 pages/day — consider tightening before shipping." : "",
  ].filter(Boolean).join("\n");

  const result: CommandResult<AlertDryRunData> = {
    status,
    headline,
    human,
    data: { rule, windowDays: WINDOW_DAYS, evaluated: events.length, matched: hits.length, matchRate, estPerDay, recentMatches: recent },
    elapsedMs: Date.now() - started,
  };
  return result;
};
