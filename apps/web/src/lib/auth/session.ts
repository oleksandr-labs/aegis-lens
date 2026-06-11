import "server-only";
/**
 * Session management using signed JWT cookies.
 *
 * Delegates JWT minting and verification to apps/web/src/lib/jwt.ts.
 * Sessions are stored as HTTPOnly, Secure, SameSite=Lax cookies.
 *
 * Session cookie name: aegis_session
 * Session duration:    7 days (configurable via SESSION_DURATION_DAYS env)
 *
 * Управління сесіями через підписані JWT-куки:
 * createSession, getSession, destroySession.
 */

import { cookies } from "next/headers";
import { type JWTPayload } from "@/lib/jwt";

// ── Constants ─────────────────────────────────────────────────────────────────

export const SESSION_COOKIE_NAME = "aegis_session";
const SESSION_DURATION_DAYS = Number(process.env.SESSION_DURATION_DAYS ?? 7);
const SESSION_DURATION_SECONDS = SESSION_DURATION_DAYS * 24 * 60 * 60;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Session {
  userId: string;
  orgId: string;
  email: string;
  tier: string;
  displayName?: string;
  /** ISO expiry timestamp. */
  expiresAt: string;
}

// ── JWT mint helper ───────────────────────────────────────────────────────────

/**
 * Signs a session payload as a HS256 JWT using JWT_SECRET env var.
 * Lightweight HMAC variant — delegates to the same pattern as jwt.ts for
 * consistency but uses a symmetric key (no JWKS needed for session tokens).
 *
 * Підписує сесійний JWT через HS256 + JWT_SECRET.
 */
async function signSessionJwt(payload: Record<string, unknown>): Promise<string> {
  const secret = process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET ?? "dev-secret-replace";
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const body = btoa(JSON.stringify(payload))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const data = `${header}.${body}`;
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const sigBase64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  return `${data}.${sigBase64}`;
}

/**
 * Verifies a HS256 session JWT and returns the payload, or null if invalid.
 *
 * Верифікує HS256 JWT і повертає payload або null.
 */
async function verifySessionJwt(
  token: string,
): Promise<Record<string, unknown> | null> {
  try {
    const [headerB64, bodyB64, sigB64] = token.split(".");
    if (!headerB64 || !bodyB64 || !sigB64) return null;

    const secret = process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET ?? "dev-secret-replace";
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );

    const data = `${headerB64}.${bodyB64}`;
    const sigBytes = Uint8Array.from(
      atob(sigB64.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0),
    );

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      encoder.encode(data),
    );
    if (!valid) return null;

    const payload = JSON.parse(
      atob(bodyB64.replace(/-/g, "+").replace(/_/g, "/")),
    ) as Record<string, unknown>;

    // Check expiry
    const exp = payload.exp as number | undefined;
    if (exp && Date.now() / 1000 > exp) return null;

    return payload;
  } catch {
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Creates a session cookie for the authenticated user.
 *
 * Call this after successful OAuth token exchange.
 *
 * @param session - Session data to encode.
 *
 * Створює сесійну куку після успішної авторизації.
 */
export async function createSession(session: Session): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload & Record<string, unknown> = {
    sub: session.userId,
    org: session.orgId,
    tier: session.tier,
    email: session.email,
    iat: now,
    exp: now + SESSION_DURATION_SECONDS,
    ...(session.displayName ? { name: session.displayName } : {}),
  };

  const token = await signSessionJwt(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION_SECONDS,
    path: "/",
  });
}

/**
 * Retrieves and verifies the current session from the request cookie.
 *
 * Returns null if no session cookie is present or the cookie is invalid/expired.
 *
 * Читає та верифікує поточну сесію з куки.
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifySessionJwt(token);
  if (!payload) return null;

  return {
    userId: (payload.sub as string) ?? "",
    orgId: (payload.org as string) ?? "",
    email: (payload.email as string) ?? "",
    tier: (payload.tier as string) ?? "free",
    displayName: payload.name as string | undefined,
    expiresAt: new Date(((payload.exp as number) ?? 0) * 1000).toISOString(),
  };
}

/**
 * Destroys the current session by clearing the session cookie.
 *
 * Видаляє сесійну куку (logout).
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
