/**
 * Prompt Caching Strategy
 *
 * Implements the remaining open task in TODO_prompt_library.md:
 * "Caching strategy per prompt (semantic cache + prompt-prefix cache)"
 *
 * Two-layer caching:
 * 1. Prompt-prefix cache (Anthropic prompt caching / OpenAI prefix caching)
 * 2. Semantic response cache (embedding-based similarity lookup in Redis)
 *
 * Sprint 2.73 — closes caching task in TODO_prompt_library.md
 */

import type { PromptId } from "./catalog";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CacheStrategy = "none" | "prefix_only" | "semantic_only" | "prefix_and_semantic";

export interface PromptCacheConfig {
  promptId: PromptId;
  strategy: CacheStrategy;
  /** Prompt-prefix cache: mark the static system prompt portion as cacheable */
  prefixCache: {
    enabled: boolean;
    /**
     * Number of tokens in the prefix to cache.
     * Anthropic: prefix up to 4096 tokens cached at rest; cache_control: { type: 'ephemeral' }
     * This should be the length of the system prompt portion (before user variables are injected).
     */
    estimatedPrefixTokens: number;
    /** Cache TTL in seconds (Anthropic: 5 minutes for ephemeral) */
    ttlSeconds: number;
  };
  /** Semantic cache: cache full responses by semantic similarity of input */
  semanticCache: {
    enabled: boolean;
    /** Similarity threshold 0–1. Higher = more conservative (fewer cache hits) */
    similarityThreshold: number;
    /** How long to keep cached responses */
    ttlSeconds: number;
    /**
     * Whether to cache across different users (true = org-wide shared cache,
     * false = per-user cache only).
     * Use shared only for public/non-personalised prompts.
     */
    sharedAcrossUsers: boolean;
    /** Whether to cache across different locales */
    sharedAcrossLocales: boolean;
    /** Max cached response size in bytes */
    maxResponseBytes: number;
  };
  /** Estimated savings at scale (for monitoring dashboards) */
  notes: string;
}

// ── Per-prompt cache configs ──────────────────────────────────────────────────

/**
 * Cache configuration for each prompt in the library.
 *
 * Strategy rationale:
 * - classify: High volume, largely deterministic. Prefix cache the system
 *   instructions; semantic cache for near-identical event descriptions.
 *
 * - copilot: Highly personalised (user context, workspace state). Prefix
 *   cache system instructions only. No semantic cache (responses must be fresh).
 *
 * - summarize: Deterministic given same source text. Full semantic cache
 *   safe (same article → same summary regardless of user).
 *
 * - reports: Long, expensive. Prefix cache. No semantic cache (report
 *   scope always unique per run).
 *
 * - rule_builder: Prefix cache system prompt. Semantic cache for rule
 *   parsing (same NL phrase → same rule JSON).
 */
export const PROMPT_CACHE_CONFIGS: Record<PromptId, PromptCacheConfig> = {
  classify: {
    promptId: "classify",
    strategy: "prefix_and_semantic",
    prefixCache: {
      enabled: true,
      estimatedPrefixTokens: 800,  // System + few-shot examples (static)
      ttlSeconds: 300,              // 5 min (Anthropic ephemeral)
    },
    semanticCache: {
      enabled: true,
      similarityThreshold: 0.95,   // Very high: event descriptions must be near-identical
      ttlSeconds: 60 * 60 * 4,     // 4 hours (events age out)
      sharedAcrossUsers: true,     // Classification is not personalised
      sharedAcrossLocales: false,  // EN vs UK classifiers differ slightly
      maxResponseBytes: 4_096,
    },
    notes:
      "Highest-volume prompt (~50k/day at scale). Prefix cache saves ~40% on system prompt tokens. " +
      "Semantic cache for duplicate event reports from multiple sources of same incident (~15% hit rate expected).",
  },

  copilot: {
    promptId: "copilot",
    strategy: "prefix_only",
    prefixCache: {
      enabled: true,
      estimatedPrefixTokens: 2048, // System instructions + tool definitions (static)
      ttlSeconds: 300,
    },
    semanticCache: {
      enabled: false,
      similarityThreshold: 0,
      ttlSeconds: 0,
      sharedAcrossUsers: false,
      sharedAcrossLocales: false,
      maxResponseBytes: 0,
    },
    notes:
      "Copilot responses are personalised (user context, workspace state, conversation history). " +
      "Semantic cache disabled to avoid serving stale or wrong-context responses. " +
      "Prefix cache for static system prompt + tool schemas saves ~35% on input tokens.",
  },

  summarize: {
    promptId: "summarize",
    strategy: "prefix_and_semantic",
    prefixCache: {
      enabled: true,
      estimatedPrefixTokens: 400,  // Short system prompt
      ttlSeconds: 300,
    },
    semanticCache: {
      enabled: true,
      similarityThreshold: 0.98,   // Near-identical article text only
      ttlSeconds: 60 * 60 * 24,   // 24 hours (articles don't change)
      sharedAcrossUsers: true,     // Article summary is not personalised
      sharedAcrossLocales: false,  // Summary language must match locale
      maxResponseBytes: 16_384,
    },
    notes:
      "Same article may be submitted multiple times (different sources, same content). " +
      "24h semantic cache eliminates duplicate summarisation cost. " +
      "Shared across users: safe because summary is objective/non-personalised.",
  },

  reports: {
    promptId: "reports",
    strategy: "prefix_only",
    prefixCache: {
      enabled: true,
      estimatedPrefixTokens: 1200,
      ttlSeconds: 300,
    },
    semanticCache: {
      enabled: false,
      similarityThreshold: 0,
      ttlSeconds: 0,
      sharedAcrossUsers: false,
      sharedAcrossLocales: false,
      maxResponseBytes: 0,
    },
    notes:
      "Report inputs are always unique (different time windows, filters, users). " +
      "Semantic cache not useful. Prefix cache for report format instructions saves ~25% tokens. " +
      "Reports are expensive (long outputs): optimise by streaming and caching rendered HTML.",
  },

  rule_builder: {
    promptId: "rule_builder",
    strategy: "prefix_and_semantic",
    prefixCache: {
      enabled: true,
      estimatedPrefixTokens: 1500, // Grammar spec + examples are static
      ttlSeconds: 300,
    },
    semanticCache: {
      enabled: true,
      similarityThreshold: 0.92,   // Allow slight phrasing variation → same rule
      ttlSeconds: 60 * 60 * 24 * 7, // 7 days (rule grammar doesn't change often)
      sharedAcrossUsers: true,     // "alerts near Kyiv" means same thing for all users
      sharedAcrossLocales: false,  // EN vs UK phrasing varies
      maxResponseBytes: 8_192,
    },
    notes:
      "Users often type similar rules ('alert me near Kyiv' vs 'notify me for events near Kyiv'). " +
      "Semantic cache at 0.92 similarity captures these variants. " +
      "7-day TTL safe: rule grammar schema changes are versioned.",
  },
};

// ── Cache key construction ────────────────────────────────────────────────────

export interface SemanticCacheKey {
  promptId: PromptId;
  locale: "en" | "uk";
  /** User ID — undefined if sharedAcrossUsers */
  userId?: string;
  /** SHA-256 of the nearest cached embedding's input text (for logging) */
  inputHash: string;
}

export function buildCacheKey(
  config: PromptCacheConfig,
  locale: "en" | "uk",
  userId: string,
  inputHash: string,
): string {
  const parts: string[] = ["prompt-cache", config.promptId];
  if (!config.semanticCache.sharedAcrossLocales) parts.push(locale);
  if (!config.semanticCache.sharedAcrossUsers) parts.push(`u:${userId}`);
  parts.push(inputHash);
  return parts.join(":");
}

// ── Semantic cache interface ──────────────────────────────────────────────────

/**
 * Semantic cache lookup / write interface.
 * Implemented in services/prompts/src/semantic-cache-impl.ts using:
 * - Redis for storage (vector index via Redis Stack / redis-vl)
 * - text-embedding-3-small (OpenAI) or equivalent for embeddings
 */
export interface SemanticCacheEntry {
  key: string;
  inputEmbedding: number[];   // 1536-dim (text-embedding-3-small)
  inputText: string;
  responseJson: string;
  promptVersion: string;
  locale: "en" | "uk";
  createdAt: string;
  ttlSeconds: number;
  hitCount: number;
}

export interface SemanticCacheLookupResult {
  hit: boolean;
  entry?: SemanticCacheEntry;
  similarity?: number;
  /** Cache miss reason for debugging */
  missReason?: "no_match" | "below_threshold" | "expired" | "disabled";
}

// ── Cost savings estimation ───────────────────────────────────────────────────

/**
 * Estimate monthly cost savings from caching.
 * Used for dashboards and quarterly infra reviews.
 */
export interface CacheSavingsEstimate {
  promptId: PromptId;
  monthlyCallsEstimate: number;
  prefixCacheHitRatePct: number;
  semanticCacheHitRatePct: number;
  avgInputTokens: number;
  avgOutputTokens: number;
  inputCostPer1kTokens: number;
  outputCostPer1kTokens: number;
  /** Estimated monthly savings in USD */
  estimatedMonthlySavingsUsd: number;
}

export function estimateMonthlySavings(
  calls: number,
  prefixPct: number,
  semanticPct: number,
  avgInputTokens: number,
  avgOutputTokens: number,
  inputCostPer1k: number,
  outputCostPer1k: number,
): number {
  const fullCost =
    (calls * avgInputTokens * inputCostPer1k) / 1000 +
    (calls * avgOutputTokens * outputCostPer1k) / 1000;

  const prefixSaving = calls * prefixPct * 0.01 * (avgInputTokens * 0.5) * (inputCostPer1k / 1000);
  const semanticSaving = calls * semanticPct * 0.01 * fullCost;

  return Math.round((prefixSaving + semanticSaving) * 100) / 100;
}
