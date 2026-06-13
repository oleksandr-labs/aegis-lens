/**
 * `ax tenant inspect <org>` — usage, plan, recent activity for one tenant.
 *
 * `ax tenant inspect <org>` — використання, тариф, остання активність орендаря.
 *
 * The "is it just them?" command. When a customer reports breakage, this pulls
 * their plan, period-to-date usage per metered product, and the tail of their
 * audit log so the on-call can correlate the complaint with what they did.
 */

import type { CommandHandler, CommandResult, TenantRecord } from "../types";
import { ago, table } from "../format";

export interface TenantInspectArgs {
  org: string;
}

export interface TenantInspectData {
  tenant: TenantRecord;
  ageDays: number;
}

export function parseTenantInspectArgs(argv: string[]): TenantInspectArgs {
  const org = argv.find((a) => !a.startsWith("-"));
  if (!org) throw new Error("usage: ax tenant inspect <org>");
  return { org };
}

export const tenantInspectCommand: CommandHandler<TenantInspectArgs, TenantInspectData> = async (args, ctx) => {
  const started = ctx.now.getTime();
  const tenant = await ctx.sources.getTenant(args.org);

  if (!tenant) {
    const headline = `Tenant '${args.org}' not found`;
    return {
      status: "unknown",
      headline,
      human: `ax tenant inspect — ${headline}`,
      data: undefined as unknown as TenantInspectData,
      elapsedMs: Date.now() - started,
    };
  }

  const ageDays = Math.floor((ctx.now.getTime() - new Date(tenant.createdAt).getTime()) / 86_400_000);

  const usageRows = Object.entries(tenant.usageThisPeriod).map(([product, qty]) => [
    product,
    qty.toLocaleString("en-US"),
  ]);
  const activityRows = tenant.recentActivity.map((a) => [ago(a.at, ctx.now), a.actor, a.action]);

  const headline = `${tenant.name} — plan=${tenant.plan} seats=${tenant.seats} age=${ageDays}d`;
  const human = [
    `ax tenant inspect ${args.org} — env=${ctx.env}`,
    `${tenant.name}  (${tenant.orgId})`,
    `plan=${tenant.plan}  seats=${tenant.seats}  created=${tenant.createdAt} (${ageDays}d ago)`,
    "",
    "Usage this period:",
    table(["product", "units"], usageRows),
    "",
    "Recent activity:",
    table(["when", "actor", "action"], activityRows),
    "",
    headline,
  ].join("\n");

  const result: CommandResult<TenantInspectData> = {
    status: "ok",
    headline,
    human,
    data: { tenant, ageDays },
    elapsedMs: Date.now() - started,
  };
  return result;
};
