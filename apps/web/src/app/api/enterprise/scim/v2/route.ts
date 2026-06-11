/**
 * SCIM 2.0 base route — service provider configuration.
 *
 * GET /api/enterprise/scim/v2
 *   Returns the SCIM ServiceProviderConfig document (RFC 7644 §4).
 *   IdP directories (WorkOS, Okta, Entra) query this to discover
 *   supported features before provisioning.
 *
 * Full SCIM endpoints:
 *   /api/scim/v2/Users  — GET (list), POST (create)
 *   /api/scim/v2/Groups — GET (list), POST (create)
 *
 * SCIM базовий маршрут: ServiceProviderConfig.
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * SCIM 2.0 Service Provider Configuration.
 * Advertises which features our SCIM implementation supports.
 *
 * Конфігурація SCIM-провайдера: які можливості підтримуються.
 */
export async function GET() {
  const config = {
    schemas: ["urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig"],
    documentationUri: "https://aegislens.com/docs/scim",
    patch: { supported: false },
    bulk: { supported: false, maxOperations: 0, maxPayloadSize: 0 },
    filter: { supported: true, maxResults: 200 },
    changePassword: { supported: false },
    sort: { supported: false },
    etag: { supported: false },
    authenticationSchemes: [
      {
        name: "OAuth Bearer Token",
        description: "Authentication scheme using the OAuth Bearer Token standard",
        specUri: "http://www.rfc-editor.org/info/rfc6750",
        type: "oauthbearertoken",
        primary: true,
      },
    ],
    meta: {
      location: "/api/enterprise/scim/v2",
      resourceType: "ServiceProviderConfig",
      created: "2026-01-01T00:00:00Z",
      lastModified: new Date().toISOString(),
      version: "W/\"1\"",
    },
  };

  return NextResponse.json(config, {
    headers: {
      "Content-Type": "application/scim+json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
