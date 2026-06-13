/**
 * `ax cost today` — daily cost summary across cloud + LLM + saas.
 *
 * `ax cost today` — добовий підсумок витрат: cloud + LLM + saas.
 *
 * Pulls today's line items from each billing surface (Hetzner/Cloudflare,
 * the LLM providers, SaaS seats/fees), groups by category, and flags a spend
 * spike. The fast answer to "did the incident cost us money?" / "why is the
 * LLM bill up today?".
 */

import type { CommandHandler, CommandResult, CostLineItem } from "../types";
import { table, usd } from "../format";

/** Daily total above this (USD cents) is unusual for this platform → warn. */
const DAILY_SPIKE_CENTS = 25_000;

export interface CostTodayArgs {
  /** ISO date (YYYY-MM-DD); defaults to ctx.now. */
  day?: string;
}

export interface CostTodayData {
  day: string;
  byCategory: Array<{ category: CostLineItem["category"]; totalCents: number }>;
  totalCents: number;
  items: CostLineItem[];
}

export function parseCostTodayArgs(argv: string[]): CostTodayArgs {
  const day = argv.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));
  return { day };
}

export const costTodayCommand: CommandHandler<CostTodayArgs, CostTodayData> = async (args, ctx) => {
  const started = ctx.now.getTime();
  const day = args.day ?? ctx.now.toISOString().slice(0, 10);
  const items = await ctx.sources.getCostLineItems(day);

  const categories: CostLineItem["category"][] = ["cloud", "llm", "saas"];
  const byCategory = categories.map((category) => ({
    category,
    totalCents: items.filter((i) => i.category === category).reduce((a, i) => a + i.amountCents, 0),
  }));
  const totalCents = byCategory.reduce((a, c) => a + c.totalCents, 0);

  const status = totalCents > DAILY_SPIKE_CENTS ? "warn" : "ok";

  const itemRows = items
    .slice()
    .sort((a, b) => b.amountCents - a.amountCents)
    .map((i) => [i.category, i.vendor, usd(i.amountCents), `${i.quantity} ${i.unit}`]);
  const catRows = byCategory.map((c) => [
    c.category,
    usd(c.totalCents),
    totalCents ? ((c.totalCents / totalCents) * 100).toFixed(0) + "%" : "0%",
  ]);

  const headline = `Spend ${day}: ${usd(totalCents)} (cloud ${usd(byCategory[0].totalCents)} / llm ${usd(byCategory[1].totalCents)} / saas ${usd(byCategory[2].totalCents)})`;
  const human = [
    `ax cost today — day=${day} env=${ctx.env}`,
    "",
    "By category:",
    table(["category", "total", "share"], catRows),
    "",
    "Line items (desc):",
    table(["cat", "vendor", "cost", "driver"], itemRows),
    "",
    `TOTAL ${usd(totalCents)}`,
    status === "warn" ? `WARNING: above daily-spike threshold (${usd(DAILY_SPIKE_CENTS)}).` : "",
  ].filter(Boolean).join("\n");

  const result: CommandResult<CostTodayData> = {
    status,
    headline,
    human,
    data: { day, byCategory, totalCents, items },
    elapsedMs: Date.now() - started,
  };
  return result;
};
