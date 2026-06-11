/**
 * Cost dashboard per provider per feature.
 *
 * Records token usage + USD for every completion, keyed by provider × feature
 * (and optionally tenant). Pricing is a static table (USD per 1M tokens) — update
 * as providers change rates; cache reads are credited at the discounted rate.
 *
 * In-memory accumulator suitable for a dashboard endpoint to read; the host can
 * also subscribe to {@link onUsage} to forward each event to a TSDB/metering DB.
 */

import type { LlmFeature, ProviderId, TokenUsage } from "./types";

/** USD per 1,000,000 tokens. */
interface Rate {
  input: number;
  output: number;
  /** Cache-read price (defaults to ~0.1x input for Anthropic-style caches). */
  cacheRead?: number;
  /** Cache-write premium price (Anthropic ~1.25x input). */
  cacheWrite?: number;
}

/** Pricing keyed by model id (prefix match falls back to provider default). */
const PRICING: Record<string, Rate> = {
  // Anthropic (latest) — $/1M.
  "claude-opus-4-8": { input: 5, output: 25, cacheRead: 0.5, cacheWrite: 6.25 },
  "claude-sonnet-4-6": { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
  "claude-haiku-4-5": { input: 1, output: 5, cacheRead: 0.1, cacheWrite: 1.25 },
  // OpenAI.
  "gpt-4o": { input: 2.5, output: 10, cacheRead: 1.25 },
  "gpt-4o-mini": { input: 0.15, output: 0.6, cacheRead: 0.075 },
};

/** Self-hosted open-weights is amortized infra, not per-token — treat as ~0. */
const PROVIDER_FALLBACK: Record<ProviderId, Rate> = {
  anthropic: { input: 3, output: 15 },
  openai: { input: 2.5, output: 10 },
  openweights: { input: 0, output: 0 },
};

function rateFor(provider: ProviderId, model: string): Rate {
  if (PRICING[model]) return PRICING[model];
  const hit = Object.keys(PRICING).find((k) => model.startsWith(k));
  return hit ? PRICING[hit] : PROVIDER_FALLBACK[provider];
}

/** Compute USD cost of a single usage record. */
export function costUsd(provider: ProviderId, model: string, usage: TokenUsage): number {
  const r = rateFor(provider, model);
  const m = 1_000_000;
  const cacheRead = (usage.cacheReadTokens ?? 0) * (r.cacheRead ?? r.input * 0.1);
  const cacheWrite = (usage.cacheCreationTokens ?? 0) * (r.cacheWrite ?? r.input * 1.25);
  return (
    (usage.inputTokens * r.input +
      usage.outputTokens * r.output +
      cacheRead +
      cacheWrite) /
    m
  );
}

export interface UsageEvent {
  provider: ProviderId;
  model: string;
  feature: LlmFeature;
  tenantId?: string;
  usage: TokenUsage;
  costUsd: number;
  at: string;
}

export interface CostBucket {
  provider: ProviderId;
  feature: LlmFeature;
  calls: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  costUsd: number;
}

type Subscriber = (e: UsageEvent) => void;

class CostTracker {
  private buckets = new Map<string, CostBucket>();
  private subscribers: Subscriber[] = [];

  private key(p: ProviderId, f: LlmFeature): string {
    return `${p}::${f}`;
  }

  /** Record one completion's usage. Returns the computed event. */
  record(
    provider: ProviderId,
    model: string,
    feature: LlmFeature,
    usage: TokenUsage,
    tenantId?: string,
  ): UsageEvent {
    const cost = costUsd(provider, model, usage);
    const event: UsageEvent = {
      provider,
      model,
      feature,
      tenantId,
      usage,
      costUsd: cost,
      at: new Date().toISOString(),
    };

    const k = this.key(provider, feature);
    const b =
      this.buckets.get(k) ??
      {
        provider,
        feature,
        calls: 0,
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        costUsd: 0,
      };
    b.calls += 1;
    b.inputTokens += usage.inputTokens;
    b.outputTokens += usage.outputTokens;
    b.cacheReadTokens += usage.cacheReadTokens ?? 0;
    b.costUsd += cost;
    this.buckets.set(k, b);

    for (const s of this.subscribers) {
      try {
        s(event);
      } catch {
        /* a bad subscriber must not break accounting */
      }
    }
    return event;
  }

  /** Snapshot for the dashboard — one row per provider×feature. */
  snapshot(): CostBucket[] {
    return Array.from(this.buckets.values()).map((b) => ({ ...b }));
  }

  /** Total USD across all providers/features. */
  totalUsd(): number {
    return this.snapshot().reduce((sum, b) => sum + b.costUsd, 0);
  }

  /** Forward each usage event to a metering sink. */
  onUsage(sub: Subscriber): () => void {
    this.subscribers.push(sub);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== sub);
    };
  }

  reset(): void {
    this.buckets.clear();
  }
}

/** Process-wide singleton — clients record into this; the dashboard reads it. */
export const costTracker = new CostTracker();
