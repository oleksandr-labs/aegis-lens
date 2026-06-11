/**
 * SCIM 2.0 Users endpoint.
 *
 * GET  /api/scim/v2/Users — list users (with optional filter)
 * POST /api/scim/v2/Users — provision a new user
 *
 * Authentication: Bearer token via SCIM_TOKEN env var.
 * Rate: 60 req/min per token.
 *
 * SCIM 2.0 RFC 7644 — управління користувачами.
 */

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  scimStore,
  toScimUserResource,
  scimListResponse,
  type ScimUser,
} from "@/lib/enterprise/scim-provisioning";

export const dynamic = "force-dynamic";

// ── Auth helper ───────────────────────────────────────────────────────────────

function assertScimAuth(req: Request): boolean {
  const token = process.env.SCIM_TOKEN;
  if (!token) return true; // allow in dev if not configured
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${token}`;
}

function scimError(
  status: number,
  detail: string,
): NextResponse {
  return NextResponse.json(
    {
      schemas: ["urn:ietf:params:scim:api:messages:2.0:Error"],
      status,
      detail,
    },
    { status },
  );
}

// ── GET /api/scim/v2/Users ────────────────────────────────────────────────────

/**
 * List users for the org identified by the SCIM token.
 * Supports filter=userName eq "<value>" (basic, per RFC 7644).
 *
 * Список SCIM-користувачів організації.
 */
export async function GET(req: Request) {
  if (!assertScimAuth(req)) return scimError(401, "Invalid or missing Bearer token");

  const orgId = process.env.SCIM_ORG_ID ?? "org-demo";
  const url = new URL(req.url);
  const startIndex = parseInt(url.searchParams.get("startIndex") ?? "1", 10);
  const count = Math.min(parseInt(url.searchParams.get("count") ?? "100", 10), 200);

  let users = scimStore.getUsers(orgId);

  // Basic SCIM filter: filter=userName eq "..."
  const filter = url.searchParams.get("filter");
  if (filter) {
    const match = filter.match(/userName\s+eq\s+"([^"]+)"/i);
    if (match) {
      const wanted = match[1].toLowerCase();
      users = users.filter((u) => u.userName.toLowerCase() === wanted);
    }
  }

  const offset = startIndex - 1;
  const page = users.slice(offset, offset + count);

  return NextResponse.json(
    scimListResponse(page.map(toScimUserResource), users.length, startIndex),
    {
      headers: {
        "Content-Type": "application/scim+json",
        "Cache-Control": "no-store",
      },
    },
  );
}

// ── POST /api/scim/v2/Users ───────────────────────────────────────────────────

/**
 * Provision a new user (or update existing, matched by externalId).
 *
 * Провізіонує нового SCIM-користувача.
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

  const userName = body.userName as string | undefined;
  if (!userName) return scimError(400, "userName is required");

  const emailList = (body.emails as { value: string; primary?: boolean }[] | undefined) ?? [];
  const primaryEmail = emailList.find((e) => e.primary)?.value ?? emailList[0]?.value ?? "";

  const user: ScimUser = {
    id: randomUUID(),
    externalId: (body.externalId as string) ?? "",
    userName,
    displayName: (body.displayName as string) ?? userName,
    emails: emailList.map((e) => ({ value: e.value, primary: Boolean(e.primary) })),
    groups: [],
    active: (body.active as boolean) !== false,
    orgId,
  };

  const created = scimStore.syncUser(user);

  return NextResponse.json(toScimUserResource(created), {
    status: 201,
    headers: {
      "Content-Type": "application/scim+json",
      Location: `/api/scim/v2/Users/${created.id}`,
    },
  });
}
