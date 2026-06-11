/**
 * Tiered model selection — fast/cheap default, premium on-demand.
 *
 * Three tiers balance cost vs. quality for different features and user plans:
 *   fast     — claude-haiku-4-5  (sub-second, low cost)
 *   balanced — claude-sonnet-4-6  (recommended default)
 *   premium  — claude-opus-4-8    (highest capability, reserved for paid users)
 *
 * The selectModelTier function encodes the feature × user-tier mapping.
 * Cost estimates use simplified per-token pricing for budgeting purposes.
 */

export type ModelTier = "fast" | "balanced" | "premium";

export interface ModelConfig {
  tier: ModelTier;
  provider: string;
  /** Canonical model identifier passed to the API. */
  model: string;
  /** Approximate cost in USD per output token (blended input+output estimate). */
  costPerToken: number;
  /** Approximate median latency in milliseconds per output token. */
  avgLatencyMs: number;
  /** Maximum context window in tokens. */
  maxContextTokens: number;
}

export const MODEL_TIER_CONFIG: Record<ModelTier, ModelConfig> = {
  fast: {
    tier: "fast",
    provider: "anthropic",
    model: "claude-haiku-4-5-20251001",
    costPerToken: 0.00008,
    avgLatencyMs: 1,
    maxContextTokens: 200_000,
  },
  balanced: {
    tier: "balanced",
    provider: "anthropic",
    model: "claude-sonnet-4-6",
    costPerToken: 0.0003,
    avgLatencyMs: 2,
    maxContextTokens: 200_000,
  },
  premium: {
    tier: "premium",
    provider: "anthropic",
    model: "claude-opus-4-8",
    costPerToken: 0.0015,
    avgLatencyMs: 5,
    maxContextTokens: 200_000,
  },
};

/**
 * Feature × user-tier → model tier mapping.
 *
 * Format: `feature:userTier` → ModelTier
 * Wildcard `feature:*` applies to any user tier not explicitly listed.
 */
const TIER_ROUTING: Record<string, ModelTier> = {
  // Copilot chat
  "copilot:free": "fast",
  "copilot:pro": "balanced",
  "copilot:enterprise": "premium",

  // Report generation
  "report-generate:free": "fast",
  "report-generate:pro": "premium",
  "report-generate:enterprise": "premium",

  // Event classification (automated pipeline — cost-sensitive)
  "event-classify:*": "fast",

  // Source summarisation
  "source-summarise:free": "fast",
  "source-summarise:pro": "balanced",
  "source-summarise:enterprise": "balanced",

  // Investigation assistant
  "investigation-assist:free": "fast",
  "investigation-assist:pro": "balanced",
  "investigation-assist:enterprise": "premium",

  // Translation (automated, high volume)
  "translate:*": "fast",

  // Geolocation reasoning
  "geo-reason:free": "fast",
  "geo-reason:pro": "balanced",
  "geo-reason:enterprise": "premium",

  // Search query expansion
  "search-expand:*": "fast",

  // Alert explanation
  "alert-explain:*": "balanced",
};

/**
 * Select the appropriate model tier for a feature and user tier.
 *
 * Checks `feature:userTier` first, then falls back to `feature:*`.
 * Defaults to `balanced` if no mapping is found.
 */
export function selectModelTier(feature: string, userTier: string): ModelTier {
  const specific = TIER_ROUTING[`${feature}:${userTier}`];
  if (specific) return specific;

  const wildcard = TIER_ROUTING[`${feature}:*`];
  if (wildcard) return wildcard;

  return "balanced";
}

/**
 * Estimate the cost in USD for a single inference request.
 *
 * Uses separate input and output token pricing ratios.
 * Input tokens are typically ~3× cheaper than output tokens for Anthropic models.
 *
 * @param tier             - Model tier
 * @param promptTokens     - Number of prompt (input) tokens
 * @param completionTokens - Number of completion (output) tokens
 */
export function estimateCost(
  tier: ModelTier,
  promptTokens: number,
  completionTokens: number
): number {
  const config = MODEL_TIER_CONFIG[tier];
  // Input tokens cost ~1/3 of output tokens (approximate ratio)
  const inputCostPerToken = config.costPerToken / 3;
  const outputCostPerToken = config.costPerToken;
  return inputCostPerToken * promptTokens + outputCostPerToken * completionTokens;
}
