/**
 * SCIM 2.0 Groups endpoint.
 *
 * GET  /api/scim/v2/Groups — list groups
 * POST /api/scim/v2/Groups — create / sync a group
 *
 * Authentication: Bearer token via SCIM_TOKEN env var.
 *
 * SCIM 2.0 RFC 7644 — управління групами.
 */

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  scimStore,
  toScimGroupResource,
  scimListResponse,
  type ScimGroup,
} from "@/lib/enterprise/scim-provisioning";

export const dynamic = "force-dynamic";

// ── Auth helper ───────────────────────────────────────────────────────────────

function assertScimAuth(req: Request): boolean {
  const token = process.env.SCIM_TOKEN;
  if (!token) return true; // allow in dev if not configured
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${token}`;
}

function scimError(status: number, detail: string): NextResponse {
  return NextResponse.json(
    {
      schemas: ["urn:ietf:params:scim:api:messages:2.0:Error"],
      status,
      detail,
    },
    { status },
  );
}

// ── GET /api/scim/v2/Groups ───────────────────────────────────────────────────

/**
 * List groups for the org identified by the SCIM token.
 * Supports filter=displayName eq "<value>".
 *
 * Список SCIM-груп організації.
 */
export async function GET(req: Request) {
  if (!assertScimAuth(req)) return scimError(401, "Invalid or missing Bearer token");

  const orgId = process.env.SCIM_ORG_ID ?? "org-demo";
  const url = new URL(req.url);
  const startIndex = parseInt(url.searchParams.get("startIndex") ?? "1", 10);
  const count = Math.min(parseInt(url.searchParams.get("count") ?? "100", 10), 200);

  let groups = scimStore.getGroups(orgId);

  // Basic SCIM filter: filter=displayName eq "..."
  const filter = url.searchParams.get("filter");
  if (filter) {
    const match = filter.match(/displayName\s+eq\s+"([^"]+)"/i);
    if (match) {
      const wanted = match[1].toLowerCase();
      groups = groups.filter((g) => g.displayName.toLowerCase() === wanted);
    }
  }

  const offset = startIndex - 1;
  const page = groups.slice(offset, offset + count);

  return NextResponse.json(
    scimListResponse(page.map(toScimGroupResource), groups.length, startIndex),
    {
      headers: {
        "Content-Type": "application/scim+json",
        "Cache-Control": "no-store",
      },
    },
  );
}

// ── POST /api/scim/v2/Groups ──────────────────────────────────────────────────

/**
 * Create or update a group (upsert by displayName within org).
 *
 * Створює або оновлює SCIM-групу.
 */
export async function POST(req: Request) {
  if (!assertScimAuth(req)) return scimError(401, "Invalid or missing Bearer token");

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return scimError(400, "Invalid JSON body");
  }

  const orgId = process.env.SCIM_ORG_ID ?? "org-demo";

  const displayName = body.displayName as string | undefined;
  if (!displayName) return scimError(400, "displayName is required");

  const rawMembers = (body.members as { value: string; display?: string }[] | undefined) ?? [];

  const group: ScimGroup = {
    id: (body.id as string) || randomUUID(),
    displayName,
    members: rawMembers.map((m) => ({
      value: m.value,
      display: m.display ?? m.value,
    })),
    orgId,
  };

  const created = scimStore.syncGroup(group);

  return NextResponse.json(toScimGroupResource(created), {
    status: 201,
    headers: {
      "Content-Type": "application/scim+json",
      Location: `/api/scim/v2/Groups/${created.id}`,
    },
  });
}
