/**
 * SSO / SAML / OIDC configuration store.
 *
 * Supports: SAML 2.0, OIDC, Google Workspace, Microsoft Entra ID,
 *           Okta, Auth0, and WorkOS (recommended production gateway).
 *
 * WorkOS is the default enterprise provider — it acts as a unified
 * SSO gateway so we don't need to re-implement SAML/OIDC per IdP.
 * See: apps/web/src/lib/auth/provider.ts (AUTH_PROVIDER=workos).
 *
 * Конфігурація SSO: SAML / OIDC / Google Workspace / Entra / Okta / Auth0 / WorkOS.
 */

import "server-only";

// ── Provider types ─────────────────────────────────────────────────────────────

export type SsoProvider =
  | "saml"
  | "oidc"
  | "google-workspace"
  | "microsoft-entra"
  | "okta"
  | "auth0"
  | "workos";

// ── SAML 2.0 config ───────────────────────────────────────────────────────────

export interface SamlConfig {
  /** SP Entity ID (URI the IdP uses to identify us). */
  entityId: string;
  /** IdP SSO endpoint URL. */
  ssoUrl: string;
  /** IdP X.509 certificate (PEM, without headers). */
  certificate: string;
  /** Whether to sign outbound AuthnRequests. */
  signRequest: boolean;
  /** NameID format, e.g. urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress */
  nameIdFormat: string;
  /** Maps SAML attributes to internal user fields (key=internal, value=SAML attr). */
  attributeMapping: Record<string, string>;
}

// ── OIDC config ───────────────────────────────────────────────────────────────

export interface OidcConfig {
  /** Issuer URL (discovery doc at <issuer>/.well-known/openid-configuration). */
  issuer: string;
  /** OAuth client ID. */
  clientId: string;
  /** OAuth client secret (server-side only; omit for public PKCE clients). */
  clientSecret?: string;
  /** Requested scopes, e.g. ['openid', 'profile', 'email']. */
  scopes: string[];
  /** Callback URI registered with the IdP. */
  redirectUri: string;
  /** Whether to use PKCE (Proof Key for Code Exchange). */
  pkce: boolean;
}

// ── SSO Connection ────────────────────────────────────────────────────────────

export interface SsoConnection {
  orgId: string;
  provider: SsoProvider;
  samlConfig?: SamlConfig;
  oidcConfig?: OidcConfig;
  /** Email domains that this connection covers (e.g. ["acme.com"]). */
  domains: string[];
  isActive: boolean;
  /** Redirect all users from matching domains through this SSO connection. */
  enforceForDomain: boolean;
  createdAt: string;
}

// ── Store ─────────────────────────────────────────────────────────────────────

/**
 * In-memory SSO connection store.
 * Replace backing with DB (e.g. Postgres via Prisma) for production.
 *
 * Зберігає SSO-з'єднання по orgId та домену; singleton.
 */
export class SsoConnectionStore {
  private readonly byOrg = new Map<string, SsoConnection>();
  private readonly byDomain = new Map<string, string>(); // domain -> orgId

  /** Persist a new SSO connection (upsert by orgId). */
  create(conn: SsoConnection): void {
    this.byOrg.set(conn.orgId, conn);
    for (const domain of conn.domains) {
      this.byDomain.set(domain.toLowerCase(), conn.orgId);
    }
  }

  /** Retrieve connection for a given org, or null if not found. */
  getByOrg(orgId: string): SsoConnection | null {
    return this.byOrg.get(orgId) ?? null;
  }

  /**
   * Retrieve connection by email domain, or null.
   * E.g. "acme.com" → resolves to the connection configured for that domain.
   */
  getByDomain(domain: string): SsoConnection | null {
    const orgId = this.byDomain.get(domain.toLowerCase());
    if (!orgId) return null;
    return this.byOrg.get(orgId) ?? null;
  }

  /** Enable an SSO connection so users are redirected through it. */
  activate(orgId: string): void {
    const conn = this.byOrg.get(orgId);
    if (conn) this.byOrg.set(orgId, { ...conn, isActive: true });
  }

  /** Disable an SSO connection (fallback to password auth). */
  deactivate(orgId: string): void {
    const conn = this.byOrg.get(orgId);
    if (conn) this.byOrg.set(orgId, { ...conn, isActive: false });
  }

  /** Return all configured connections (for admin listing). */
  list(): SsoConnection[] {
    return Array.from(this.byOrg.values());
  }
}

/** Singleton store instance. */
export const ssoConnectionStore = new SsoConnectionStore();

// ── WorkOS provider config ────────────────────────────────────────────────────

/**
 * WorkOS is the recommended enterprise SSO gateway.
 * It handles SAML/OIDC federation, directory sync, and audit trail
 * so we don't reimplement per-IdP flows.
 *
 * Set AUTH_PROVIDER=workos + WORKOS_CLIENT_ID + WORKOS_CLIENT_SECRET to enable.
 *
 * WorkOS — рекомендований шлюз для enterprise SSO; підтримує всіх провайдерів.
 */
export const WORKOS_PROVIDER_CONFIG = {
  /** true = use WorkOS as the SSO broker (default for production). */
  useWorkOs: (process.env.AUTH_PROVIDER ?? "dev") === "workos",
  /** Providers that WorkOS can federate on our behalf. */
  supportedProviders: [
    "saml",
    "oidc",
    "google-workspace",
    "microsoft-entra",
    "okta",
    "auth0",
  ] as SsoProvider[],
  /** WorkOS dashboard: https://dashboard.workos.com */
  dashboardUrl: "https://dashboard.workos.com",
  /** Discovery API endpoint for WorkOS-managed connections. */
  apiBase: "https://api.workos.com",
} as const;
