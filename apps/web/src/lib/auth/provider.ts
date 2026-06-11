/**
 * Authentication provider abstraction.
 *
 * Supports three providers:
 *   workos — WorkOS AuthKit (enterprise SSO, SCIM, audit trail)
 *   clerk  — Clerk (quick setup, great DX, social login)
 *   dev    — Mock provider for local development (no external auth needed)
 *
 * Selection via AUTH_PROVIDER env var.
 * WorkOS is the recommended production choice for enterprise SAML/SCIM.
 *
 * Абстракція для вибору провайдера аутентифікації: WorkOS, Clerk або dev-мок.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type AuthProvider = "workos" | "clerk" | "dev";

export interface AuthConfig {
  provider: AuthProvider;
  clientId: string;
  /** OAuth redirect URI — must match the configured callback URL. */
  redirectUri: string;
  /** OAuth scopes to request. */
  scopes: string[];
}

export interface TokenExchangeResult {
  accessToken: string;
  refreshToken?: string;
  userId: string;
  email: string;
  orgId?: string;
  displayName?: string;
  expiresIn?: number;
}

// ── Provider-specific OAuth endpoint configs ──────────────────────────────────

const PROVIDER_CONFIGS: Record<
  Exclude<AuthProvider, "dev">,
  { authorizeUrl: string; tokenUrl: string; defaultScopes: string[] }
> = {
  workos: {
    authorizeUrl: "https://api.workos.com/sso/authorize",
    tokenUrl: "https://api.workos.com/sso/token",
    defaultScopes: ["openid", "profile", "email"],
  },
  clerk: {
    authorizeUrl: `https://${process.env.CLERK_DOMAIN ?? "accounts.aegislens.com"}/oauth/authorize`,
    tokenUrl: `https://${process.env.CLERK_DOMAIN ?? "accounts.aegislens.com"}/oauth/token`,
    defaultScopes: ["openid", "profile", "email"],
  },
};

// ── Config factory ─────────────────────────────────────────────────────────────

/**
 * Returns the auth configuration from environment variables.
 *
 * Required env vars per provider:
 *   workos: WORKOS_CLIENT_ID, WORKOS_CLIENT_SECRET, NEXT_PUBLIC_SITE_URL
 *   clerk:  CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, NEXT_PUBLIC_SITE_URL
 *   dev:    none (uses mock values)
 *
 * Повертає конфігурацію аутентифікації з env-змінних.
 */
export function getAuthConfig(): AuthConfig {
  const provider = (process.env.AUTH_PROVIDER ?? "dev") as AuthProvider;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (provider === "dev") {
    return {
      provider: "dev",
      clientId: "dev-client-id",
      redirectUri: `${siteUrl}/api/auth/callback`,
      scopes: ["openid", "profile", "email"],
    };
  }

  if (provider === "workos") {
    return {
      provider: "workos",
      clientId: process.env.WORKOS_CLIENT_ID ?? "",
      redirectUri: `${siteUrl}/api/auth/callback/workos`,
      scopes: ["openid", "profile", "email"],
    };
  }

  if (provider === "clerk") {
    return {
      provider: "clerk",
      clientId: process.env.CLERK_PUBLISHABLE_KEY ?? "",
      redirectUri: `${siteUrl}/api/auth/callback/clerk`,
      scopes: ["openid", "profile", "email"],
    };
  }

  throw new Error(`Unknown AUTH_PROVIDER: ${provider}`);
}

// ── URL builders ──────────────────────────────────────────────────────────────

/**
 * Builds the OAuth authorization URL to redirect the user to.
 *
 * @param state - CSRF state token (generate with crypto.randomBytes(32)).
 * @returns Authorization URL string.
 *
 * Будує URL для перенаправлення користувача на OAuth-провайдер.
 */
export function buildAuthUrl(state: string): string {
  const config = getAuthConfig();

  if (config.provider === "dev") {
    // In dev mode, redirect directly to the callback with a mock code
    return `/api/auth/callback/dev?code=dev_mock_code&state=${encodeURIComponent(state)}`;
  }

  const providerCfg = PROVIDER_CONFIGS[config.provider];
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: config.scopes.join(" "),
    state,
    // WorkOS: add connection/organization if known
    ...(config.provider === "workos" && process.env.WORKOS_CONNECTION_ID
      ? { connection: process.env.WORKOS_CONNECTION_ID }
      : {}),
  });

  return `${providerCfg.authorizeUrl}?${params.toString()}`;
}

// ── Token exchange ────────────────────────────────────────────────────────────

/**
 * Exchanges an OAuth authorization code for tokens and user info.
 *
 * @param code - The authorization code from the callback.
 * @returns TokenExchangeResult with accessToken and user identity.
 *
 * Обмінює код авторизації на токени.
 */
export async function exchangeCode(
  code: string,
): Promise<TokenExchangeResult> {
  const config = getAuthConfig();

  // Dev mock
  if (config.provider === "dev") {
    return {
      accessToken: `dev_token_${code}`,
      userId: "dev_user_001",
      email: "dev@aegislens.com",
      orgId: "dev_org_001",
      displayName: "Dev User",
      expiresIn: 3600,
    };
  }

  const providerCfg = PROVIDER_CONFIGS[config.provider];
  const secret =
    config.provider === "workos"
      ? (process.env.WORKOS_CLIENT_SECRET ?? "")
      : (process.env.CLERK_SECRET_KEY ?? "");

  const response = await fetch(providerCfg.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: secret,
      redirect_uri: config.redirectUri,
      grant_type: "authorization_code",
      code,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token exchange failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    user?: { id: string; email: string; firstName?: string; lastName?: string };
    profile?: { sub: string; email: string; name?: string };
    expires_in?: number;
  };

  // Normalise across providers
  const userId = data.user?.id ?? data.profile?.sub ?? "";
  const email = data.user?.email ?? data.profile?.email ?? "";
  const displayName =
    data.user?.firstName
      ? `${data.user.firstName} ${data.user.lastName ?? ""}`.trim()
      : (data.profile?.name ?? undefined);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    userId,
    email,
    displayName,
    expiresIn: data.expires_in,
  };
}
