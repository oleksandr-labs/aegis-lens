/**
 * WebAuthn / Passkeys support for Aegis Lens.
 *
 * Relying Party: aegislens.io
 * Library target: @simplewebauthn/server (server-side)
 *                 @simplewebauthn/browser (client-side, import separately)
 *
 * Flows:
 *   Registration  — user adds a new passkey / hardware key
 *   Authentication — user signs in with an existing passkey
 *
 * For enterprise tier: WebAuthn is REQUIRED alongside TOTP.
 * For pro tier: WebAuthn is an optional upgrade over TOTP.
 *
 * Sprint 2.73 — auth security implementation.
 * @see https://simplewebauthn.dev/docs/packages/server
 */

import "server-only";

// ── Relying Party Config ──────────────────────────────────────────────────────

export interface WebAuthnConfig {
  /** Relying Party name shown in authenticator dialogs */
  rpName: string;
  /** Relying Party ID — must match the domain (or parent domain) of the origin */
  rpId: string;
  /** Allowed origins (scheme + host + port) */
  origin: string | string[];
  /** User verification requirement */
  userVerification: "required" | "preferred" | "discouraged";
  /** Authenticator attachment filter */
  authenticatorAttachment?: "platform" | "cross-platform";
  /** Timeout in milliseconds for the browser prompt */
  timeout: number;
}

export const AEGIS_WEBAUTHN_CONFIG: WebAuthnConfig = {
  rpName: "Aegis Lens",
  rpId: process.env.WEBAUTHN_RP_ID ?? "aegislens.io",
  origin: process.env.WEBAUTHN_ORIGIN ?? "https://aegislens.io",
  userVerification: "required",
  timeout: 60_000,
};

// ── Credential types ──────────────────────────────────────────────────────────

export interface WebAuthnCredential {
  credentialId: string;           // base64url encoded
  credentialPublicKey: string;    // base64url encoded COSE public key
  counter: number;
  transports?: AuthenticatorTransport[];
  deviceType: "singleDevice" | "multiDevice";
  backedUp: boolean;
  userId: string;
  createdAt: Date;
  lastUsedAt: Date | null;
  deviceName: string;
}

export type AuthenticatorTransport = "usb" | "ble" | "nfc" | "internal" | "hybrid" | "smart-card";

// ── Registration ──────────────────────────────────────────────────────────────

export interface RegistrationOptions {
  challenge: string;              // base64url
  rp: { name: string; id: string };
  user: { id: string; name: string; displayName: string };
  pubKeyCredParams: Array<{ alg: number; type: "public-key" }>;
  timeout: number;
  attestation: "none" | "indirect" | "direct" | "enterprise";
  authenticatorSelection: {
    userVerification: string;
    residentKey: string;
    requireResidentKey: boolean;
  };
  excludeCredentials: Array<{ id: string; type: "public-key" }>;
}

export interface RegistrationResponse {
  id: string;
  rawId: string;
  response: {
    clientDataJSON: string;
    attestationObject: string;
    transports?: string[];
  };
  type: "public-key";
}

export interface RegistrationVerificationResult {
  verified: boolean;
  credential?: WebAuthnCredential;
  error?: string;
}

/**
 * Generate registration options for a new WebAuthn credential.
 *
 * Production:
 *   import { generateRegistrationOptions } from "@simplewebauthn/server";
 *   return generateRegistrationOptions({ ... });
 */
export async function generateRegistrationOptions(opts: {
  userId: string;
  userEmail: string;
  userName: string;
  existingCredentials?: WebAuthnCredential[];
}): Promise<RegistrationOptions> {
  const challenge = generateChallenge();

  // Store challenge in session / Redis with 5-minute TTL
  // await challengeStore.set(opts.userId, challenge, { ttl: 300 });

  return {
    challenge,
    rp: {
      name: AEGIS_WEBAUTHN_CONFIG.rpName,
      id: AEGIS_WEBAUTHN_CONFIG.rpId,
    },
    user: {
      id: opts.userId,
      name: opts.userEmail,
      displayName: opts.userName,
    },
    pubKeyCredParams: [
      { alg: -7, type: "public-key" },   // ES256
      { alg: -257, type: "public-key" }, // RS256
    ],
    timeout: AEGIS_WEBAUTHN_CONFIG.timeout,
    attestation: "none",
    authenticatorSelection: {
      userVerification: AEGIS_WEBAUTHN_CONFIG.userVerification,
      residentKey: "preferred",
      requireResidentKey: false,
    },
    excludeCredentials: (opts.existingCredentials ?? []).map((c) => ({
      id: c.credentialId,
      type: "public-key" as const,
    })),
  };
}

/**
 * Verify a registration response from the browser.
 *
 * Production:
 *   import { verifyRegistrationResponse } from "@simplewebauthn/server";
 *   const verification = await verifyRegistrationResponse({
 *     response, expectedChallenge, expectedOrigin, expectedRPID, requireUserVerification: true,
 *   });
 */
export async function verifyRegistrationResponse(opts: {
  response: RegistrationResponse;
  expectedChallenge: string;
  userId: string;
  deviceName: string;
}): Promise<RegistrationVerificationResult> {
  // TODO: replace stub with real @simplewebauthn/server call
  // const { verified, registrationInfo } = await simpleVerifyRegistration({ ... });

  void opts;
  return {
    verified: true,
    credential: {
      credentialId: opts.response.id,
      credentialPublicKey: opts.response.response.attestationObject,
      counter: 0,
      transports: (opts.response.response.transports ?? []) as AuthenticatorTransport[],
      deviceType: "singleDevice",
      backedUp: false,
      userId: opts.userId,
      createdAt: new Date(),
      lastUsedAt: null,
      deviceName: opts.deviceName,
    },
  };
}

// ── Authentication ────────────────────────────────────────────────────────────

export interface AuthenticationOptions {
  challenge: string;
  timeout: number;
  rpId: string;
  allowCredentials: Array<{ id: string; type: "public-key"; transports?: string[] }>;
  userVerification: string;
}

export interface AuthenticationResponse {
  id: string;
  rawId: string;
  response: {
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
    userHandle?: string;
  };
  type: "public-key";
}

export interface AuthenticationVerificationResult {
  verified: boolean;
  newCounter?: number;
  userId?: string;
  error?: string;
}

/**
 * Generate authentication options for a sign-in challenge.
 */
export async function generateAuthenticationOptions(opts: {
  userId?: string;
  allowedCredentials?: WebAuthnCredential[];
}): Promise<AuthenticationOptions> {
  const challenge = generateChallenge();
  // await challengeStore.set(opts.userId ?? "anon", challenge, { ttl: 300 });

  return {
    challenge,
    timeout: AEGIS_WEBAUTHN_CONFIG.timeout,
    rpId: AEGIS_WEBAUTHN_CONFIG.rpId,
    allowCredentials: (opts.allowedCredentials ?? []).map((c) => ({
      id: c.credentialId,
      type: "public-key" as const,
      transports: c.transports,
    })),
    userVerification: AEGIS_WEBAUTHN_CONFIG.userVerification,
  };
}

/**
 * Verify an authentication response from the browser.
 */
export async function verifyAuthenticationResponse(opts: {
  response: AuthenticationResponse;
  expectedChallenge: string;
  credential: WebAuthnCredential;
}): Promise<AuthenticationVerificationResult> {
  // TODO: replace with real @simplewebauthn/server call
  // const { verified, authenticationInfo } = await simpleVerifyAuthentication({ ... });
  // Update credential.counter to authenticationInfo.newCounter in DB

  void opts;
  return {
    verified: true,
    newCounter: opts.credential.counter + 1,
    userId: opts.credential.userId,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateChallenge(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString("base64url");
}

/**
 * Dependencies to install:
 *
 *   pnpm add @simplewebauthn/server @simplewebauthn/browser
 *
 * Server routes required:
 *   POST /api/auth/webauthn/register/options   → generateRegistrationOptions()
 *   POST /api/auth/webauthn/register/verify    → verifyRegistrationResponse()
 *   POST /api/auth/webauthn/auth/options       → generateAuthenticationOptions()
 *   POST /api/auth/webauthn/auth/verify        → verifyAuthenticationResponse()
 *
 * DB table: webauthn_credentials (credentialId PK, publicKey, counter, userId FK, ...)
 */
