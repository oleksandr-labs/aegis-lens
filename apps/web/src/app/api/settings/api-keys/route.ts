/**
 * GET  /api/settings/api-keys  — list caller's API keys
 * POST /api/settings/api-keys  — create a new API key
 *
 * The raw key is returned in POST only and never retrievable again.
 *
 * Rate: 30/min/IP
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { listApiKeys, createApiKey, ALL_SCOPES } from "@/lib/api-keys-store";

export const dynamic = "force-dynamic";

// Demo: treat IP as a stable "userId" for the in-memory demo
function demoOwner(ip: string) {
  return { ownerId: `user-${ip.replace(/\./g, "-")}`, orgId: "org-demo" };
}

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`api-keys:list:${ip}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const { ownerId } = demoOwner(ip);
  const keys = listApiKeys(ownerId).map(({ keyHash: _h, ...rest }) => rest); // strip hash

  return NextResponse.json(
    { data: keys, meta: { count: keys.length } },
    { headers: { "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*", ...rateLimitHeaders(rl) } },
  );
}

export async function POST(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`api-keys:create:${ip}`, 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const input = body as { name?: string; scopes?: string[]; expiresInDays?: number };
  if (!input.name?.trim()) {
    return NextResponse.json({ error: "validation", message: "name is required" }, { status: 422 });
  }

  // Validate scopes
  const requestedScopes = input.scopes ?? ["events:read", "search:read"];
  const invalidScopes = requestedScopes.filter((s) => !(ALL_SCOPES as readonly string[]).includes(s));
  if (invalidScopes.length > 0) {
    return NextResponse.json({ error: "validation", message: `Invalid scopes: ${invalidScopes.join(", ")}` }, { status: 422 });
  }

  const { ownerId, orgId } = demoOwner(ip);
  const { key, rawKey } = createApiKey({
    name: input.name.trim(),
    ownerId,
    orgId,
    scopes: requestedScopes,
    expiresInDays: input.expiresInDays,
  });

  const { keyHash: _h, ...safeKey } = key;

  return NextResponse.json(
    {
      data: { ...safeKey, key: rawKey },
      meta: { warning: "This is the only time the full API key is shown. Store it securely." },
    },
    {
      status: 201,
      headers: { "Access-Control-Allow-Origin": "*", ...rateLimitHeaders(rl) },
    },
  );
}
