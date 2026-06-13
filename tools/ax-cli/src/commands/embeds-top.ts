/**
 * `ax embeds top <n>` — top embed referrers by widget loads.
 *
 * `ax embeds top <n>` — топ-реферери вбудованих віджетів за завантаженнями.
 *
 * Ranks the domains embedding Aegis Lens widgets by load volume over a window,
 * surfacing both our biggest publishers (capacity / abuse triage) and any
 * referrer with an abnormal embed error rate (broken token, CSP, expired key).
 */

import type { CommandHandler, CommandResult, EmbedReferrer } from "../types";
import { worstStatus } from "../types";
import type { HealthStatus } from "../types";
import { pct, statusGlyph, table } from "../format";

const WINDOW_DAYS = 7;
/** Embed error-rate that suggests a broken integration. */
const EMBED_ERROR_WARN = 0.05;
const EMBED_ERROR_CRIT = 0.15;

export interface EmbedsTopArgs {
  n: number;
}

export interface EmbedsTopData {
  windowDays: number;
  top: Array<EmbedReferrer & { status: HealthStatus }>;
  totalLoads: number;
}

export function parseEmbedsTopArgs(argv: string[]): EmbedsTopArgs {
  const raw = argv.find((a) => !a.startsWith("-"));
  const n = raw ? Number.parseInt(raw, 10) : 10;
  if (!Number.isFinite(n) || n <= 0) throw new Error("usage: ax embeds top <n>  (n must be a positive integer)");
  return { n };
}

function refStatus(rate: number): HealthStatus {
  if (rate >= EMBED_ERROR_CRIT) return "fail";
  if (rate >= EMBED_ERROR_WARN) return "warn";
  return "ok";
}

export const embedsTopCommand: CommandHandler<EmbedsTopArgs, EmbedsTopData> = async (args, ctx) => {
  const started = ctx.now.getTime();
  const referrers = await ctx.sources.getEmbedReferrers(WINDOW_DAYS);

  const ranked = referrers
    .slice()
    .sort((a, b) => b.loads - a.loads)
    .slice(0, args.n)
    .map((r) => ({ ...r, status: refStatus(r.errorRate) }));

  const totalLoads = referrers.reduce((a, r) => a + r.loads, 0);
  const overall = worstStatus(ranked.map((r) => r.status));

  const rows = ranked.map((r, i) => [
    statusGlyph(r.status),
    String(i + 1),
    r.domain,
    r.loads.toLocaleString("en-US"),
    String(r.uniqueWidgets),
    pct(r.errorRate),
  ]);

  const headline = `Top ${ranked.length} embed referrers (${WINDOW_DAYS}d): ${ranked[0]?.domain ?? "—"} leads with ${ranked[0]?.loads.toLocaleString("en-US") ?? 0} loads`;
  const human = [
    `ax embeds top ${args.n} — window=${WINDOW_DAYS}d env=${ctx.env}`,
    "",
    table(["status", "#", "domain", "loads", "widgets", "err%"], rows),
    "",
    `total loads across all referrers: ${totalLoads.toLocaleString("en-US")}`,
    headline,
    overall !== "ok" ? "NOTE: a referrer shows an elevated embed error rate — check token/CSP for it." : "",
  ].filter(Boolean).join("\n");

  const result: CommandResult<EmbedsTopData> = {
    status: overall,
    headline,
    human,
    data: { windowDays: WINDOW_DAYS, top: ranked, totalLoads },
    elapsedMs: Date.now() - started,
  };
  return result;
};
