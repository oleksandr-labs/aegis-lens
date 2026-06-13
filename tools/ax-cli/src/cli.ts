#!/usr/bin/env node
/**
 * `ax` CLI shell — argv → command → rendered output.
 *
 * Оболонка CLI `ax` — argv → команда → відрендерений вивід.
 *
 * Thin shell only: it parses global flags (`--json`, `--env`, `--help`),
 * delegates to the registry in `index.ts`, prints `result.human` (or
 * `result.data` as JSON), and sets the exit code from `result.status`
 * (fail → 1) so it composes in scripts and CI health gates.
 */

import { COMMANDS, COMMAND_ORDER, resolveCommand, runCommand } from "./index";
import { buildContext } from "./context";
import type { DiagnosticContext } from "./types";

function printHelp(): void {
  const lines = [
    "ax — Aegis Lens on-call diagnostic CLI",
    "",
    "usage: ax <command> [args] [--json] [--env=prod|staging|dev]",
    "",
    "commands:",
    ...COMMAND_ORDER.map((name) => {
      const c = COMMANDS[name];
      return `  ax ${name} ${c.usage}`.padEnd(34) + `  ${c.summary}`;
    }),
    "",
    "global flags:",
    "  --json            emit the structured result instead of the report",
    "  --env=<env>       target environment (default: $AX_ENV or prod)",
    "  --help, -h        show this help",
  ];
  process.stdout.write(lines.join("\n") + "\n");
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);

  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
    printHelp();
    process.exit(0);
  }

  const asJson = argv.includes("--json");
  const envFlag = argv.find((a) => a.startsWith("--env="))?.split("=")[1] as
    | DiagnosticContext["env"]
    | undefined;
  // Strip global flags before handing the tail to the command parser.
  const positional = argv.filter((a) => a !== "--json" && !a.startsWith("--env="));

  const match = resolveCommand(positional);
  if (!match) {
    process.stderr.write(`unknown command: ${positional.join(" ")}\n\n`);
    printHelp();
    process.exit(2);
  }

  const ctx = buildContext({ env: envFlag });

  try {
    const result = await runCommand(positional, ctx);
    if (asJson) {
      process.stdout.write(JSON.stringify({ status: result.status, headline: result.headline, elapsedMs: result.elapsedMs, data: result.data }, null, 2) + "\n");
    } else {
      process.stdout.write(result.human + "\n");
    }
    process.exit(result.status === "fail" ? 1 : 0);
  } catch (err) {
    process.stderr.write(`ax: ${(err as Error).message}\n`);
    process.exit(2);
  }
}

void main();
