import "server-only";

// ---------------------------------------------------------------------------
// LLM Call Observability — Langfuse / Helicone / console backends
// Records every LLM call with tokens, cost, latency, and feature attribution.
// ---------------------------------------------------------------------------

export interface LlmCallRecord {
  traceId: string;
  model: string;
  provider: "anthropic" | "openai";
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  costUsd: number;
  feature: string;
  userId?: string;
  timestamp: string;
}

export interface LlmObservabilityConfig {
  backend: "langfuse" | "helicone" | "console";
  apiKey?: string;
  publicKey?: string;
  baseUrl?: string;
}

// ---------------------------------------------------------------------------
// Environment-driven configs
// ---------------------------------------------------------------------------

export const LANGFUSE_CONFIG: LlmObservabilityConfig = {
  backend: "langfuse",
  apiKey: process.env.LANGFUSE_SECRET_KEY,
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  baseUrl: process.env.LANGFUSE_BASEURL ?? "https://cloud.langfuse.com",
};

export const HELICONE_CONFIG: LlmObservabilityConfig = {
  backend: "helicone",
  apiKey: process.env.HELICONE_API_KEY,
  baseUrl: process.env.HELICONE_BASEURL ?? "https://api.helicone.ai",
};

function resolveConfig(): LlmObservabilityConfig {
  if (process.env.LANGFUSE_SECRET_KEY) return LANGFUSE_CONFIG;
  if (process.env.HELICONE_API_KEY) return HELICONE_CONFIG;
  return { backend: "console" };
}

// ---------------------------------------------------------------------------
// Cost session store (in-memory, per process)
// ---------------------------------------------------------------------------

interface SessionCost {
  totalUsd: number;
  records: LlmCallRecord[];
}

const sessionStore = new Map<string, SessionCost>();

// ---------------------------------------------------------------------------
// LlmObservability class
// ---------------------------------------------------------------------------

export class LlmObservability {
  private readonly config: LlmObservabilityConfig;

  constructor(config?: LlmObservabilityConfig) {
    this.config = config ?? resolveConfig();
  }

  /** Record an LLM call and ship to the configured backend (fire-and-forget). */
  record(call: LlmCallRecord): void {
    // Update in-process session store
    const existing = sessionStore.get(call.traceId) ?? { totalUsd: 0, records: [] };
    existing.totalUsd += call.costUsd;
    existing.records.push(call);
    sessionStore.set(call.traceId, existing);

    this._ship(call).catch(() => {
      // Observability must never crash the app — silently drop on error.
    });
  }

  /** Return the total USD cost attributed to a trace session. */
  getSessionCosts(traceId: string): number {
    return sessionStore.get(traceId)?.totalUsd ?? 0;
  }

  /** Aggregate all recorded calls into a daily cost summary (last 24h by timestamp). */
  getDailyCostSummary(): { date: string; totalUsd: number; byModel: Record<string, number> } {
    const date = new Date().toISOString().slice(0, 10);
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;

    let totalUsd = 0;
    const byModel: Record<string, number> = {};

    for (const session of sessionStore.values()) {
      for (const r of session.records) {
        if (new Date(r.timestamp).getTime() < cutoff) continue;
        totalUsd += r.costUsd;
        byModel[r.model] = (byModel[r.model] ?? 0) + r.costUsd;
      }
    }

    return { date, totalUsd, byModel };
  }

  // -------------------------------------------------------------------------
  // Private
  // -------------------------------------------------------------------------

  private async _ship(call: LlmCallRecord): Promise<void> {
    const { backend, apiKey, publicKey, baseUrl } = this.config;

    if (backend === "console") {
      console.log(JSON.stringify({ event: "llm_call", ...call }));
      return;
    }

    if (backend === "langfuse" && apiKey && publicKey) {
      const credentials = Buffer.from(`${publicKey}:${apiKey}`).toString("base64");
      await fetch(`${baseUrl}/api/public/generations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify({
          traceId: call.traceId,
          name: call.feature,
          model: call.model,
          usage: {
            promptTokens: call.promptTokens,
            completionTokens: call.completionTokens,
          },
          metadata: {
            provider: call.provider,
            costUsd: call.costUsd,
            latencyMs: call.latencyMs,
            userId: call.userId,
          },
          startTime: call.timestamp,
        }),
      });
      return;
    }

    if (backend === "helicone" && apiKey) {
      await fetch(`${baseUrl}/oai/v1/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Helicone-Auth": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          providerRequest: {
            url: `https://api.${call.provider}.com/v1/chat/completions`,
            json: { model: call.model },
            meta: { "Helicone-Property-Feature": call.feature },
          },
          providerResponse: {
            json: {
              usage: {
                prompt_tokens: call.promptTokens,
                completion_tokens: call.completionTokens,
              },
            },
            status: 200,
            headers: {},
          },
          timing: {
            startTime: { seconds: Math.floor(new Date(call.timestamp).getTime() / 1000), milliseconds: 0 },
            endTime: { seconds: Math.floor((new Date(call.timestamp).getTime() + call.latencyMs) / 1000), milliseconds: 0 },
          },
        }),
      });
    }
  }
}

/** Singleton — import and call `llmObservability.record()` in LLM feature handlers. */
export const llmObservability = new LlmObservability();
