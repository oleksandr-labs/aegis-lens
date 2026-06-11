/**
 * Per-customer Bring-Your-Own-Key (enterprise).
 *
 * Enterprise tenants can supply their own provider API keys so their LLM traffic
 * is billed to (and governed by) their own provider account. Resolution order:
 *
 *   1. A registered per-tenant key for the requested provider, if present.
 *   2. The platform's env-var fallback (shared key).
 *
 * NO SECRETS IN CODE. Per-tenant keys are injected at runtime by the host
 * (e.g. from a secrets manager) via {@link registerTenantKey}; the platform
 * fallback is read from process.env. Keys are never logged.
 */

import type { ProviderId } from "./types";

export interface ProviderKey {
  apiKey: string;
  /** Optional override base URL (e.g. tenant's Azure/OpenAI-compatible gateway). */
  baseUrl?: string;
}

/** tenantId -> provider -> key. In-memory; host repopulates on boot. */
const tenantKeys = new Map<string, Partial<Record<ProviderId, ProviderKey>>>();

/** Register (or replace) a tenant's key for one provider. */
export function registerTenantKey(
  tenantId: string,
  provider: ProviderId,
  key: ProviderKey,
): void {
  const existing = tenantKeys.get(tenantId) ?? {};
  existing[provider] = key;
  tenantKeys.set(tenantId, existing);
}

/** Remove a tenant's key (offboarding / rotation). */
export function revokeTenantKey(tenantId: string, provider?: ProviderId): void {
  if (!provider) {
    tenantKeys.delete(tenantId);
    return;
  }
  const existing = tenantKeys.get(tenantId);
  if (existing) delete existing[provider];
}

const ENV_KEY: Record<ProviderId, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  // HF token OR a self-hosted vLLM endpoint (key may be empty for an internal vLLM).
  openweights: "HUGGINGFACE_API_KEY",
};

const ENV_BASE_URL: Partial<Record<ProviderId, string>> = {
  openai: "OPENAI_BASE_URL",
  openweights: "OPENWEIGHTS_BASE_URL",
};

/**
 * Resolve the effective key for a provider, preferring the tenant's BYOK key,
 * falling back to the platform env key. Returns null when neither is set.
 */
export function resolveKey(
  provider: ProviderId,
  tenantId?: string,
): ProviderKey | null {
  if (tenantId) {
    const byok = tenantKeys.get(tenantId)?.[provider];
    if (byok?.apiKey) return byok;
  }
  const envKey = process.env[ENV_KEY[provider]];
  const envBaseEnv = ENV_BASE_URL[provider];
  const baseUrl = envBaseEnv ? process.env[envBaseEnv] : undefined;
  if (envKey) return { apiKey: envKey, baseUrl };
  // Open-weights may be a keyless internal vLLM reachable purely via base URL.
  if (provider === "openweights" && baseUrl) return { apiKey: "", baseUrl };
  return null;
}

/** True when a usable key (or keyless vLLM endpoint) exists for this provider. */
export function hasKey(provider: ProviderId, tenantId?: string): boolean {
  return resolveKey(provider, tenantId) !== null;
}
