/**
 * `ax replay event <id>` — re-runs the full enrichment chain for one event.
 *
 * `ax replay event <id>` — повторно виконує весь ланцюг збагачення для події.
 *
 * Re-executes normalize → geocode → classify → danger-score → verify → index
 * against the stored raw payload, so the on-call can see exactly which stage
 * mis-classified, dropped, or stalled an event without re-ingesting it live.
 */

import type { CommandHandler, CommandResult, EnrichmentStageTrace } from "../types";
import { worstStatus } from "../types";
import { statusGlyph, table } from "../format";

export interface ReplayEventArgs {
  eventId: string;
}

export interface ReplayEventData {
  eventId: string;
  sourceId: string;
  stages: EnrichmentStageTrace[];
  totalLatencyMs: number;
}

export function parseReplayEventArgs(argv: string[]): ReplayEventArgs {
  const eventId = argv.find((a) => !a.startsWith("-"));
  if (!eventId) throw new Error("usage: ax replay event <id>");
  return { eventId };
}

export const replayEventCommand: CommandHandler<ReplayEventArgs, ReplayEventData> = async (args, ctx) => {
  const started = ctx.now.getTime();
  const raw = await ctx.sources.getRawEvent(args.eventId);

  if (!raw) {
    const headline = `Event '${args.eventId}' not found in raw store`;
    return {
      status: "unknown",
      headline,
      human: `ax replay event — ${headline}`,
      data: undefined as unknown as ReplayEventData,
      elapsedMs: Date.now() - started,
    };
  }

  const stages = await ctx.sources.runEnrichmentChain(raw);
  const overall = worstStatus(stages.map((s) => s.status));
  const totalLatencyMs = stages.reduce((acc, s) => acc + s.latencyMs, 0);

  const rows = stages.map((s) => [statusGlyph(s.status), s.stage, s.service, `${s.latencyMs}ms`, s.note]);

  const headline = `Replay ${args.eventId}: ${overall.toUpperCase()} through ${stages.length} stages (${totalLatencyMs}ms)`;
  const human = [
    `ax replay event ${args.eventId} — env=${ctx.env}`,
    `source=${raw.sourceId}  received=${raw.receivedAt}`,
    `raw: ${raw.rawText}`,
    "",
    table(["status", "stage", "service", "latency", "note"], rows),
    "",
    headline,
  ].join("\n");

  const result: CommandResult<ReplayEventData> = {
    status: overall,
    headline,
    human,
    data: { eventId: args.eventId, sourceId: raw.sourceId, stages, totalLatencyMs },
    elapsedMs: Date.now() - started,
  };
  return result;
};
