/**
 * DELETE /api/settings/api-keys/:id — revoke + delete an API key
 * PATCH  /api/settings/api-keys/:id — update name or revoke
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { getApiKeyById, revokeApiKey, deleteApiKey } from "@/lib/api-keys-store";

export const dynamic = "force-dynamic";

interface Ctx { params: Promise<{ id: string }> }

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const ip = identifyRequest(req);
  const rl = rateLimit(`api-keys:update:${ip}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const key = getApiKeyById(id);
  if (!key) return NextResponse.json({ error: "not_found" }, { status: 404 });

  let body: { revoke?: boolean; name?: string } = {};
  try { body = await req.json(); } catch { /* optional */ }

  if (body.revoke) {
    revokeApiKey(id);
  }
  if (body.name) {
    key.name = body.name.trim();
  }

  const { keyHash: _h, ...safeKey } = key;
  return NextResponse.json({ data: safeKey }, {
    headers: { "Access-Control-Allow-Origin": "*", ...rateLimitHeaders(rl) },
  });
}

export async function DELETE(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const ip = identifyRequest(req);
  const rl = rateLimit(`api-keys:delete:${ip}`, 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  if (!getApiKeyById(id)) return NextResponse.json({ error: "not_found" }, { status: 404 });

  deleteApiKey(id);
  return new Response(null, { status: 204 });
}
