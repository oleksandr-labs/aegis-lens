/**
 * JWT validation for the API Gateway layer.
 *
 * Supports:
 *   1. Bearer JWT (RS256 / ES256) — for user sessions
 *   2. API Key (ak_...) — for machine-to-machine
 *
 * JWKS rotation: keys fetched from /.well-known/jwks.json and cached.
 */

import "server-only";

export interface JWTPayload {
  sub: string;       // user_id
  org: string;       // org_id
  tier: string;      // free | pro | enterprise
  email?: string;
  persona?: string;
  iat: number;
  exp: number;
  jti?: string;      // JWT ID for revocation
}

export interface AuthResult {
  authenticated: boolean;
  userId?: string;
  orgId?: string;
  tier?: string;
  authMethod?: "jwt" | "api_key" | "none";
  error?: string;
}

// ── JWKS cache ────────────────────────────────────────────────────────────

let jwksCache: Record<string, CryptoKey> | null = null;
let jwksCachedAt = 0;
const JWKS_TTL_MS = 3600_000; // 1 hour

async function getJWKS(): Promise<Record<string, CryptoKey>> {
  const now = Date.now();
  if (jwksCache && now - jwksCachedAt < JWKS_TTL_MS) return jwksCache;

  const jwksUrl = process.env.JWKS_URL ?? "https://auth.aegislens.com/.well-known/jwks.json";
  try {
    const res = await fetch(jwksUrl, { next: { revalidate: 3600 } });
    const { keys } = await res.json() as { keys: JsonWebKey[] };
    const imported: Record<string, CryptoKey> = {};
    for (const key of keys) {
      if (!key.kid) continue;
      const cryptoKey = await crypto.subtle.importKey(
        "jwk",
        key,
        key.alg === "RS256" ? { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" } : { name: "ECDSA", namedCurve: "P-256" },
        false,
        ["verify"],
      );
      imported[key.kid] = cryptoKey;
    }
    jwksCache = imported;
    jwksCachedAt = now;
    return imported;
  } catch {
    return {};
  }
}

// ── JWT verification ──────────────────────────────────────────────────────

function base64urlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

export async function verifyJWT(token: string): Promise<{ ok: true; payload: JWTPayload } | { ok: false; error: string }> {
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, error: "Malformed JWT" };

  const [headerB64, payloadB64, sigB64] = parts;

  let header: { alg: string; kid?: string };
  let payload: JWTPayload;
  try {
    header = JSON.parse(new TextDecoder().decode(base64urlDecode(headerB64)));
    payload = JSON.parse(new TextDecoder().decode(base64urlDecode(payloadB64)));
  } catch {
    return { ok: false, error: "Invalid JWT structure" };
  }

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return { ok: false, error: "JWT expired" };
  }

  // Verify signature
  const jwks = await getJWKS();
  const key = header.kid ? jwks[header.kid] : Object.values(jwks)[0];
  if (!key) {
    // In dev: skip signature check if no JWKS configured
    if (process.env.NODE_ENV === "development" || process.env.SKIP_JWT_VERIFY === "true") {
      return { ok: true, payload };
    }
    return { ok: false, error: "No matching key found in JWKS" };
  }

  const dataToVerify = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signature = base64urlDecode(sigB64);

  const algorithm = header.alg === "RS256"
    ? { name: "RSASSA-PKCS1-v1_5" }
    : { name: "ECDSA", hash: "SHA-256" };

  const valid = await crypto.subtle.verify(algorithm, key, signature, dataToVerify);
  if (!valid) return { ok: false, error: "Invalid JWT signature" };

  return { ok: true, payload };
}

// ── API key validation ────────────────────────────────────────────────────

export async function validateApiKey(key: string): Promise<AuthResult> {
  if (!key.startsWith("ak_")) {
    return { authenticated: false, error: "Invalid API key format" };
  }

  // Production: hash the key and look up in api_keys table
  // For now: accept any ak_ key in development
  if (process.env.NODE_ENV === "development") {
    const tier = key.startsWith("ak_ent_") ? "enterprise"
      : key.startsWith("ak_pro_") ? "pro"
      : "free";
    return { authenticated: true, userId: "dev-user", orgId: "dev-org", tier, authMethod: "api_key" };
  }

  try {
    const res = await fetch(`${process.env.INTERNAL_AUTH_URL ?? ""}/internal/validate-api-key`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Secret": process.env.INTERNAL_SECRET ?? "",
      },
      body: JSON.stringify({ key }),
    });
    if (!res.ok) return { authenticated: false, error: "Invalid API key" };
    const { userId, orgId, tier } = await res.json();
    return { authenticated: true, userId, orgId, tier, authMethod: "api_key" };
  } catch {
    return { authenticated: false, error: "Auth service unavailable" };
  }
}

// ── Extract auth from request ─────────────────────────────────────────────

export async function authenticateRequest(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get("authorization") ?? "";

  if (authHeader.startsWith("Bearer ak_")) {
    return validateApiKey(authHeader.slice(7));
  }

  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const result = await verifyJWT(token);
    if (!result.ok) return { authenticated: false, error: result.error };
    return {
      authenticated: true,
      userId: result.payload.sub,
      orgId: result.payload.org,
      tier: result.payload.tier,
      authMethod: "jwt",
    };
  }

  // Check cookie (web app sessions)
  const cookieHeader = req.headers.get("cookie") ?? "";
  const sessionMatch = cookieHeader.match(/aegis_session=([^;]+)/);
  if (sessionMatch) {
    const result = await verifyJWT(sessionMatch[1]);
    if (result.ok) {
      return {
        authenticated: true,
        userId: result.payload.sub,
        orgId: result.payload.org,
        tier: result.payload.tier,
        authMethod: "jwt",
      };
    }
  }

  return { authenticated: false, authMethod: "none" };
}
