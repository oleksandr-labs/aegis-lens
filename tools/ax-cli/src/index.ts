/**
 * `ax` CLI command registry.
 *
 * Реєстр команд CLI `ax`.
 *
 * Single source of truth mapping command name → spec (metadata + parser +
 * handler). The CLI shell (`cli.ts`), the README, and the on-call runbook all
 * reference commands by the `name` declared here. Adding a command = adding one
 * entry below.
 */

import type { CommandSpec, DiagnosticContext } from "./types";
import { buildContext } from "./context";
import { doctorCommand, parseDoctorArgs } from "./commands/doctor";
import { sourceHealthCommand, parseSourceHealthArgs } from "./commands/source-health";
import { replayEventCommand, parseReplayEventArgs } from "./commands/replay-event";
import { tenantInspectCommand, parseTenantInspectArgs } from "./commands/tenant-inspect";
import { alertDryRunCommand, parseAlertDryRunArgs } from "./commands/alert-dry-run";
import { costTodayCommand, parseCostTodayArgs } from "./commands/cost-today";
import { embedsTopCommand, parseEmbedsTopArgs } from "./commands/embeds-top";

export * from "./types";
export { buildContext } from "./context";

/** All registered subcommands, keyed by invocation name. */
export const COMMANDS: Record<string, CommandSpec<any, any>> = {
  "doctor": {
    name: "doctor",
    usage: "[--failing-only]",
    summary: "checks all services + dependencies",
    parse: parseDoctorArgs,
    handler: doctorCommand,
  },
  "source health": {
    name: "source health",
    usage: "<name>",
    summary: "last seen, latency, error rate for one source",
    parse: parseSourceHealthArgs,
    handler: sourceHealthCommand,
  },
  "replay event": {
    name: "replay event",
    usage: "<id>",
    summary: "full enrichment chain re-execution for one event",
    parse: parseReplayEventArgs,
    handler: replayEventCommand,
  },
  "tenant inspect": {
    name: "tenant inspect",
    usage: "<org>",
    summary: "usage, plan, recent activity for one tenant",
    parse: parseTenantInspectArgs,
    handler: tenantInspectCommand,
  },
  "alert dry-run": {
    name: "alert dry-run",
    usage: "<rule>",
    summary: "preview rule matches over the last 30 days",
    parse: parseAlertDryRunArgs,
    handler: alertDryRunCommand,
  },
  "cost today": {
    name: "cost today",
    usage: "[YYYY-MM-DD]",
    summary: "daily cost summary across cloud + LLM + saas",
    parse: parseCostTodayArgs,
    handler: costTodayCommand,
  },
  "embeds top": {
    name: "embeds top",
    usage: "<n>",
    summary: "top embed referrers by widget loads",
    parse: parseEmbedsTopArgs,
    handler: embedsTopCommand,
  },
};

/** Command names ordered as they appear in the runbook / help. */
export const COMMAND_ORDER = [
  "doctor",
  "source health",
  "replay event",
  "tenant inspect",
  "alert dry-run",
  "cost today",
  "embeds top",
] as const;

/**
 * Match an argv array against the registry, longest-name-first so two-word
 * commands ("source health") win over any single-word prefix. Returns the
 * matched spec and the remaining (positional/flag) argv tail.
 */
export function resolveCommand(
  argv: string[],
): { spec: CommandSpec<any, any>; rest: string[] } | undefined {
  const joined2 = argv.slice(0, 2).join(" ");
  if (COMMANDS[joined2]) return { spec: COMMANDS[joined2], rest: argv.slice(2) };
  const joined1 = argv[0];
  if (joined1 && COMMANDS[joined1]) return { spec: COMMANDS[joined1], rest: argv.slice(1) };
  return undefined;
}

/**
 * Programmatic entrypoint: resolve, parse, run. Useful for tests and for the
 * `cli.ts` shell. Throws on unknown command / arg-parse failure.
 */
export async function runCommand(
  argv: string[],
  ctx: DiagnosticContext = buildContext(),
) {
  const match = resolveCommand(argv);
  if (!match) throw new Error(`unknown command: ${argv.join(" ")}`);
  const parsed = match.spec.parse(match.rest);
  return match.spec.handler(parsed, ctx);
}
