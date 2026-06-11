/**
 * OAuth 2.0 configuration — grant types, scopes, client registry, and endpoint constants.
 * Конфігурація OAuth 2.0 — типи надання прав, scope-и, реєстр клієнтів та константи ендпоінтів.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type OAuth2GrantType =
  | "authorization_code"
  | "client_credentials"
  | "refresh_token";

export type OAuth2Scope =
  | "read:events"
  | "read:reports"
  | "write:cases"
  | "write:alerts"
  | "admin"
  | "stream:events";

export interface OAuth2Client {
  clientId: string;
  clientName: string;
  clientNameUk: string;
  allowedGrantTypes: OAuth2GrantType[];
  allowedScopes: OAuth2Scope[];
  redirectUris: string[];
  /** Public clients (e.g. SPAs) must use PKCE; confidential clients use client_secret */
  isPublic: boolean;
}

// ── Endpoints ─────────────────────────────────────────────────────────────────

export const OAUTH2_ENDPOINTS = {
  authorize: "/api/oauth/authorize",
  token: "/api/oauth/token",
  revoke: "/api/oauth/revoke",
  introspect: "/api/oauth/introspect",
} as const;

// ── Notes ─────────────────────────────────────────────────────────────────────

/** RFC 6749 compliant — full Authorization Code and Client Credentials flows */
export const OAUTH2_NOTE_RFC_EN =
  "RFC 6749 compliant — implements Authorization Code flow (for user-delegated access) and Client Credentials flow (for server-to-server API access); implicit flow is not supported.";
export const OAUTH2_NOTE_RFC_UK =
  "Відповідає RFC 6749 — реалізує Authorization Code flow (для делегованого доступу від імені користувача) та Client Credentials flow (для міжсерверного доступу до API); implicit flow не підтримується.";

/** PKCE required for public clients — prevents authorization code interception */
export const OAUTH2_NOTE_PKCE_EN =
  "PKCE required for public clients — all public clients (SPAs, mobile apps) must use PKCE (RFC 7636) with S256 code challenge; plain challenge method is rejected.";
export const OAUTH2_NOTE_PKCE_UK =
  "PKCE обов'язковий для публічних клієнтів — всі публічні клієнти (SPA, мобільні додатки) повинні використовувати PKCE (RFC 7636) з методом S256; метод plain відхиляється.";

/** Token expiry: access token 1h, refresh token 30 days */
export const OAUTH2_NOTE_EXPIRY_EN =
  "Token expiry — access tokens expire after 1 hour; refresh tokens expire after 30 days of inactivity; refresh tokens are rotated on each use (RFC 6749 §10.4).";
export const OAUTH2_NOTE_EXPIRY_UK =
  "Термін дії токенів — access-токени дійсні 1 годину; refresh-токени закінчуються після 30 днів неактивності; refresh-токени ротуються при кожному використанні (RFC 6749 §10.4).";

/** Third-party apps — OAuth is the gateway for all marketplace integrations */
export const OAUTH2_NOTE_THIRD_PARTY_EN =
  "Third-party apps — OAuth 2.0 is the gateway for all marketplace integrations and developer apps; each app must be reviewed before receiving production client credentials.";
export const OAUTH2_NOTE_THIRD_PARTY_UK =
  "Сторонні додатки — OAuth 2.0 є шлюзом для всіх інтеграцій маркетплейсу та developer-додатків; кожен додаток повинен пройти перевірку перед отриманням виробничих облікових даних клієнта.";

export const OAUTH2_NOTES_EN = [
  OAUTH2_NOTE_RFC_EN,
  OAUTH2_NOTE_PKCE_EN,
  OAUTH2_NOTE_EXPIRY_EN,
  OAUTH2_NOTE_THIRD_PARTY_EN,
];
export const OAUTH2_NOTES_UK = [
  OAUTH2_NOTE_RFC_UK,
  OAUTH2_NOTE_PKCE_UK,
  OAUTH2_NOTE_EXPIRY_UK,
  OAUTH2_NOTE_THIRD_PARTY_UK,
];

// ── Client store ──────────────────────────────────────────────────────────────

/**
 * In-memory OAuth 2.0 client registry.
 * Реєстр клієнтів OAuth 2.0 в пам'яті.
 */
export class OAuth2ClientStore {
  private readonly clients = new Map<string, OAuth2Client>();

  /** Register a new OAuth 2.0 client. */
  register(client: OAuth2Client): void {
    this.clients.set(client.clientId, client);
  }

  /** Look up a client by its clientId. */
  get(clientId: string): OAuth2Client | undefined {
    return this.clients.get(clientId);
  }

  /** Remove a client registration. */
  revoke(clientId: string): boolean {
    return this.clients.delete(clientId);
  }

  /** List all registered clients. */
  listAll(): OAuth2Client[] {
    return Array.from(this.clients.values());
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global in-memory OAuth 2.0 client registry singleton. */
export const oauth2ClientStore = new OAuth2ClientStore();
