/**
 * `ax doctor` — checks all services + dependencies.
 *
 * `ax doctor` — перевіряє всі сервіси та залежності.
 *
 * The first command an on-call runs after being paged: probes every service
 * and its owned dependency (Postgres, Kafka, Redis, vendor APIs), folds the
 * results into a single page-or-not status, and prints a ready-to-paste board.
 */

import type { CommandHandler, CommandResult, ServiceProbe } from "../types";
import { worstStatus } from "../types";
import { statusGlyph, table } from "../format";

export interface DoctorArgs {
  /** Only show services that are not OK. */
  failingOnly: boolean;
}

export interface DoctorData {
  probes: ServiceProbe[];
  failing: string[];
}

export function parseDoctorArgs(argv: string[]): DoctorArgs {
  return { failingOnly: argv.includes("--failing-only") };
}

export const doctorCommand: CommandHandler<DoctorArgs, DoctorData> = async (args, ctx) => {
  const started = ctx.now.getTime();
  const probes = await ctx.sources.probeServices();

  const failing = probes.filter((p) => p.status === "fail" || p.status === "warn").map((p) => p.service);
  const overall = worstStatus(probes.map((p) => p.status));

  const shown = args.failingOnly ? probes.filter((p) => p.status !== "ok") : probes;
  const rows = shown.map((p) => [
    statusGlyph(p.status),
    p.service,
    p.dependency ?? "—",
    p.status === "fail" ? "—" : `${p.latencyMs}ms`,
    p.detail,
  ]);

  const headline =
    overall === "ok"
      ? `All ${probes.length} services healthy`
      : `${failing.length}/${probes.length} services need attention (worst: ${overall.toUpperCase()})`;

  const human = [
    `ax doctor — env=${ctx.env}`,
    "",
    table(["status", "service", "dependency", "latency", "detail"], rows),
    "",
    headline,
  ].join("\n");

  const result: CommandResult<DoctorData> = {
    status: overall,
    headline,
    human,
    data: { probes, failing },
    elapsedMs: Date.now() - started,
  };
  return result;
};
