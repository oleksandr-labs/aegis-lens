/**
 * Provider outage failover routing.
 *
 * Ordered failover: Anthropic → OpenAI → open-weights. Tracks per-provider health
 * with a simple circuit breaker (consecutive failures → cooldown), skips
 * configured-but-unhealthy providers, and falls through the chain on error.
 *
 * "Never single-provider": the router is the runtime enforcement of that policy —
 * if the primary is down or unconfigured, traffic transparently moves to the next.
 */

import type {
  CompletionOptions,
  CompletionResult,
  LlmMessage,
  LlmProvider,
  ProviderHealth,
  ProviderId,
  StreamChunk,
} from "./types";
import { anthropicProvider } from "./anthropic-client";
import { openaiProvider } from "./openai-client";
import { openweightsProvider } from "./openweights-client";

const DEFAULT_ORDER: ProviderId[] = ["anthropic", "openai", "openweights"];
const FAILURE_THRESHOLD = 3;
const COOLDOWN_MS = 30_000;

export interface RouterOptions {
  /** Override the failover order. */
  order?: ProviderId[];
  providers?: Partial<Record<ProviderId, LlmProvider>>;
}

export class FailoverRouter {
  private readonly providers: Record<ProviderId, LlmProvider>;
  private readonly order: ProviderId[];
  private health = new Map<ProviderId, ProviderHealth>();

  constructor(opts: RouterOptions = {}) {
    this.providers = {
      anthropic: opts.providers?.anthropic ?? anthropicProvider,
      openai: opts.providers?.openai ?? openaiProvider,
      openweights: opts.providers?.openweights ?? openweightsProvider,
    };
    this.order = opts.order ?? DEFAULT_ORDER;
    for (const id of this.order) {
      this.health.set(id, {
        provider: id,
        healthy: true,
        consecutiveFailures: 0,
        lastCheckedAt: new Date().toISOString(),
      });
    }
  }

  /** Providers eligible right now: configured, not in open-circuit cooldown. */
  private candidates(tenantId?: string): ProviderId[] {
    const now = Date.now();
    return this.order.filter((id) => {
      const p = this.providers[id];
      if (!p.isConfigured(tenantId)) return false;
      const h = this.health.get(id);
      if (h?.cooldownUntil && h.cooldownUntil > now) return false;
      return true;
    });
  }

  private markSuccess(id: ProviderId): void {
    this.health.set(id, {
      provider: id,
      healthy: true,
      consecutiveFailures: 0,
      lastCheckedAt: new Date().toISOString(),
    });
  }

  private markFailure(id: ProviderId, err: unknown): void {
    const h = this.health.get(id);
    const fails = (h?.consecutiveFailures ?? 0) + 1;
    this.health.set(id, {
      provider: id,
      healthy: fails < FAILURE_THRESHOLD,
      consecutiveFailures: fails,
      lastError: err instanceof Error ? err.message : String(err),
      lastCheckedAt: new Date().toISOString(),
      cooldownUntil: fails >= FAILURE_THRESHOLD ? Date.now() + COOLDOWN_MS : undefined,
    });
  }

  /** Complete with failover. Throws only if every candidate fails. */
  async complete(
    messages: LlmMessage[],
    opts: CompletionOptions = {},
  ): Promise<CompletionResult> {
    const candidates = this.candidates(opts.tenantId);
    if (candidates.length === 0) {
      // No live provider — fall back to the primary's deterministic fake-mode.
      return this.providers[this.order[0]].complete(messages, opts);
    }
    let lastErr: unknown;
    for (const id of candidates) {
      try {
        const r = await this.providers[id].complete(messages, opts);
        this.markSuccess(id);
        return r;
      } catch (err) {
        this.markFailure(id, err);
        lastErr = err;
      }
    }
    throw new Error(
      `All providers failed (${candidates.join(", ")}). Last: ${
        lastErr instanceof Error ? lastErr.message : String(lastErr)
      }`,
    );
  }

  /**
   * Stream with failover. Failover happens at stream-OPEN: once the first chunk
   * is yielded we're committed to that provider (can't replay a partial stream).
   */
  async *stream(
    messages: LlmMessage[],
    opts: CompletionOptions = {},
  ): AsyncGenerator<StreamChunk> {
    const candidates = this.candidates(opts.tenantId);
    if (candidates.length === 0) {
      yield* this.providers[this.order[0]].stream(messages, opts);
      return;
    }
    let lastErr: unknown;
    for (const id of candidates) {
      const provider = this.providers[id];
      const iterator = provider.stream(messages, opts)[Symbol.asyncIterator]();
      try {
        // Pull the first chunk under try/catch so an open-time failure fails over.
        const first = await iterator.next();
        this.markSuccess(id);
        if (!first.done) yield first.value;
        for (;;) {
          const next = await iterator.next();
          if (next.done) return;
          yield next.value;
        }
      } catch (err) {
        this.markFailure(id, err);
        lastErr = err;
        // Try the next provider from scratch.
      }
    }
    throw new Error(
      `All providers failed to stream (${candidates.join(", ")}). Last: ${
        lastErr instanceof Error ? lastErr.message : String(lastErr)
      }`,
    );
  }

  /** Current health snapshot for an ops dashboard. */
  healthSnapshot(): ProviderHealth[] {
    return this.order.map((id) => ({ ...(this.health.get(id) as ProviderHealth) }));
  }

  /** Manually clear a provider's circuit (e.g. after an incident is resolved). */
  resetHealth(id: ProviderId): void {
    this.markSuccess(id);
  }
}

/** Default router wired with the three providers in the standard order. */
export const defaultRouter = new FailoverRouter();
