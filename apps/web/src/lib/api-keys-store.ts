import "server-only";
import { randomUUID, createHash } from "crypto";

export interface ApiKey {
  id: string;
  name: string;
  /** SHA-256 hash of the raw key — never store raw */
  keyHash: string;
  /** Last 4 chars of raw key for display */
  keySuffix: string;
  ownerId: string;
  orgId: string;
  /** ISO 8601 */
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  /** Scopes this key is allowed to use */
  scopes: string[];
  isActive: boolean;
}

export interface ApiKeyCreateResult {
  key: ApiKey;
  /** The raw key — shown once only at creation */
  rawKey: string;
}

const store = new Map<string, ApiKey>();

function hashKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

function generateRawKey(): string {
  // Format: ak_<24 random chars>
  const bytes = randomUUID().replace(/-/g, "").slice(0, 24);
  return `ak_${bytes}`;
}

export const ALL_SCOPES = [
  "events:read",
  "events:write",
  "alerts:read",
  "alerts:write",
  "aois:read",
  "aois:write",
  "cases:read",
  "cases:write",
  "webhooks:read",
  "webhooks:write",
  "search:read",
  "copilot:read",
  "export:read",
] as const;

export type ApiScope = typeof ALL_SCOPES[number];

export function listApiKeys(ownerId: string): ApiKey[] {
  return Array.from(store.values())
    .filter((k) => k.ownerId === ownerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getApiKeyById(id: string): ApiKey | undefined {
  return store.get(id);
}

export function getApiKeyByHash(hash: string): ApiKey | undefined {
  return Array.from(store.values()).find((k) => k.keyHash === hash);
}

export function lookupApiKey(rawKey: string): ApiKey | undefined {
  const hash = hashKey(rawKey);
  const key = getApiKeyByHash(hash);
  if (!key || !key.isActive) return undefined;
  if (key.expiresAt && new Date(key.expiresAt) < new Date()) return undefined;
  // Update lastUsedAt
  key.lastUsedAt = new Date().toISOString();
  return key;
}

export function createApiKey(opts: {
  name: string;
  ownerId: string;
  orgId: string;
  scopes?: string[];
  expiresInDays?: number;
}): ApiKeyCreateResult {
  const rawKey = generateRawKey();
  const keyHash = hashKey(rawKey);
  const keySuffix = rawKey.slice(-4);
  const now = new Date().toISOString();
  const expiresAt = opts.expiresInDays
    ? new Date(Date.now() + opts.expiresInDays * 86_400_000).toISOString()
    : null;

  const key: ApiKey = {
    id: randomUUID(),
    name: opts.name,
    keyHash,
    keySuffix,
    ownerId: opts.ownerId,
    orgId: opts.orgId,
    createdAt: now,
    lastUsedAt: null,
    expiresAt,
    scopes: opts.scopes ?? ["events:read", "search:read"],
    isActive: true,
  };

  store.set(key.id, key);
  return { key, rawKey };
}

export function revokeApiKey(id: string): boolean {
  const key = store.get(id);
  if (!key) return false;
  key.isActive = false;
  return true;
}

export function deleteApiKey(id: string): boolean {
  return store.delete(id);
}
