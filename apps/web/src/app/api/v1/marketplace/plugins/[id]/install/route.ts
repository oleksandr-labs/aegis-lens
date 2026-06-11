/**
 * POST /api/v1/marketplace/plugins/:id/install
 *
 * Initiates the install flow for a plugin within an organisation.
 *
 * Request body (JSON):
 *   orgId       — organisation performing the install
 *   installedBy — user ID of the admin initiating the install
 *   grantedScopes — subset of plugin-declared scopes the org is granting
 *
 * Returns the InstallRecord with status "installing".
 * Call confirmInstall() from the sandbox validation webhook to transition to "active".
 *
 * POST: ініціює встановлення плагіну в організації.
 * Повертає InstallRecord зі статусом "installing".
 */

import { NextRequest, NextResponse } from "next/server";
import { installStore } from "../../../../../../lib/marketplace/install";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const pluginId = params.id;
  if (!pluginId) {
    return NextResponse.json({ error: "Missing plugin id in URL." }, { status: 400 });
  }

  let body: { orgId?: string; installedBy?: string; grantedScopes?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { orgId, installedBy, grantedScopes } = body;
  if (!orgId || !installedBy) {
    return NextResponse.json(
      { error: "Required fields: orgId, installedBy." },
      { status: 400 },
    );
  }

  // Check not already installed and active
  const existing = installStore.getRecord(orgId, pluginId);
  if (existing?.status === "active") {
    return NextResponse.json(
      { error: "Plugin is already active in this organisation." },
      { status: 409 },
    );
  }

  const record = installStore.install(
    orgId,
    pluginId,
    installedBy,
    grantedScopes ?? [],
  );

  return NextResponse.json(
    { object: "install_record", data: record },
    {
      status: 202,
      headers: { "Aegis-API-Version": "v1" },
    },
  );
}
