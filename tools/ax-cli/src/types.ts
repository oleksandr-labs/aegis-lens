/**
 * Shared types for the `ax` on-call diagnostic CLI.
 *
 * Спільні типи для діагностичного CLI чергового інженера `ax`.
 *
 * Design contract
 * ───────────────
 * Every subcommand is a `CommandHandler<Args, Result>`: a pure-ish async
 * function that takes parsed args + a `DiagnosticContext` (the seam where live
 * infra is injected) and returns a typed `CommandResult`. The CLI shell renders
 * `result.human` to the terminal and `result.data` to `--json`.
 *
 * Live infra (Postgres, Redis, Kafka, Prometheus, Stripe, the LLM providers)
 * is reached through the `DataSources` port. In this repo the port is fulfilled
 * by clearly-typed in-memory stubs (`stubs.ts`) so the command structure is
 * real and runnable on a laptop; in production the same handlers run against
 * the real adapters wired in `context.ts`.
 */

// ── Severity / status vocabulary ────────────────────────────────────────────

/** Traffic-light status used across every diagnostic. */
export type HealthStatus = "ok" | "warn" | "fail" | "unknown";

/** Worst-of reducer — folds many statuses into the single status to page on. */
export function worstStatus(statuses: HealthStatus[]): HealthStatus {
  const rank: Record<HealthStatus, number> = { ok: 0, unknown: 1, warn: 2, fail: 3 };
  return statuses.reduce<HealthStatus>(
    (acc, s) => (rank[s] > rank[acc] ? s : acc),
    "ok",
  );
}

// ── Command contract ────────────────────────────────────────────────────────

/** Uniform result shape every command returns. */
export interface CommandResult<TData = unknown> {
  /** Overall status — drives the process exit code (ok/warn → 0, fail → 1). */
  status: HealthStatus;
  /** One-line summary suitable for pasting into the incident channel. */
  headline: string;
  /** Pre-rendered, human-readable multi-line report for the terminal. */
  human: string;
  /** Structured payload for `--json` / piping into jq. */
  data: TData;
  /** Wall-clock time spent producing the result. */
  elapsedMs: number;
}

/** Context handed to every command — the injection seam for live infra. */
export interface DiagnosticContext {
  /** Logical environment the command runs against. */
  env: "prod" | "staging" | "dev";
  /** "Now", injectable so command output is deterministic in tests. */
  now: Date;
  /** Data-source port (real adapters in prod, typed stubs locally). */
  sources: DataSources;
}

/** A typed subcommand handler. */
export type CommandHandler<TArgs, TData> = (
  args: TArgs,
  ctx: DiagnosticContext,
) => Promise<CommandResult<TData>>;

/** Registry entry — metadata + handler, used by `index.ts` and the runbook. */
export interface CommandSpec<TArgs = unknown, TData = unknown> {
  /** Invocation name, e.g. `"source health"`. */
  name: string;
  /** Positional-arg usage hint, e.g. `"<name>"`. */
  usage: string;
  /** One-line description (matches the runbook + README). */
  summary: string;
  /** Parse raw `argv` tail into the handler's typed args (throws on misuse). */
  parse: (argv: string[]) => TArgs;
  handler: CommandHandler<TArgs, TData>;
}

// ── DataSources port ────────────────────────────────────────────────────────

export interface ServiceProbe {
  service: string;
  /** Dependency this service owns the health of (db, kafka, redis, vendor). */
  dependency?: string;
  status: HealthStatus;
  latencyMs: number;
  detail: string;
}

export interface SourceHealthSnapshot {
  sourceId: string;
  sourceName: string;
  lastSeenAt: string;
  ingestLatencyP50Ms: number;
  ingestLatencyP95Ms: number;
  /** Errors / total fetches over the trailing window. */
  errorRate: number;
  windowMin: number;
}

export interface EnrichmentStageTrace {
  stage: string;
  service: string;
  status: HealthStatus;
  latencyMs: number;
  /** Short note: what the stage decided / changed. */
  note: string;
}

export interface RawEvent {
  eventId: string;
  sourceId: string;
  receivedAt: string;
  rawText: string;
}

export interface TenantRecord {
  orgId: string;
  name: string;
  plan: "trial" | "team" | "business" | "enterprise";
  seats: number;
  createdAt: string;
  /** product → units consumed this billing period. */
  usageThisPeriod: Record<string, number>;
  /** Recent audit-log activity, newest first. */
  recentActivity: Array<{ at: string; actor: string; action: string }>;
}

export interface AlertRuleDef {
  ruleId: string;
  name: string;
  orgId: string;
  /** Minimal condition mirror — full schema lives in services/alerts. */
  condition: {
    eventClass?: string;
    minDangerScore?: number;
    minConfidence?: number;
    keyword?: string;
  };
}

/** A historical event used to dry-run a rule (30-day backfill sample). */
export interface HistoricalEvent {
  eventId: string;
  at: string;
  eventClass: string;
  dangerScore: number;
  confidence: number;
  summary: string;
}

export interface CostLineItem {
  category: "cloud" | "llm" | "saas";
  vendor: string;
  /** Cost in USD cents for the requested day. */
  amountCents: number;
  /** Unit driving the cost (instance-hours, 1K tokens, seats). */
  unit: string;
  quantity: number;
}

export interface EmbedReferrer {
  domain: string;
  loads: number;
  uniqueWidgets: number;
  /** % of loads that errored (bad token, CSP, etc.). */
  errorRate: number;
}

/**
 * The single port every command depends on. Production wires real clients;
 * `stubs.ts` provides deterministic in-memory data for local on-call drills.
 */
export interface DataSources {
  probeServices(): Promise<ServiceProbe[]>;
  getSourceHealth(name: string): Promise<SourceHealthSnapshot | undefined>;
  getRawEvent(eventId: string): Promise<RawEvent | undefined>;
  runEnrichmentChain(event: RawEvent): Promise<EnrichmentStageTrace[]>;
  getTenant(org: string): Promise<TenantRecord | undefined>;
  getAlertRule(rule: string): Promise<AlertRuleDef | undefined>;
  getHistoricalEvents(windowDays: number): Promise<HistoricalEvent[]>;
  getCostLineItems(day: string): Promise<CostLineItem[]>;
  getEmbedReferrers(windowDays: number): Promise<EmbedReferrer[]>;
}
