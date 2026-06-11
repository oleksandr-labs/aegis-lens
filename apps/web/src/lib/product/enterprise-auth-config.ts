/**
 * Enterprise Auth Config — SSO (SAML 2.0 + OIDC) and SCIM provisioning.
 *
 * Phase 3 feature for gov / enterprise customers who require federated
 * identity and automated user lifecycle management.
 *
 * SSO та SCIM для урядових/корпоративних клієнтів фази 3.
 */

'use server';

// ── Protocols ─────────────────────────────────────────────────────────────────

export type SsoProtocol = 'saml2' | 'oidc';

export const SSO_PROTOCOLS: SsoProtocol[] = ['saml2', 'oidc'];

// ── SCIM version ──────────────────────────────────────────────────────────────

export const SCIM_VERSION = '2.0' as const;

// ── SAML config ───────────────────────────────────────────────────────────────

export interface SamlConfig {
  /** SP entity ID — Ідентифікатор SP */
  entityId: string;
  /** ACS URL — URL ACS */
  assertionConsumerServiceUrl: string;
  /** Metadata endpoint — Метадані SP */
  metadataEndpoint: string;
  /** Supported name ID formats — Підтримувані формати NameID */
  nameIdFormats: string[];
  /** Signature algorithm — Алгоритм підпису */
  signatureAlgorithm: string;
}

// ── OIDC config ───────────────────────────────────────────────────────────────

export interface OidcConfig {
  /** Redirect URIs — URI перенаправлення */
  redirectUris: string[];
  /** Allowed scopes — Дозволені scopes */
  scopes: string[];
  /** Token endpoint auth method — Метод авторизації token endpoint */
  tokenEndpointAuthMethod: 'client_secret_post' | 'private_key_jwt';
  /** PKCE required — PKCE обов'язковий */
  pkceRequired: boolean;
}

// ── SCIM config ───────────────────────────────────────────────────────────────

export interface ScimConfig {
  version: typeof SCIM_VERSION;
  /** SCIM base URL — Базовий URL SCIM */
  baseUrl: string;
  /** Supported resources — Підтримувані ресурси */
  supportedResources: string[];
  /** Supported filter operators — Підтримувані оператори фільтру */
  supportedFilters: string[];
}

// ── Enterprise auth config ────────────────────────────────────────────────────

export interface EnterpriseAuthConfig {
  supportedProtocols: SsoProtocol[];
  saml: SamlConfig;
  oidc: OidcConfig;
  scim: ScimConfig;
  /** Just-in-time provisioning — Провізіонування JIT */
  jitProvisioning: boolean;
  /** Default role for SSO users — Роль за замовчуванням для SSO */
  defaultSsoRole: string;
  /** Session duration in hours — Тривалість сесії (год) */
  sessionDurationHours: number;
  /** Audit log retention in days — Зберігання аудит-логу (дні) */
  auditLogRetentionDays: number;
}

export const ENTERPRISE_AUTH_CONFIG: EnterpriseAuthConfig = {
  supportedProtocols: SSO_PROTOCOLS,
  saml: {
    entityId: 'https://app.aegislens.com/saml/metadata',
    assertionConsumerServiceUrl: 'https://app.aegislens.com/saml/acs',
    metadataEndpoint: 'https://app.aegislens.com/saml/metadata.xml',
    nameIdFormats: ['urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress'],
    signatureAlgorithm: 'RSA-SHA256',
  },
  oidc: {
    redirectUris: ['https://app.aegislens.com/auth/callback'],
    scopes: ['openid', 'email', 'profile', 'groups'],
    tokenEndpointAuthMethod: 'private_key_jwt',
    pkceRequired: true,
  },
  scim: {
    version: SCIM_VERSION,
    baseUrl: 'https://app.aegislens.com/scim/v2',
    supportedResources: ['Users', 'Groups'],
    supportedFilters: ['eq', 'ne', 'co', 'sw', 'ew', 'and', 'or'],
  },
  jitProvisioning: true,
  defaultSsoRole: 'analyst',
  sessionDurationHours: 8,
  auditLogRetentionDays: 365,
};

// ── Notes ─────────────────────────────────────────────────────────────────────

export const SSO_NOTE_EN =
  'SSO and SCIM are Phase 3 features gated to enterprise tier. ' +
  'SAML 2.0 and OIDC are both supported; customers choose their IdP.';

export const SSO_NOTE_UK =
  'SSO та SCIM — функції фази 3, доступні тільки для enterprise tier. ' +
  'Підтримуються SAML 2.0 та OIDC; клієнти обирають свій IdP.';
